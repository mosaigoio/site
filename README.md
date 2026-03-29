# site

[![CI](https://github.com/mosaigoio/site/actions/workflows/ci.yml/badge.svg)](https://github.com/mosaigoio/site/actions/workflows/ci.yml)
[![Deploy](https://github.com/mosaigoio/site/actions/workflows/pages.yml/badge.svg)](https://github.com/mosaigoio/site/actions/workflows/pages.yml)
![Astro](https://img.shields.io/badge/Astro-4.x-BC52EE?logo=astro&logoColor=white)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

Documentation and landing pages for the mosaigoio projects. Built with [Starlight](https://starlight.astro.build) (Astro), deployed to [mosaigo.io](https://mosaigo.io) via GitHub Pages.

## What's Here

**Landing pages** (`src/pages/`) — standalone Astro pages for each project:

| Page | URL | Description |
|------|-----|-------------|
| `index.astro` | [mosaigo.io](https://mosaigo.io) | mosaigo pipeline framework |
| `mosoptics.astro` | [mosaigo.io/mosoptics](https://mosaigo.io/mosoptics) | Vision tracking step library |
| `mosii.astro` | [mosaigo.io/mosii](https://mosaigo.io/mosii) | Assistive communication product |

**Documentation** (`src/content/docs/`) — Starlight-powered Markdown docs:

```
docs/
  getting-started/    Installation and quick start
  steps/              Step catalog reference
  docs-mosoptics/     mosoptics library docs
  docs-mosii/          Mosii product docs
```

Additional sidebar sections (concepts, architecture, api, studio, guides) are configured in `astro.config.mjs` but not yet populated.

## Getting Started

### Requirements

- Node.js 20+
- npm

### Install

```bash
npm ci
```

### Local Development

```bash
npm run dev
```

Opens a local dev server at `http://localhost:4321` with hot reload. Changes to pages, docs, and styles are reflected immediately.

### Build

```bash
npm run build
```

Generates static HTML in `dist/`. To preview the production build locally:

```bash
npm run preview
```

## Editing Content

### Documentation pages

Add or edit Markdown files in `src/content/docs/`. Starlight uses the directory structure for navigation — files are grouped by their parent folder, which maps to sidebar sections defined in `astro.config.mjs`.

```bash
# Add a new doc page
echo '---
title: My New Page
---

Content here.' > src/content/docs/getting-started/new-page.md
```

Starlight supports all standard Markdown plus [Starlight components](https://starlight.astro.build/guides/components/) (tabs, cards, asides, etc.).

### Landing pages

Edit the Astro components in `src/pages/`. These are standalone pages with inline styles matching the project's dark blue theme (colors defined in `src/styles/custom.css`).

### Sidebar navigation

Edit `astro.config.mjs` to add or reorder sidebar sections. Each entry uses `autogenerate` to pick up all Markdown files in the specified directory:

```js
sidebar: [
  { label: 'Getting Started', autogenerate: { directory: 'getting-started' } },
  // ...
]
```

### Styling

Global theme overrides are in `src/styles/custom.css` (fonts: Inter + JetBrains Mono, accent colors, dark mode palette).

## Deployment

Pushes to `main` trigger the GitHub Pages workflow (`.github/workflows/pages.yml`), which builds and deploys to [mosaigo.io](https://mosaigo.io). The `CNAME` file in `public/` configures the custom domain.

## Related Projects

| Project | Description |
|---------|-------------|
| [mosaigo](https://github.com/mosaigoio/mosaigo) | Pipeline engine framework (pure Go) |
| [mosoptics](https://github.com/mosaigoio/mosoptics) | Vision tracking step library |
| [mosii](https://github.com/mosaigoio/mosii) | Assistive communication overlay |

## License

Apache-2.0
