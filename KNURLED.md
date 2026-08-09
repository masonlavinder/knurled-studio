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

## The catalog

`packages/catalog/catalog.json` is the manifest. `@knurled/catalog` exports the
typed array plus `byPartNumber`, `bySlug`, and `byStatus`.

It is validated at module load, so a malformed manifest fails the build instead
of rendering a broken index. `pnpm --filter @knurled/catalog build` is that check
on its own. Beyond shape, the validator enforces: part numbers match `KS-NNN` and
are unique, slugs are unique because they are routes, `SHELVED` entries carry
`url: null`, and the file stays sorted ascending so diffs stay readable. Every
fault is reported at once, not one per run.

## Internal packages ship TypeScript source

Workspace packages point `exports` at `./src/index.ts` rather than a built
`dist/`. Apps bundle them through Vite, so there is no build step to sequence, no
stale `dist/` to debug, and edits land in the dev server immediately. Relative
imports inside these packages carry an explicit `.ts` extension — that is what
lets `node` run them directly for build-time checks.

Consequence: a package's `build` task validates rather than compiles, and
declares `"outputs": []` in its own `turbo.json`.

## Adding a new app

1. Add an entry to `packages/catalog/catalog.json`. One file — the index page and
   the `/tools/:slug` spec page are both generated from it. If adding an entry
   ever takes two edits, the architecture has drifted; fix that first.
2. `mkdir apps/<slug>` with a Vite + React + TS setup. Extend
   `@knurled/tsconfig/react-library.json`, use `@knurled/eslint-config/react`
   and `@knurled/stylelint-config`.
3. Depend on `@knurled/kit` and `@knurled/catalog`. Import the three global
   stylesheets exactly once, at the app root, in the order given under
   [Styling](#styling) — `global.css` first.
4. Mount `<StudioFooter partNumber="KS-NNN" />`. Every app mounts it — it is what
   makes the subdomains read as one studio.
5. Add a `KnurledSite` instance to `infra/stacks/studio-stack.ts`.

---

## Styling

A global design system in plain CSS, composed into CSS Modules. No Tailwind, no
CSS-in-JS, no utility classes in JSX.

Three global files, imported once per app, **in this order**:

```ts
import '@knurled/kit/global.css';   // first — declares the cascade order
import '@knurled/kit/tokens.css';
import '@knurled/kit/fonts.css';
```

- `global.css` — layer declaration, reset, base elements, type scale, focus,
  reduced motion.
- `tokens.css` — custom properties only.
- `fonts.css` — self-hosted Geist and Geist Mono, latin subset, weights 400/500.
- `patterns.css` — reusable fragments, reached **only** via `composes`. Never
  imported globally, never written into JSX.

Layer order, declared once at the top of `global.css`:

```css
@layer reset, tokens, base, patterns, components;
```

**global.css must be imported first.** A layer takes its position from wherever
its name first appears, so any `@layer` block emitted ahead of that statement is
pinned where it lands and the declared order silently stops applying. Importing
tokens.css first put `@layer tokens` ahead of the declaration and did exactly
that. It was harmless there — tokens holds only custom properties — but it is
the failure mode the layer discipline exists to prevent, and it is invisible
until two rules collide.

CSS Module lookups are typed `string | undefined`, so join class names with
`cx` from the kit rather than template literals, which would emit the string
"undefined" into a class attribute.

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

## Routes

`apps/studio` serves four routes plus a catch-all. `/` and `/tools/:slug` are
generated from the catalog — **adding a part is one edit to `catalog.json` and
nothing else.** Verified: a fake KS-003 appeared on the index and got a working
spec page with no other file touched.

| Route | Source |
|---|---|
| `/` | `catalog`, ascending by part number. Shelved entries stay listed, struck through and muted. |
| `/tools/:slug` | `bySlug`. Unknown slug renders the 404 view. |
| `/writing` · `/writing/:slug` | `src/writing/*.md`, newest first. |
| `/links` | `src/links/links.ts`, grouped by first category. |
| `/about` | Hand-written. Absorbs what was at `me.knurled.studio`. |
| `/log` | `src/log/*.md`, newest first. |

### Markdown content

Two collections, both loaded eagerly through `import.meta.glob` and both
sharing `src/lib/frontmatter.ts` — a flat `key: value` reader, not a YAML
parser, because the frontmatter here does not need one. A missing or malformed
field throws at load rather than rendering a blank.

- **`src/log/*.md`** — the shop log. `YYYY-MM-DD-slug.md`, a `date:` field, and
  a two-line body. No Markdown renderer: two plain lines do not need one.
  Same-day entries fall back to reverse filename order, so a trailing letter
  (`-a-`, `-b-`) sequences a single day's work.
- **`src/writing/*.md`** — long form. Filename must equal the frontmatter
  `slug`, which is enforced at load. Rendered with react-markdown + remark-gfm.
  The body must **not** open with an `# h1`; the page heading already is one.

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
| @types/node | 24.13.3 | |
| React | 19.2.8 | + react-dom |
| Vite | 8.2.1 | + @vitejs/plugin-react 6.0.5 |
| @types/react | 19.2.18 | + @types/react-dom 19.2.4 |
| typescript-plugin-css-modules | 5.2.0 | editor-only, see below |
| @fontsource/geist | 5.3.0 | + geist-mono, self-hosted |

Exact versions live in the `catalog:` block of `pnpm-workspace.yaml`; packages
reference them as `"react": "catalog:"`. This table mirrors that block.

### CSS Module typing

`typescript-plugin-css-modules` is a **tsserver** plugin: the editor gets the
real per-class shape and flags `styles.panle` as you type. `tsc` does not load
TS plugins, so the command-line build falls back to the ambient
`Record<string, string>` declaration and a typo there is not a build failure.
Closing that gap needs a codegen step that emits a `.d.ts` per module.

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
