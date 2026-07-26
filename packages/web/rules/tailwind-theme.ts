const BUILT_IN_COLORS = [
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia',
  'pink', 'rose',
] as const;

interface RuleOptions {
  allowedColors?: string[];
  additionalColors?: string[];
}

interface AstNode {
  type: string;
}

interface LiteralNode extends AstNode {
  type: 'Literal';
  value: unknown;
}

interface TemplateElementNode extends AstNode {
  type: 'TemplateElement';
  value: { raw: string; cooked: string };
}

interface TemplateLiteralNode extends AstNode {
  type: 'TemplateLiteral';
  quasis: TemplateElementNode[];
  expressions: ExpressionNode[];
}

interface ConditionalExpressionNode extends AstNode {
  type: 'ConditionalExpression';
  test: ExpressionNode;
  consequent: ExpressionNode;
  alternate: ExpressionNode;
}

interface LogicalExpressionNode extends AstNode {
  type: 'LogicalExpression';
  left: ExpressionNode;
  right: ExpressionNode;
  operator: string;
}

interface JSXAttributeNode extends AstNode {
  type: 'JSXAttribute';
  name: { name: string; type: string };
  value: LiteralNode | TemplateLiteralNode | JSXExpressionContainerNode | null;
}

interface JSXExpressionContainerNode extends AstNode {
  type: 'JSXExpressionContainer';
  expression: ExpressionNode;
}

type ExpressionNode =
  | LiteralNode
  | TemplateLiteralNode
  | ConditionalExpressionNode
  | LogicalExpressionNode;

interface RuleContext {
  options: unknown[];
  report(descriptor: { node: AstNode; message: string }): void;
}

interface RuleModule {
  meta: {
    type: 'suggestion';
    docs: { description: string };
    schema: object[];
  };
  create(context: RuleContext): { JSXAttribute(node: JSXAttributeNode): void };
}

interface Plugin {
  meta: { name: string };
  rules: Record<string, RuleModule>;
}

function hasConcreteColor(
  className: string,
  colors: Set<string>,
  allowed: Set<string>,
): boolean {
  const parts = className.split(/[-/]/);
  return parts.some((part) => !allowed.has(part) && colors.has(part));
}

function getLiteralText(node: ExpressionNode): string | null {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
  return null;
}

function checkClassesInText(
  text: string,
  colors: Set<string>,
  allowed: Set<string>,
  node: AstNode,
  context: RuleContext,
): void {
  for (const cls of text.split(/\s+/)) {
    if (!cls) continue;

    let base = cls;
    while (base.includes(':')) {
      base = base.slice(base.indexOf(':') + 1);
    }

    if (hasConcreteColor(base, colors, allowed)) {
      context.report({
        node,
        message: `Use a theme token instead of a concrete Tailwind color: '${cls}'`,
      });
    }
  }
}

const rule: RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow concrete Tailwind color utilities in favor of theme design tokens',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedColors: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Color names to allow (e.g., transparent, white, black)',
          },
          additionalColors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional color names to flag',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] as RuleOptions | undefined;
    const allowed = new Set(
      options?.allowedColors ?? [
        'transparent',
        'current',
        'inherit',
        'white',
        'black',
      ],
    );
    const colors = new Set([
      ...BUILT_IN_COLORS,
      ...(options?.additionalColors ?? []),
    ]);

    function checkNode(exprNode: ExpressionNode, reportNode: AstNode): void {
      const text = getLiteralText(exprNode);
      if (text !== null) {
        checkClassesInText(text, colors, allowed, reportNode, context);
        return;
      }

      if (exprNode.type === 'TemplateLiteral') {
        for (const quasi of exprNode.quasis) {
          if (quasi.value?.raw) {
            checkClassesInText(
              quasi.value.raw,
              colors,
              allowed,
              reportNode,
              context,
            );
          }
        }
        for (const expr of exprNode.expressions) {
          checkNode(expr, reportNode);
        }
        return;
      }

      if (exprNode.type === 'ConditionalExpression') {
        checkNode(exprNode.consequent, reportNode);
        checkNode(exprNode.alternate, reportNode);
      } else if (exprNode.type === 'LogicalExpression') {
        checkNode(exprNode.right, reportNode);
        checkNode(exprNode.left, reportNode);
      }
    }

    return {
      JSXAttribute(node: JSXAttributeNode) {
        if (node.name.name !== 'className') return;

        const value = node.value;
        if (!value) return;

        if (value.type === 'Literal' || value.type === 'TemplateLiteral') {
          checkNode(value, value);
        } else if (value.type === 'JSXExpressionContainer') {
          checkNode(value.expression, value);
        }
      },
    };
  },
};

const plugin: Plugin = {
  meta: { name: 'tailwind-theme' },
  rules: { 'no-concrete-colors': rule },
};

export default plugin;
