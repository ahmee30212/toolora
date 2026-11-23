# Toolora

**Free Online Tools for Everyone.**

Toolora is a modern, browser-first collection of **41 free online tools across 9 categories**. Each category has its own focused tool list, and every tool has a dedicated workspace.

**Live website:** https://toolora.m-ahmad30212.workers.dev/

**Created by Muhammad Ahmad ❤️**

## Product principles

- **Focused UX:** category-first navigation, dedicated tool workspaces, live search and consistent page layouts.
- **Browser-first privacy:** text, image and PDF processing happens locally in the user's browser; files are not uploaded to a Toolora processing server.
- **Responsive and accessible:** semantic controls, keyboard-visible focus, mobile navigation and reduced-motion support.
- **Fast by design:** static Astro output, locally bundled PDF libraries, lazy-loaded tool dependencies and enforced JavaScript/CSS size budgets.
- **Transparent:** read the [Privacy Policy](/privacy/) and [Terms of Use](/terms/).

## Technology

- Astro 7 with static site generation
- TypeScript 6 for browser-side tool logic
- Tailwind CSS 4 through the Vite plugin
- Cloudflare Workers Static Assets
- PDF.js 6.5.438 for local PDF rendering
- jsPDF 4.2.1 for local PDF creation
- Native browser APIs and Web Crypto
- Node.js 24 and Playwright browser tests

## Privacy and third-party resources

Toolora does not provide a file-upload processing endpoint. Image, PDF and text content is processed in the browser. PDF.js and jsPDF are installed as pinned npm dependencies and bundled with the site. The QR-code tool loads a version-pinned open-source QR library from cdnjs with Subresource Integrity only when that tool is used; the content encoded in a QR code is not sent to the CDN. Toolora uses system fonts and does not request Google Fonts.

Cloudflare may process technical request metadata for delivery, reliability and security. See the in-site [Privacy Policy](/privacy/) for details.

## Security and quality gates

The repository uses layered checks:

- npm audit blocks known dependency advisories at every severity level.
- CodeQL performs JavaScript and TypeScript static analysis; uploaded results are available in GitHub Security.
- OWASP ZAP Baseline performs a passive production scan after successful CI. A report gate fails on actionable low-, medium-, high- or critical-risk findings.
- Playwright provides end-to-end browser coverage for all 41 tools and the main navigation, search, category and responsive flows.
- Build validation checks route/catalog consistency, security headers, canonical sitemap routes and asset-size budgets.
- Security headers include CSP, HSTS, clickjacking protection, MIME-sniffing protection, COOP, COEP and CORP.

Browser-side resource limits are enforced for large text, image and PDF workloads. The ZAP Baseline scan is passive; it is not a full active penetration test or a guarantee that no vulnerability exists.

## Local development

Requirements: Node.js 24 or newer.

    npm ci
    npm run dev

## Quality commands

    npm run validate
    npm run check
    npm run audit
    npx playwright install chromium
    npm run test:e2e
    npm run build
    npm run preview

The production build validates the catalog, generates the XML sitemap, runs Astro diagnostics, copies the pinned PDF.js runtime assets, builds the static site and checks security and performance budgets.

## Cloudflare Workers deployment

- Build command: npm run build
- Static assets directory: dist
- Worker configuration: wrangler.toml
- Node.js build environment: 24

Deploy the current main revision through the configured Cloudflare Worker deployment after the GitHub Actions checks pass.

## Project structure

- src/data/tools.ts — category and tool catalog
- src/components/ — shared navigation, footer and SVG icons
- src/layouts/SiteLayout.astro — document shell, canonical URLs and social metadata
- src/pages/ — homepage, search, category, tool, privacy, terms and 404 pages
- src/scripts/tool-engine.ts — browser-side tool implementations
- src/styles/global.css — shared visual system
- scripts/ — catalog, sitemap, PDF asset, build and ZAP report validation
- tests/e2e/ — Playwright end-to-end tests

## Credits

Created by Muhammad Ahmad ❤️
