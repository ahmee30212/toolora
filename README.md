# Toolora

**Free Online Tools for Everyone.**

Toolora is a category-first collection of browser-based utilities built with Astro, TypeScript and Tailwind CSS.

## Technology

- Astro 5 with static site generation
- TypeScript for tool logic
- Tailwind CSS for the responsive design system
- React integration available for future interactive components
- Browser APIs and Web Crypto for local processing
- Cloudflare Pages deployment

## Local development

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

## Production build

```bash
npm run check
npm run build
npm run preview
```

## Project structure

- `src/data/tools.ts` — category and tool catalogue
- `src/layouts/` — shared site layout
- `src/pages/index.astro` — category-first homepage
- `src/pages/categories/[slug].astro` — category landing pages
- `src/pages/tools/[slug].astro` — reusable tool workspaces
- `src/scripts/tool-engine.ts` — browser-side tool implementations
- `src/styles/global.css` — global design system

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `20` or newer

The repository includes a `wrangler.toml` configuration and a GitHub Actions build workflow.

## Privacy

Text transformations run locally in the browser. PDF rendering and QR generation load their open-source libraries from public CDNs when those tools are used. No user account is required.

## Credits

Created by Muhammad Ahmad ❤️
