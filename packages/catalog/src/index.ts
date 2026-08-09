import catalogJson from '../catalog.json' with { type: 'json' };
import { parseCatalog } from './validate.ts';
import type { CatalogEntry, Status } from './types.ts';

export type { CatalogEntry, Status } from './types.ts';
export { STATUSES } from './types.ts';
export { CatalogError, parseCatalog } from './validate.ts';

/**
 * Every project the studio has cut, sorted by part number ascending.
 *
 * Validated at module load, so a malformed catalog.json fails the build rather
 * than rendering a broken index. Part numbers are never reused or renumbered —
 * a gap is honest history.
 */
export const catalog: readonly CatalogEntry[] = Object.freeze(parseCatalog(catalogJson));

/** Looks up one entry by part number, e.g. "KS-002". */
export function byPartNumber(id: string): CatalogEntry | undefined {
  return catalog.find((entry) => entry.partNumber === id);
}

/** Every entry with the given status, in catalog order. */
export function byStatus(status: Status): CatalogEntry[] {
  return catalog.filter((entry) => entry.status === status);
}

/** Looks up one entry by slug, e.g. "watchthediff". Slugs are the tool routes. */
export function bySlug(slug: string): CatalogEntry | undefined {
  return catalog.find((entry) => entry.slug === slug);
}
