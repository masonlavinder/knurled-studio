/**
 * Static hosts have no SPA fallback. A request for /about is a request for a
 * file, and GitHub Pages answers with its own 404 page.
 *
 * The usual fix is to serve the app shell as 404.html. That renders the right
 * page, but every real URL answers HTTP 404 — fine for a human, wrong for a
 * crawler, and wrong on the wire.
 *
 * Every route here is known at build time: three static ones, plus one per
 * catalog entry and one per post. So write a real index.html at each path and
 * let them answer 200. 404.html stays, and now only catches paths that really
 * are missing.
 *
 * Because the routes are known, so is each one's metadata. A single shell
 * copied everywhere would give ten pages one title and no description — every
 * link to this site would preview as a bare URL. Each file therefore gets its
 * own <head>, built from the same catalog and frontmatter the pages render
 * from. Adding a part is still one edit to catalog.json; its title, its
 * description, its canonical URL and its sitemap row all follow.
 *
 * .nojekyll stops Pages running the output through Jekyll, which would drop
 * any path segment beginning with an underscore.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// The app's own parser, under Node's type stripping. Sharing it is the point:
// a post's frontmatter means one thing, and the build cannot drift from what
// the page renders.
import { parseFrontmatter, requireDate, requireField, slugFromPath } from '../src/lib/frontmatter.ts';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(appRoot, 'dist');

/** The deployed origin, from the same CNAME file that tells Pages the domain. */
const host = (await readFile(resolve(appRoot, 'public/CNAME'), 'utf8')).trim();
const ORIGIN = `https://${host}`;

const SITE_NAME = 'Knurled Studio';
const OG_IMAGE = `${ORIGIN}/og.png`;

/**
 * Meta descriptions are one line. Copy is written for the page first and
 * borrowed here, so a long opening paragraph is clamped rather than left to
 * run — at a word boundary, and only past this length.
 */
const DESCRIPTION_MAX = 200;

function oneLine(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function clamp(text) {
  const flat = oneLine(text);
  if (flat.length <= DESCRIPTION_MAX) {
    return flat;
  }
  const cut = flat.slice(0, DESCRIPTION_MAX);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:—-]$/, '')}…`;
}

/** Escapes for an HTML attribute value. Descriptions are prose and contain both. */
function attr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escapes for XML text content in the sitemap. */
function xml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---- the route table ------------------------------------------------------

const catalog = JSON.parse(
  await readFile(resolve(appRoot, '../../packages/catalog/catalog.json'), 'utf8'),
);

const postFiles = (await readdir(resolve(appRoot, 'src/writing'))).filter((name) =>
  name.endsWith('.md'),
);

const posts = await Promise.all(
  postFiles.map(async (name) => {
    const path = `src/writing/${name}`;
    const { fields } = parseFrontmatter(path, await readFile(resolve(appRoot, path), 'utf8'));
    return {
      slug: slugFromPath(path),
      title: requireField(path, 'title', fields.get('title')),
      excerpt: requireField(path, 'excerpt', fields.get('excerpt')),
      date: requireDate(path, fields.get('publishDate')),
    };
  }),
);

/**
 * Every emitted page. `path` is the URL path without leading or trailing
 * slash; '' is the index.
 */
const routes = [
  {
    path: '',
    title: SITE_NAME,
    description: 'Project catalog for Knurled Studio. Parts, writing, and links.',
  },
  {
    path: 'about',
    title: 'Mason Lavinder',
    description:
      'Founder and full-stack developer. Aerospace to data science to AI applications. The operator behind the studio.',
  },
  {
    path: 'writing',
    title: 'Writing',
    description: `Longer pieces from the studio. ${String(posts.length)} on file.`,
  },
  {
    path: 'links',
    title: 'Links',
    description: 'Tools worth keeping. Design, development, and reading, with a note on each.',
  },
  ...catalog.map((entry) => ({
    path: `tools/${entry.slug}`,
    title: `${entry.name} · ${entry.partNumber}`,
    // The description is the page's own prose. The tagline is the fallback,
    // which is why the field stays optional.
    description: clamp(entry.description?.[0] ?? entry.tagline),
  })),
  ...posts.map((post) => ({
    path: `writing/${post.slug}`,
    title: post.title,
    description: clamp(post.excerpt),
    type: 'article',
    date: post.date,
  })),
];

// ---- head injection -------------------------------------------------------

const OPEN = '<!-- head:meta -->';
const CLOSE = '<!-- /head:meta -->';

function headFor(route) {
  const url = route.path === '' ? `${ORIGIN}/` : `${ORIGIN}/${route.path}`;
  // The index is the one page whose title is the site name; suffixing it would
  // read "Knurled Studio · Knurled Studio".
  const title = route.path === '' ? route.title : `${route.title} · ${SITE_NAME}`;
  const type = route.type ?? 'website';

  const tags = [
    `<title>${attr(title)}</title>`,
    `<meta name="description" content="${attr(route.description)}" />`,
    `<link rel="canonical" href="${attr(url)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${attr(SITE_NAME)}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(route.description)}" />`,
    `<meta property="og:url" content="${attr(url)}" />`,
    `<meta property="og:image" content="${attr(OG_IMAGE)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="The Knurled Studio mark and wordmark." />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];

  if (route.date !== undefined) {
    tags.push(`<meta property="article:published_time" content="${route.date}T00:00:00Z" />`);
  }
  if (route.noindex === true) {
    tags.push('<meta name="robots" content="noindex" />');
  }

  return tags.join('\n    ');
}

/**
 * Swaps the marked block in the shell. A missing or duplicated marker means
 * index.html was edited into a shape this cannot reason about — fail loudly
 * rather than publish ten pages with one title.
 */
function withHead(shell, route) {
  const open = shell.indexOf(OPEN);
  const close = shell.indexOf(CLOSE);

  if (open === -1 || close === -1 || close < open) {
    throw new Error(`index.html: expected a ${OPEN} … ${CLOSE} block in <head>`);
  }
  if (shell.indexOf(OPEN, open + 1) !== -1 || shell.indexOf(CLOSE, close + 1) !== -1) {
    throw new Error(`index.html: ${OPEN} … ${CLOSE} must appear exactly once`);
  }

  return shell.slice(0, open) + headFor(route) + shell.slice(close + CLOSE.length);
}

// ---- emit -----------------------------------------------------------------

// Read once, up front: the loop below overwrites index.html with its own head.
const shell = await readFile(resolve(dist, 'index.html'), 'utf8');

for (const route of routes) {
  const file =
    route.path === ''
      ? resolve(dist, 'index.html')
      : resolve(dist, route.path, 'index.html');

  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, withHead(shell, route));
}

// Anything genuinely unrouted still gets the shell, and the router shows 404.
// Marked noindex, because this file answers on every missing path.
await writeFile(
  resolve(dist, '404.html'),
  withHead(shell, {
    path: '404',
    title: 'Not found',
    description: 'No part at this path.',
    noindex: true,
  }),
);

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((route) => {
    const url = route.path === '' ? `${ORIGIN}/` : `${ORIGIN}/${route.path}`;
    const lastmod = route.date === undefined ? '' : `\n    <lastmod>${route.date}</lastmod>`;
    return `  <url>\n    <loc>${xml(url)}</loc>${lastmod}\n  </url>`;
  }),
  '</urlset>',
  '',
].join('\n');

await writeFile(resolve(dist, 'sitemap.xml'), sitemap);

await writeFile(
  resolve(dist, 'robots.txt'),
  ['User-agent: *', 'Allow: /', '', `Sitemap: ${ORIGIN}/sitemap.xml`, ''].join('\n'),
);

await writeFile(resolve(dist, '.nojekyll'), '');

process.stdout.write(
  `spa-fallback: ${String(routes.length)} routes + 404.html + sitemap.xml + robots.txt + .nojekyll\n`,
);
