# ai-playground

## Monorepo Structure

- **packages/web/** - Vite/React frontend (`@ai-playground/web`)
- **packages/server/** - Express backend (`@ai-playground/server`)
- **packages/mcp-api-tool/** - MCP API tool (`@ai-playground/mcp-api-tool`)

## Tech Stack

- **Framework:** React 19 with TypeScript 7
- **Build:** Vite 8
- **Package Manager:** Yarn 4 (workspaces)
- **Styling:** Tailwind CSS v4
- **Linting:** oxlint (not ESLint)
- **Formatting:** Prettier
- **Testing:** None configured

## Code Style

- Functional components with hooks (no class components)
- PascalCase for components, camelCase for everything else
- Named exports preferred over default exports
- Props typed with `interface`, not `type`
- Tailwind utility classes for styling (no CSS modules or styled-components)
- Semicolons required
- Single quotes for strings
- Prettier used for formatting
- Exact npm package versions in `package.json` (no `^`, `~`, or `*` ranges)

## Useful Commands

- **Dev server:** `yarn dev`
- **Build:** `yarn build` (Vite)
- **Lint:** `yarn lint` (oxlint)
- **Format:** `yarn format` (Prettier)
- **Server dev:** `yarn server:dev`
- **Server start:** `yarn server:start`
- **Server typecheck:** `yarn server:typecheck`
- **Run script in a package:** `yarn workspace <name> <script>`
- **Test:** Not configured (no test framework installed)
