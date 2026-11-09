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
```

The production output is written to `build/`. Broken routes, anchors, and Markdown links fail the build.

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
