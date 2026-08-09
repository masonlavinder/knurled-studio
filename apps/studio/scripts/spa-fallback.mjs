/**
 * Static hosts have no SPA fallback. A request for /about is a request for a
 * file, and GitHub Pages answers with its own 404 page.
 *
 * The usual fix is to serve the app shell as 404.html. That renders the right
 * page, but every real URL answers HTTP 404 — fine for a human, wrong for a
 * crawler, and wrong on the wire.
 *
 * Every route here is known at build time: four static ones, plus one per
 * catalog entry and one per post. So write a real index.html at each path and
 * let them answer 200. 404.html stays, and now only catches paths that really
 * are missing.
 *
 * .nojekyll stops Pages running the output through Jekyll, which would drop
 * any path segment beginning with an underscore.
 */
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(appRoot, 'dist');
const shell = await readFile(resolve(dist, 'index.html'));

const STATIC_ROUTES = ['about', 'links', 'log', 'writing'];

const catalog = JSON.parse(
  await readFile(resolve(appRoot, '../../packages/catalog/catalog.json'), 'utf8'),
);
const toolRoutes = catalog.map((entry) => `tools/${entry.slug}`);

const postRoutes = (await readdir(resolve(appRoot, 'src/writing')))
  .filter((name) => name.endsWith('.md'))
  .map((name) => `writing/${name.replace(/\.md$/, '')}`);

const routes = [...STATIC_ROUTES, ...toolRoutes, ...postRoutes];

for (const route of routes) {
  const dir = resolve(dist, route);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, 'index.html'), shell);
}

// Anything genuinely unrouted still gets the shell, and the router shows 404.
await copyFile(resolve(dist, 'index.html'), resolve(dist, '404.html'));
await writeFile(resolve(dist, '.nojekyll'), '');

process.stdout.write(`spa-fallback: ${String(routes.length)} routes + 404.html + .nojekyll\n`);
