# KNURLED.md

Repo conventions for Knurled Studio. Read before adding anything.

---

## Layout

```
knurled/
├── src/
│   ├── catalog/           catalog.json + types + lookup helpers
│   ├── kit/               tokens + primitives
│   ├── pages/ shell/      the site
│   └── hooks/ utils/ writing/
├── public/                copied verbatim into dist/
├── scripts/               build-time scripts (catalog check, SPA fallback, og card)
├── index.html
├── vite.config.ts
├── tsconfig.json          solution: tsconfig.app.json (src) + tsconfig.node.json
├── eslint.config.js       flat config, base + react
└── stylelint.config.js    design rules as build failures
```

One package, one site. Tools are separate projects that the studio links out
to; they do not live in this repo.

---

## Part numbers

Format `KS-NNN`. Zero-padded to three digits, assigned in the order a project is
first cut.

- `KS-000` is the studio itself.
- Part numbers are **never reused and never renumbered.** A retired project keeps
  its number forever.
- Gaps are honest history, not mistakes to fill. `KS-001` is absent on purpose.
- The next number is `max(existing) + 1`. Do not pick one to look tidy.

`src/catalog/catalog.json` is the only source of part numbers. Nothing else
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

`src/catalog/catalog.json` is the manifest. `src/catalog/index.ts` exports the
typed array plus `byPartNumber`, `bySlug`, and `byStatus`.

Every field but one is required. `description` is an optional array of strings,
one per paragraph, rendered on the spec page under the tagline and used as that
page's meta description. The tagline is the label; the description is the note
beneath it. Absent is a valid state — requiring it would make adding a part two
decisions instead of one — and when it is absent the tagline stands in as the
meta description.

It is validated at module load, so a malformed manifest fails the build instead
of rendering a broken index. `pnpm validate` is that check
on its own. Beyond shape, the validator enforces: part numbers match `KS-NNN` and
are unique, slugs are unique because they are routes, `SHELVED` entries carry
`url: null`, a `description` is either absent or a non-empty array of non-empty
strings, and the file stays sorted ascending so diffs stay readable. Every
fault is reported at once, not one per run.

Relative imports carry an explicit `.ts` extension — that is what lets `node`
run `scripts/validate-catalog.ts` against the same source the site bundles.

## Adding a part

Add an entry to `src/catalog/catalog.json`. One file — the index page and the
`/tools/:slug` spec page are both generated from it, and its `url` is where the
tool actually lives. If adding an entry ever takes two edits, the architecture
has drifted; fix that first.

---

## Styling

A global design system in plain CSS, composed into CSS Modules. No Tailwind, no
CSS-in-JS, no utility classes in JSX.

Three global files, imported once from `src/main.tsx`, **in this order**:

```ts
import './kit/global.css';   // first — declares the cascade order
import './kit/tokens.css';
import './kit/fonts.css';
```

- `global.css` — layer declaration, reset, base elements, type scale, focus,
  reduced motion.
- `tokens.css` — custom properties only.
- `fonts.css` — two self-hosted families, nothing from a CDN.
  - **Inconsolata** (latin subset, 400/700) is the voice: body, labels, data.
    `--font-mono` names it and `--font-sans` is an alias of it. The scale used
    to name Geist and Geist Mono, neither of which was ever loaded, so the
    site rendered in the OS default sans. Every family named must be loaded.
  - **Departure Mono** (`--font-display`) is the display face: h1, h2, window
    titles, the instruments. Nothing longer than a line. It is not on npm, so
    the woff2 and its OFL licence are vendored in `src/kit/fonts/`
    from the v1.500 release. It is drawn on an 11px grid, so display sizes
    are multiples of 11 (`--text-d1` 22, `--text-2xl` 44, `--text-3xl` 88,
    `--text-4xl` 132). Regular weight only; headings in it are set at 400
    with `font-synthesis: none`, because a faked bold smears the pixels.
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

Hard rules, enforced by `stylelint.config.js` as errors:

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
- **The grain lives in the mark only.** The triangle banner (`<Knurl>`) is
  still exported from the kit but no longer placed anywhere: it sat on the
  footer plate, read as decoration, and came off. The footer is separated by a
  plain `--hairline-strong` rule. Repeating the grain at every section had
  already turned it into a line across the page every few hundred pixels. Section headings are a label and nothing else —
  no band, no rule, no horizontal lines across.
- **Accent is a surface too, sparingly.** `--surface-accent` is the same
  full-strength purple as `--text-accent`, because it clears 7:1 both as text
  on paper and as a ground under `--text-on-accent`. It is reserved for small
  stamped blocks — the current nav item, an ACTIVE chip — not for bands.
  `--surface-tint` is the soft fill used for hover, chosen so that everything
  inside a panel stays legible without restyling itself.
- **Headings are stamped.** Uppercase, `--leading-display`, and large. h1 and
  h2 are in the display face at 400; h3 and h4 stay Inconsolata 700.
  `--text-3xl` is the page h1 and `--text-4xl` is the hero, used once.
- **Windows sit off the page.** `<Window>` is a chamfered panel with an ink
  title bar, on a solid ink plate offset by `--lift`. The plate is a layer, not
  a shadow, so it passes the no-faked-light rule. Interactive windows lift to
  `--lift-hover` on hover and focus and seat on the plate when pressed. `Panel`
  remains for flat surfaces on the inner pages.
- **Motion is mechanical and happens once.** Scroll reveals slide in from the
  left, staggered by `--dur-fast`, the first time something enters view. The
  boot screen shows once per session, only on a cold landing on `/`. The lathe
  stops drawing off screen. With reduced motion turned on there is no boot,
  no stamp, no reveal, and the lathe draws one still frame.

---

## Routes

The site is one page plus the routes it links to: three static routes,
two generated ones, a redirect, and a catch-all. `/` and `/tools/:slug` are
generated from the catalog — **adding a part is one edit to `catalog.json` and
nothing else.** Verified: a fake KS-003 appeared on the index and got a working
spec page with no other file touched.

| Route | Source |
|---|---|
| `/` | The one page. Hero with the lathe, then numbered sections: **Parts** (`catalog`, newest first; shelved entries stay listed, struck through), **Operator** (bio, rig, principles), **On file** (Writing, Links), **Elsewhere**. |
| `/tools/:slug` | `bySlug`. Unknown slug renders the 404 view. |
| `/writing` · `/writing/:slug` | `src/writing/*.md`, newest first. Reached from the index. |
| `/links` | `src/links/links.ts`, grouped by first category. Reached from the index. |
| `/about` | Redirects to `/#operator`. The client route is a `<Navigate>`; the build writes a static meta-refresh page with a canonical pointing at `/`, kept out of the sitemap. |

The nav is three jumps into the index: **Parts**, **Operator**, **Elsewhere**,
written as `/#id` so they work from any page. The current section is tracked
as you scroll and gets the stamped block. Writing and Links sit in the "On
file" section — they are not parts, so they are not in the parts grid.
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

The banner is not placed on any page. The mark is the only place the grain
appears, and it carries a single row of solid teeth so no seam
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

`public/favicon.svg` redraws the same geometry in SVG, because an
icon cannot read the token layer — the two hex values there are `--paper`
and `--lavinder-600`, and they have to be kept in step by hand. So do the
`color-scheme` and `theme-color` meta tags in `index.html`, the
palette inlined in `scripts/og-card.html`, and the `INKS` array in
`src/kit/ColorBar/inks.ts` — the footer press strip renders one patch
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
pnpm install
pnpm dev                          # vite dev server
pnpm build                        # validate catalog, tsc, vite build, SPA fallback
pnpm lint                         # eslint + stylelint
pnpm typecheck                    # tsc -b
pnpm validate                     # catalog check on its own, prints the manifest
```

### Deploy

`knurled.studio` is on GitHub Pages, published by
`.github/workflows/deploy-studio.yml` on pushes to `main`, except those
that touch only top-level Markdown. Pages is configured with `build_type: workflow`, so the
workflow artifact *is* the deploy — there is no branch to push to.

The workflow runs `typecheck` and `lint` before it builds. A commit that breaks
a design rule fails there and never reaches the site.

**Static hosting has no SPA fallback.** `scripts/spa-fallback.mjs`
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

`public/og.png` is 1200×630 and every page points at it. Its source
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

---

## Pinned versions

Exact pins, no ranges. Update deliberately, one at a time.

| Tool | Version | Note |
|---|---|---|
| Node | 24.18.0 | `.nvmrc` |
| pnpm | 9.15.4 | `packageManager` field |
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

Exact versions live in `package.json`. This table mirrors it.

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
