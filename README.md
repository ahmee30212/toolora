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
- **Transparent:** read the [Privacy Policy](https://toolora.m-ahmad30212.workers.dev/privacy/) and [Terms of Use](https://toolora.m-ahmad30212.workers.dev/terms/).

## Technology

- Astro 7 with static site generation
- TypeScript 6 for browser-side tool logic and the Cloudflare Worker API
- Tailwind CSS 4 through the Vite plugin
- Cloudflare Workers Static Assets and D1 (community backend, owner-configured)
- PDF.js 6.5.438 for local PDF rendering
- jsPDF 4.2.1 for local PDF creation
- Native browser APIs and Web Crypto
- Node.js 24 and Playwright browser tests

## Privacy and third-party resources

Image, PDF and text content is processed in the browser. PDF.js and jsPDF are installed as pinned npm dependencies and bundled with the site. The QR-code tool loads a version-pinned open-source QR library from cdnjs with Subresource Integrity only when that tool is used; the content encoded in a QR code is not sent to the CDN. Toolora uses system fonts and does not request Google Fonts.

Community submissions (reviews and tool requests) are stored in the owner's Cloudflare D1 database when configured. They are pending moderation by default. The API does not collect file uploads, passwords or email addresses. Cloudflare may process technical request metadata for delivery, reliability and security. See the in-site [Privacy Policy](/privacy/) for details.

## Security and quality gates

The repository uses layered checks. See the [Security Policy](SECURITY.md) for responsible disclosure guidance.

- npm audit blocks known dependency advisories at every severity level.
- CodeQL performs JavaScript and TypeScript static analysis; uploaded results are available in GitHub Security.
- OWASP ZAP Baseline performs a passive production scan after successful CI. A report gate fails on actionable low-, medium-, high- or critical-risk findings.
- Playwright provides end-to-end browser coverage for all 41 tools and the main navigation, search, category and responsive flows.
- Build validation checks route/catalog consistency, security headers, canonical sitemap routes and asset-size budgets.
- Security headers include CSP, HSTS, clickjacking protection, MIME-sniffing protection, COOP, COEP and CORP.
- Community API validates same-origin requests, JSON content types, payload size, field constraints and submission frequency; submissions remain pending for owner moderation.

Browser-side resource limits are enforced for large text, image and PDF workloads. The ZAP Baseline scan is passive; it is not a full active penetration test or a guarantee that no vulnerability exists.

## Community backend setup

The Worker API and initial D1 schema are in place. To activate submissions, create a D1 database in your own Cloudflare account and follow [docs/COMMUNITY_BACKEND.md](docs/COMMUNITY_BACKEND.md). No Cloudflare credentials belong in Git. The admin moderation interface and Cloudflare Access protection are a separate phase and are not yet implemented.

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

The production build validates the catalog, generates the XML sitemap, runs Astro diagnostics, copies the pinned PDF.js runtime assets, builds the static site and checks security and performance budgets.

## Cloudflare Workers deployment

- Build command: npm run build
- Static assets directory: dist
- Worker entrypoint: src/worker.ts
- Worker configuration: wrangler.toml
- Node.js build environment: 24

Deploy the current main revision through the configured Cloudflare Worker deployment after the GitHub Actions checks pass.

## Project structure

- src/data/tools.ts — category and tool catalog
- src/components/ — shared navigation, footer and SVG icons
- src/layouts/SiteLayout.astro — document shell, canonical URLs and social metadata
- src/pages/ — homepage, search, category, tool, privacy, terms and 404 pages
- src/scripts/tool-engine.ts — browser-side tool implementations
- src/worker.ts — API routing, validation, rate limiting and D1 access
- migrations/ — versioned D1 schema
- docs/ — owner setup and operational documentation
- src/styles/global.css — shared visual system
- scripts/ — catalog, sitemap, PDF asset, build and ZAP report validation
- tests/e2e/ — browser tests

## Credits

Created by Muhammad Ahmad ❤️
