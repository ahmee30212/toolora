# Toolora

**Free Online Tools for Everyone.**

Toolora is a category-first collection of practical browser-based utilities, designed around a consistent brand, responsive workspaces and privacy-conscious local processing.

**Created by Muhammad Ahmad ❤️**

## Product principles

- **Useful by default:** tools are grouped into clear categories and each tool has a focused workspace.
- **Privacy-conscious:** text and file operations are performed in the browser wherever supported; no Toolora account is required.
- **Accessible and responsive:** shared navigation, semantic controls, visible focus states and mobile layouts.
- **Secure by design:** production response headers include a Content Security Policy and browser security policies; CI audits dependencies and fails on high or critical advisories.
- **Transparent:** see the [Privacy Policy](/privacy) and [Terms of Use](/terms).

## Technology

- Astro 7 with static site generation
- TypeScript for browser-side tool logic
- Tailwind CSS 4 through the official Vite plugin
- Native browser APIs and Web Crypto for local processing
- Cloudflare Workers Static Assets for hosting

## Local development

Requirements: Node.js 24 or newer.

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run check
npm run audit
npm run build
npm run preview
```

The production build validates the tool catalog, generates the XML sitemap from the catalog, runs Astro diagnostics and builds all static routes.

GitHub Actions runs on Node.js 24, reports dependency advisories, blocks high and critical dependency vulnerabilities, and verifies the production build.

## Project structure

- `src/data/tools.ts` — category and tool catalogue
- `src/components/` — shared branded navigation, footer and SVG icons
- `src/layouts/SiteLayout.astro` — document shell, canonical URLs and social metadata
- `src/pages/` — homepage, search, category, tool, privacy, terms and 404 pages
- `src/scripts/tool-engine.ts` — browser-side tool implementations
- `src/styles/global.css` — shared design system
- `scripts/` — catalog validation and sitemap generation

## Cloudflare Workers deployment

- Build command: `npm run build`
- Static assets directory: `dist`
- Worker configuration: `wrangler.toml`
- Node.js build environment: `24`

Deploy using the Cloudflare Worker configuration after the GitHub Actions build has passed.

## Privacy and third-party libraries

Toolora is designed to process text and selected files locally in the browser. QR generation and PDF workflows load version-pinned open-source libraries from cdnjs when those features are used. Google Fonts is used for typography. These third-party providers may receive technical request information when the browser loads their resources. See the in-site [Privacy Policy](/privacy) for details.

## Credits

Created by Muhammad Ahmad ❤️
