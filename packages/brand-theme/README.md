# @david-ding/brand-theme

Brand theme CSS tokens for ai-playground, built on Tailwind CSS v4 `@theme` directives.

## Usage

```css
/* Import a brand theme — requires Tailwind CSS v4 */
@import '@david-ding/brand-theme/themes/brand-a.css';
@import '@david-ding/brand-theme/themes/brand-b.css';
```

Then use the CSS custom properties in your markup:

```jsx
<button className="bg-btn-primary text-btn-foreground">Submit</button>
```

## Available Themes

| File | Palette |
|------|---------|
| `themes/brand-a.css` | Indigo / Gray / Red / Green |
| `themes/brand-b.css` | Blue / Stone / Rose / Emerald |

## Publishing

### Prerequisites

1. A GitHub [classic PAT](https://github.com/settings/tokens) with `write:packages` scope
2. Set the token as an environment variable:

```bash
export NODE_AUTH_TOKEN=ghp_...
```

### Via CI (recommended)

Push a tag matching `brand-theme-v*`:

```bash
git tag brand-theme-v0.1.0
git push origin brand-theme-v0.1.0
```

The `.github/workflows/publish-brand-theme.yml` workflow will sync themes, build, and publish.

### Via CLI

```bash
yarn brand-theme:publish
```

This syncs the latest themes from the web package, then publishes to GitHub Packages. Bump the `version` field in `package.json` before publishing.

## Development

The theme CSS files are authored directly in `themes/`. When the web package is built, the Vite plugin copies the active brand's theme from the installed `@david-ding/brand-theme` package into `gen/brand.css`.
