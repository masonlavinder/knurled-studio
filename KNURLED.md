# KNURLED.md

Repo conventions for Knurled Studio. Read before adding anything.

---

## Layout

```
knurled/
├── apps/                  deployable front ends, one per subdomain
├── packages/              shared libraries and configs
│   ├── catalog/           catalog.json + types + lookup helpers
│   ├── kit/               tokens + primitives
│   ├── tsconfig/          base.json, react-library.json
│   ├── eslint-config/     flat config, base + react
│   └── stylelint-config/  design rules as build failures
├── services/              FastAPI services (uv workspace)
├── infra/                 AWS CDK v2 app
├── archive/               shelved apps, excluded from CI
├── turbo.json
└── pnpm-workspace.yaml
```

Workspace globs: `apps/*`, `packages/*`, `infra`.

---

## Part numbers

Format `KS-NNN`. Zero-padded to three digits, assigned in the order a project is
first cut.

- `KS-000` is the studio itself.
- Part numbers are **never reused and never renumbered.** A retired project keeps
  its number forever.
- Gaps are honest history, not mistakes to fill. `KS-001` is absent on purpose.
- The next number is `max(existing) + 1`. Do not pick one to look tidy.

`packages/catalog/catalog.json` is the only source of part numbers. Nothing else
declares one — components take a `partNumber` prop and look the rest up.

---

## Status vocabulary

Exactly four values. Nothing else is valid.

| Status | Means |
|---|---|
| `ACTIVE` | In use and being worked on. |
| `MAINTAINED` | In use, feature-complete. Fixes only. |
| `PROTOTYPE` | Runs, unfinished, may change or vanish. |
| `SHELVED` | Put down. `url` is `null`. Still listed. |

Shelved entries stay in the catalog and stay on the index at reduced emphasis.
The studio does not delete its history.

---

## Adding a new app

1. Add an entry to `packages/catalog/catalog.json`. One file — the index page and
   the `/tools/:slug` spec page are both generated from it. If adding an entry
   ever takes two edits, the architecture has drifted; fix that first.
2. `mkdir apps/<slug>` with a Vite + React + TS setup. Extend
   `@knurled/tsconfig/react-library.json`, use `@knurled/eslint-config/react`
   and `@knurled/stylelint-config`.
3. Depend on `@knurled/kit` and `@knurled/catalog`. Import `tokens.css` and
   `global.css` exactly once, at the app root.
4. Mount `<StudioFooter partNumber="KS-NNN" />`. Every app mounts it — it is what
   makes the subdomains read as one studio.
5. Add a `KnurledSite` instance to `infra/stacks/studio-stack.ts`.

---

## Styling

A global design system in plain CSS, composed into CSS Modules. No Tailwind, no
CSS-in-JS, no utility classes in JSX.

- `@knurled/kit/tokens.css` — custom properties only, imported once per app.
- `@knurled/kit/global.css` — layers, reset, base elements, type scale, focus,
  reduced motion. Imported once per app.
- `@knurled/kit/patterns.css` — reusable fragments, reached **only** via
  `composes`. Never write a pattern class name in JSX.

Layer order, declared once in `global.css`:

```css
@layer reset, tokens, base, patterns, components;
```

Every rule in the kit and in every app belongs to a layer. Without this, cascade
resolution depends on CSS Module import order, which differs between the dev
server and the production build.

Hard rules, enforced by `@knurled/stylelint-config` as errors:

- Chamfers, not rounded corners. `border-radius` is banned outright.
- No faked light: no gradients, shadows, glows, bevels, or noise. Depth comes
  from hairline borders and flat surface steps. `repeating-linear-gradient` is
  permitted — the knurl needs it.
- Color comes from a custom property. Raw hex outside `tokens.css` is an error.
- Durations reference `--dur-*`.
- One grain direction: 45°, everywhere, never rotated.
- Dark only. No `prefers-color-scheme` handling.

---

## Copy register

Spec sheet and shop drawing. Terse, declarative, nouns and numbers. Units and
precision: `142 ms`, not "fast." Banned: *seamless*, *empower*, *leverage*,
*reimagining*, and anything else that belongs on a landing page.

---

## Commands

Run from the repo root.

```sh
pnpm install                      # install the workspace
pnpm dev                          # every app's dev server
pnpm --filter studio dev          # one app
pnpm build                        # build everything, respecting deps
pnpm lint                         # eslint + stylelint across the workspace
pnpm typecheck                    # tsc --noEmit across the workspace
pnpm test
```

Turbo tasks are `build`, `dev`, `lint`, `typecheck`, `test`. All but `dev` are
cached; `dev` is persistent and uncached.

### Deploy

Infrastructure lands in Phase 4. Once `infra/` exists:

```sh
pnpm build                                    # dist/ must exist before synth
pnpm --filter infra exec cdk synth
pnpm --filter infra exec cdk diff  StudioStack
pnpm --filter infra exec cdk deploy StudioStack
```

Certificates are issued in `us-east-1` regardless of the stack region —
CloudFront requires it.

---

## Pinned versions

Exact pins, no ranges. Update deliberately, one at a time.

| Tool | Version | Note |
|---|---|---|
| Node | 24.18.0 | `.nvmrc` |
| pnpm | 9.15.4 | `packageManager` field |
| Turborepo | 2.10.9 | |
| TypeScript | 5.9.3 | Not 7.x — `typescript-eslint` peers cap at `<6.1.0`. |
| ESLint | 10.8.1 | flat config only |
| typescript-eslint | 8.66.0 | |
| @eslint/js | 10.0.1 | |
| eslint-plugin-react-hooks | 7.1.1 | |
| eslint-plugin-react-refresh | 0.5.3 | |
| globals | 17.9.0 | |
| Stylelint | 17.14.1 | |

Versions for Vite, React, Zod, CDK, and the typeface packages are pinned as
those phases land, and recorded here.

---

## Guardrails

- Ask before adding a dependency that is not already listed here.
- Do not invent part numbers.
- No light theme.
- Keep commits small and scoped to one phase. Conventional commit messages.
- Quality floor, unannounced: responsive to mobile, visible keyboard focus,
  `prefers-reduced-motion` respected, semantic HTML.
