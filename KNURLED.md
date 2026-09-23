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

Every field but one is required. `description` is an optional array of strings,
one per paragraph, rendered on the spec page under the tagline and used as that
page's meta description. The tagline is the label; the description is the note
beneath it. Absent is a valid state — requiring it would make adding a part two
decisions instead of one — and when it is absent the tagline stands in as the
meta description.

It is validated at module load, so a malformed manifest fails the build instead
of rendering a broken index. `pnpm --filter @knurled/catalog build` is that check
on its own. Beyond shape, the validator enforces: part numbers match `KS-NNN` and
are unique, slugs are unique because they are routes, `SHELVED` entries carry
`url: null`, a `description` is either absent or a non-empty array of non-empty
strings, and the file stays sorted ascending so diffs stay readable. Every
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
- `fonts.css` — self-hosted Inconsolata, latin subset, weights 400/700. It is
  the only family: `--font-mono` names it and `--font-sans` is an alias of
  `--font-mono`. The scale used to name Geist and Geist Mono, neither of which
  was ever loaded, so the site rendered in the OS default sans while these
  files downloaded and painted nothing. One family cannot drift that way.
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
  from ink rules and flat surface steps. `repeating-linear-gradient` is
  permitted — the knurl needs it. The one legal `box-shadow` is the chamfer
  focus ring, `inset 0 0 0 3px var(--lavinder-600)`, because `clip-path` clips
  an outline away. That also rules out a hard offset shadow: `clip-path` clips
  those too, so a chamfered panel cannot cast one without a third layer.
- Color comes from a custom property. Raw hex outside `tokens.css` is an error.
- Two hues, and they mean different things. Lavinder is the house finish and
  marks the studio's own things — part numbers, active status, internal links.
  Verdigris is `--text-external` and marks anything that leaves the studio: the
  hostname on a tool's launch panel, on a link card, on an "Elsewhere" row. A
  reader should be able to tell from color alone whether a click stays home.
- Durations reference `--dur-*`.
- One grain direction: 45°, everywhere, never rotated.
- One theme, and it is light. No `prefers-color-scheme` handling, no toggle.

Direction, not lintable but not optional either:

- **Paper, not screen.** `--paper` is a warm newsprint, and everything is read
  on it. Contrast ratios are annotated against it in `tokens.css`; a token that
  fails AA at its intended size says so on its own line.
- **Weight, not tint, separates a rule from a strong one.** `--edge-weight` is
  2px and `--hairline-strong` is 3px, both in ink. The chamfer face insets by
  `--edge-weight`, so the edge and the cut cannot drift apart.
- **Hard left, full bleed.** There is no page container and nothing is centred.
  `--gutter` sits on each band — header, main, the footer bar — rather than on
  the shell, so anything composing `.bleed` runs to both edges of the viewport
  while text stays on one left margin. Blocks that read badly when stretched
  take a measure: `--measure` (68ch) for prose, `--measure-wide` (96ch) for a
  slab of tabular data.
- **The banner appears once, on the footer plate.** Open triangles
  alternating point-up and point-down, spaced apart rather than sharing
  edges. It is a signature, not punctuation: repeating it at every section
  turned it into a line across the page every few hundred pixels and it
  stopped meaning anything. Section headings are a label and nothing else —
  no band, no rule, no horizontal lines across.
- **Accent is a surface too, sparingly.** `--surface-accent` is the same
  full-strength purple as `--text-accent`, because it clears 7:1 both as text
  on paper and as a ground under `--text-on-accent`. It is reserved for small
  stamped blocks — the current nav item, an ACTIVE chip — not for bands.
  `--surface-tint` is the soft fill used for hover, chosen so that everything
  inside a panel stays legible without restyling itself.
- **Headings are stamped.** Uppercase, 700, `--leading-display`, and large.
  `--text-3xl` is the page h1 and it is meant to be the first thing in the room.

---

## Routes

`apps/studio` serves three static routes, two generated ones, and a
catch-all. `/` and `/tools/:slug` are
generated from the catalog — **adding a part is one edit to `catalog.json` and
nothing else.** Verified: a fake KS-003 appeared on the index and got a working
spec page with no other file touched.

| Route | Source |
|---|---|
| `/` | `catalog`, descending by part number — newest first. Shelved entries stay listed, struck through and muted. |
| `/tools/:slug` | `bySlug`. Unknown slug renders the 404 view. |
| `/writing` · `/writing/:slug` | `src/writing/*.md`, newest first. Reached from the index. |
| `/links` | `src/links/links.ts`, grouped by first category. Reached from the index. |
| `/about` | Hand-written. Absorbs what was at `me.knurled.studio`. |

The nav carries **Index** and **About** only. Writing and Links sit in an "Also
on file" section under the catalog — they are not parts, so they are not in the
index grid, and they are not the studio's own pages, so they are not tabs.
Their counts come from the data: the post count reads a **non-eager**
`import.meta.glob`, which resolves to a map of paths and never loads a post.

### Markdown content

`src/writing/*.md` is loaded eagerly through `import.meta.glob` and parsed by
`src/lib/frontmatter.ts` — a flat `key: value` reader, not a YAML parser,
because the frontmatter here does not need one. A missing or malformed field
throws at load rather than rendering a blank.

The filename must equal the frontmatter `slug`, which is enforced at load.
Rendered with react-markdown + remark-gfm. The body must **not** open with an
`# h1`; the page heading already is one.

## The mark

`<Mark>` is a chamfered square with the knurl cut into it — both signature
elements in one glyph. It is built from the same `chamferShell`, `chamferFace`
and `knurl` patterns as everything else rather than drawn separately, so it
cannot drift from the components beside it. It scales the chamfer to a quarter
of its size and coarsens the tooth to half the glyph, because a 13px chamfer on
a 20px glyph reads as no chamfer and the strip's 8px tile reads as muddy
scallops rather than teeth.

It sits in the header lockup beside the wordmark and at the head of the footer
identity row. Decorative in both, since the wordmark carries the name. The mark
sets its own pitch and line width, so it does not move when the strip tokens do.

There is one banner, on the footer plate. The mark is the only other place
the grain appears, and it carries a single row of solid teeth so no seam
crosses the glyph.

The banner is an SVG `<pattern>` in `Knurl.tsx`, not a gradient, and its
geometry lives there as constants — a pattern tile cannot read a custom
property, so only `--knurl-line` crosses over, on the stroke.

That is also why it is SVG at all. Crossing `repeating-linear-gradient`
families can only draw a lattice whose triangles **share** their edges;
standing them apart needs closed outlines, which gradients cannot make.

A gradient lattice was built first and has one more trap worth recording: a
`45deg` gradient and a `-45deg` one anchor to opposite corners of their box,
so their relative phase moves with the element's width. The same band rendered
as a clean truss at 900px and as a row of crossed X's at 1200px. Tiling with
`background-size` pins the phase; the `.teeth` pattern the mark uses does
exactly that.

A tile as tall as the strip was tried and looks wrong: the band then shows
only the bottom half of one tile, which reads as a solid bar with a toothed
edge rather than teeth meshing. Two rows is the minimum that reads as a
texture.

`apps/studio/public/favicon.svg` redraws the same geometry in SVG, because an
icon cannot read the token layer — the two hex values there are `--paper`
and `--lavinder-600`, and they have to be kept in step by hand. So do the
`color-scheme` and `theme-color` meta tags in `apps/studio/index.html`, the
palette inlined in `apps/studio/scripts/og-card.html`, and the `INKS` array in
`packages/kit/src/ColorBar/inks.ts` — the footer press strip renders one patch
per entry, so a token added or retired without touching that array shows up as
a blank swatch.

**An XML comment cannot contain a double hyphen.** Writing `--stock-950` inside
one makes the file malformed; browsers serve it 200 and then refuse to render
it, so it fails as a silently broken image. Name tokens without their leading
dashes in SVG comments.

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

`knurled.studio` is on GitHub Pages, published by
`.github/workflows/deploy-studio.yml` on pushes to `main` that touch the app or
its dependencies. Pages is configured with `build_type: workflow`, so the
workflow artifact *is* the deploy — there is no branch to push to.

The workflow runs `typecheck` and `lint` before it builds. A commit that breaks
a design rule fails there and never reaches the site.

**Static hosting has no SPA fallback.** `apps/studio/scripts/spa-fallback.mjs`
handles it, and does more than the usual trick:

- Every route is known at build time — three static, one per catalog entry, one
  per post — so it writes a real `index.html` at each path. Those answer **200**.
  Serving only a `404.html` shell would render the right page while telling every
  crawler the URL does not exist.
- `404.html` remains, for paths that genuinely are missing, and is the one page
  marked `noindex` — it answers on every missing path.
- `.nojekyll` stops Pages dropping paths that begin with an underscore.
- `public/CNAME` holds the custom domain, and is also where the script reads the
  origin for canonical URLs and the sitemap. One domain, declared once.
- `sitemap.xml` and `robots.txt` come from the same route list. Posts carry a
  `lastmod` from their `publishDate`; nothing else claims one it cannot know.

The route list is derived from `catalog.json` and `src/writing/*.md`, so adding
a part is still one edit — the prerendered path follows on its own.

### Per-route metadata

Because every route is known at build time, so is its metadata. A single shell
copied to ten paths would give ten pages one title and no description, and every
link to the site would preview as a bare URL.

`index.html` carries a `<!-- head:meta --> … <!-- /head:meta -->` block. What
sits inside it is what the dev server shows; at build time the script replaces
it per route with a title, description, canonical URL, Open Graph and Twitter
card tags, and `article:published_time` on posts. **The markers must stay.** A
missing or duplicated one throws rather than publishing ten pages with one
title — losing this silently is exactly the failure it exists to prevent.

Copy comes from the data already on the page: a tool's `description[0]` falling
back to its tagline, a post's `excerpt`. Meta descriptions are one line, so a
longer opening paragraph is clamped at 200 characters on a word boundary. Write
the first paragraph as a complete thought under that length and nothing is cut.

The script imports `src/lib/frontmatter.ts` directly, under Node's type
stripping. Sharing the app's own parser is the point — a post's frontmatter
means one thing, and the build cannot drift from what the page renders.

### The social card

`apps/studio/public/og.png` is 1200×630 and every page points at it. Its source
is `scripts/og-card.html`, which is **not** in `public/` — a file there would
ship to the site — and the regeneration command is in a comment at the top.

Rendered by hand rather than at build time. A social card cannot be an SVG, and
turning one into a PNG needs a renderer; Chrome is already on the machine and
reads the real `woff2` files, so the wordmark is set in Inconsolata rather
than a substitute. The alternative was a build dependency for one image that changes
about never. Same trade as `favicon.svg`: hex is inlined and kept in step by
hand, and the mark repeats the `<Mark>` construction including its rule that the
chamfer is a quarter of the glyph and the grain a fifth.

Headless Chrome treats `--window-size` as the outer window, not the viewport,
and clips roughly 75px off the bottom. Render tall and crop to size; do not
compensate with a magic number in the flag, which breaks on the next machine.

Infrastructure for the tool subdomains (Phase 4, AWS CDK) is not built. Nothing
needs it while everything is on Pages.

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
| @fontsource/inconsolata | 5.3.0 | self-hosted |

Exact versions live in the `catalog:` block of `pnpm-workspace.yaml`; packages
reference them as `"react": "catalog:"`. This table mirrors that block.

### CSS Module typing

`typescript-plugin-css-modules` is a **tsserver** plugin: the editor gets the
real per-class shape and flags `styles.panle` as you type. `tsc` does not load
TS plugins, so the command-line build falls back to the ambient
`Record<string, string>` declaration and a typo there is not a build failure.
Closing that gap needs a codegen step that emits a `.d.ts` per module.

The plugin only loads under the **workspace** TypeScript. `.vscode/settings.json`
points `typescript.tsdk` at `node_modules/typescript/lib`; accept the prompt, or
run "TypeScript: Select TypeScript Version" and choose the workspace version. On
the editor's bundled TypeScript the plugin never runs, and editor and CLI can
disagree — a stale server reporting exports that plainly exist is the usual
symptom, cured by "TypeScript: Restart TS Server".

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
