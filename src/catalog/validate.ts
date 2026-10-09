import {
  FIRST_CUT_PATTERN,
  PART_NUMBER_PATTERN,
  SLUG_PATTERN,
  STATUSES,
  type CatalogEntry,
  type Status,
} from './types.ts';

/** Thrown when catalog.json does not match CatalogEntry[]. Reports every fault at once. */
export class CatalogError extends Error {
  readonly faults: readonly string[];

  constructor(faults: readonly string[]) {
    super(`catalog.json failed validation:\n${faults.map((f) => `  · ${f}`).join('\n')}`);
    this.name = 'CatalogError';
    this.faults = faults;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStatus(value: unknown): value is Status {
  return STATUSES.includes(value as Status);
}

function checkEntry(raw: unknown, at: string, faults: string[]): void {
  if (!isRecord(raw)) {
    faults.push(`${at}: expected an object, got ${raw === null ? 'null' : typeof raw}`);
    return;
  }

  const { partNumber, slug, name, tagline, description, status, url, firstCut, stack, sourcePublic } =
    raw;

  if (typeof partNumber !== 'string' || !PART_NUMBER_PATTERN.test(partNumber)) {
    faults.push(`${at}: partNumber must match KS-NNN, got ${JSON.stringify(partNumber)}`);
  }
  if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
    faults.push(`${at}: slug must be lowercase kebab-case, got ${JSON.stringify(slug)}`);
  }
  if (typeof name !== 'string' || name.trim() === '') {
    faults.push(`${at}: name must be a non-empty string`);
  }
  if (typeof tagline !== 'string' || tagline.trim() === '') {
    faults.push(`${at}: tagline must be a non-empty string`);
  } else if (tagline.includes('\n')) {
    faults.push(`${at}: tagline must be one line`);
  }
  // Optional, but an empty or blank-padded one is an authoring slip, not a
  // deliberate absence. Omit the key instead.
  if (description !== undefined) {
    if (
      !Array.isArray(description) ||
      description.length === 0 ||
      description.some((p) => typeof p !== 'string' || p.trim() === '')
    ) {
      faults.push(`${at}: description must be omitted or a non-empty array of non-empty strings`);
    }
  }
  if (!isStatus(status)) {
    faults.push(`${at}: status must be one of ${STATUSES.join(' | ')}, got ${JSON.stringify(status)}`);
  }
  if (url !== null && (typeof url !== 'string' || !url.startsWith('https://'))) {
    faults.push(`${at}: url must be null or an https:// URL, got ${JSON.stringify(url)}`);
  }
  // A shelved project is not reachable. Saying otherwise on the index would be a lie.
  if (status === 'SHELVED' && url !== null) {
    faults.push(`${at}: SHELVED entries must have url: null`);
  }
  if (typeof firstCut !== 'string' || !FIRST_CUT_PATTERN.test(firstCut)) {
    faults.push(`${at}: firstCut must be a four-digit year, got ${JSON.stringify(firstCut)}`);
  }
  if (!Array.isArray(stack) || stack.length === 0 || stack.some((s) => typeof s !== 'string' || s.trim() === '')) {
    faults.push(`${at}: stack must be a non-empty array of non-empty strings`);
  }
  if (typeof sourcePublic !== 'boolean') {
    faults.push(`${at}: sourcePublic must be a boolean`);
  }
}

/**
 * Validates catalog.json and returns it typed. Throws CatalogError on any fault.
 *
 * Beyond shape, this enforces the conventions in KNURLED.md: part numbers are
 * unique and never reused, slugs are unique because they are routes, and the
 * file stays sorted so diffs stay readable.
 */
export function parseCatalog(data: unknown): CatalogEntry[] {
  const faults: string[] = [];

  if (!Array.isArray(data)) {
    throw new CatalogError(['expected a top-level array of entries']);
  }
  if (data.length === 0) {
    throw new CatalogError(['catalog is empty; KS-000 is the studio itself and must be present']);
  }

  data.forEach((raw, i) => {
    checkEntry(raw, `[${String(i)}]`, faults);
  });

  if (faults.length > 0) {
    throw new CatalogError(faults);
  }

  const entries = data as CatalogEntry[];

  const seenPartNumbers = new Map<string, number>();
  const seenSlugs = new Map<string, number>();
  entries.forEach((entry, i) => {
    const priorPart = seenPartNumbers.get(entry.partNumber);
    if (priorPart !== undefined) {
      faults.push(`[${String(i)}]: part number ${entry.partNumber} already used at [${String(priorPart)}]`);
    }
    seenPartNumbers.set(entry.partNumber, i);

    const priorSlug = seenSlugs.get(entry.slug);
    if (priorSlug !== undefined) {
      faults.push(`[${String(i)}]: slug "${entry.slug}" already used at [${String(priorSlug)}]`);
    }
    seenSlugs.set(entry.slug, i);
  });

  for (let i = 1; i < entries.length; i += 1) {
    const previous = entries[i - 1];
    const current = entries[i];
    if (previous && current && previous.partNumber >= current.partNumber) {
      faults.push(`[${String(i)}]: ${current.partNumber} must sort after ${previous.partNumber}`);
    }
  }

  if (faults.length > 0) {
    throw new CatalogError(faults);
  }

  return entries;
}
