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

## Development

To sync the latest theme files from the web package:

```bash
yarn sync
```
