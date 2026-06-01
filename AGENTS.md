# AGENTS.md

## Cursor Cloud specific instructions

### Product

Single **Next.js 16** portfolio app (`jason-saputra-portfolio`): a desktop-OS-style home at `/` and static case studies at `/work/[slug]`. Content lives in `data/*.js`; no database or Docker.

### Prerequisites

- **Node.js** `>=20.9.0` (`.nvmrc` pins `22`)
- **npm** (lockfile: `package-lock.json`)

### Commands

See `package.json` scripts. Common flows:

| Goal | Command |
|------|---------|
| Install deps | `npm install` |
| Lint | `npm run lint` |
| Production build | `npm run build` |
| Run prod server (after build) | `npm run serve:prod` → http://127.0.0.1:3000 |
| Build + prod server | `npm run preview` |

Optional env: copy `.env.example` → `.env.local` only if you need a custom `NEXT_PUBLIC_SITE_URL` (metadata/OG).

### Dev server gotcha

`npm run dev` (webpack) can fail on this environment with:

`watchOptions.ignored[0] should be a non-empty string`

This comes from Next/webpack watch options combined with `next.config.js` dev ignores. **Workarounds for local development:**

- **`npm run dev:turbo`** — Turbopack dev server (preferred when webpack dev breaks)
- **`npm run build && npm run serve:prod`** — production server on port 3000 (reliable for E2E/manual QA)

The app binds **`127.0.0.1:3000`** only (not `0.0.0.0`).

### Lint

`npm run lint` runs ESLint 9 with `eslint-config-next`. The repo may report existing warnings/errors (e.g. `react-hooks/set-state-in-effect`, ref-during-render in desktop components); treat failures as pre-existing unless your change introduced them.

### Tests

No Jest/Playwright/Cypress scripts in `package.json`. Verification is **lint + build + manual/browser** on `/` and `/work/*`.

### Optional tooling

`npm run merge-pdfs` — offline asset script (`scripts/merge-case-study-decks.mjs`), not required to run the site.
