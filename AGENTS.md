# ai-playground

## Tech Stack

- **Framework:** React 19 with TypeScript 7
- **Build:** Vite 8
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

- **Lint:** `npm run lint` (uses oxlint, not ESLint)
- **Format:** `npm run format` (Prettier)
- **Test:** Not configured (no test framework installed)
