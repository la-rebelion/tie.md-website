# tie.md website

The public landing page, documentation, and product notes for [tie.md](https://github.com/la-rebelion/tie.md). It is a TypeScript Docusaurus site built from the product PRD and the identity/landing prototypes in the adjacent `mockup/` directory.

## Local development

Requirements: Bun 1.4+ and Node.js 20+.

```bash
bun install
bun run start
```

## Validate

```bash
bun run format:check
bun run typecheck
bun run build
bun run test    # installer script tests
bun run audit   # Playwright audit of build/ (run after build)
```

The production output is written to `build/`. Broken routes, anchors, and Markdown links fail the build.

`bun run audit` serves `build/` and checks WCAG 2.2 AA (axe, light and dark), the no-JavaScript render, that no third-party request happens before analytics consent, 320px layouts, keyboard focus, reduced motion, metadata/icons/robots/sitemap, that the demo screens are labelled as examples, a performance budget, and visual baselines (`e2e/site.e2e.mts-snapshots/`; refresh with `bunx playwright test --config playwright.config.mts -g visual --update-snapshots=all`).

## Privacy and analytics

Google Tag Manager and HubSpot load only after a visitor accepts the consent banner (`src/lib/consent.ts`); the choice can be changed on `/privacy`. Fonts are self-hosted via Fontsource.

## Deploy to GitHub Pages

The site is configured for `https://tie.md` and includes `static/CNAME`. Once DNS and GitHub Pages are configured, publish with an authenticated GitHub CLI credential:

```bash
GIT_USER=<github-user> bun run deploy
```

The application and website have separate repositories:

- Application: <https://github.com/la-rebelion/tie.md>
- Website: <https://github.com/la-rebelion/tie.md-website>

## Design system

The bow-tie mark connects the teal OpenSpec/specification wing to the orange agent wing through a human-controlled knot. Shared typography and color tokens live in `src/css/custom.css`; landing-specific composition and animation live in `src/pages/index.module.css`.
