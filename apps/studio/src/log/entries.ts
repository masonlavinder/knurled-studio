/**
 * The shop log. One Markdown file per entry, newest first.
 *
 * Entries are two lines, so there is nothing to render as Markdown and no
 * renderer involved here — the body is read as plain lines. Long-form writing
 * lives under /writing instead.
 */
import { parseFrontmatter, requireDate, slugFromPath } from '../lib/frontmatter.ts';

export interface LogEntry {
  /** ISO date, "2026-08-09". */
  date: string;
  /** Derived from the filename. */
  slug: string;
  /** Body lines, blanks dropped. */
  lines: string[];
}

const sources = import.meta.glob<string>('./*.md', { query: '?raw', import: 'default', eager: true });

/** Newest first. Same-day entries fall back to reverse filename order. */
export const log: readonly LogEntry[] = Object.entries(sources)
  .map(([path, source]) => {
    const { fields, body } = parseFrontmatter(path, source);
    const lines = body
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      throw new Error(`${path}: has no body`);
    }

    return { date: requireDate(path, fields.get('date')), slug: slugFromPath(path), lines };
  })
  .sort((a, b) => (a.date === b.date ? b.slug.localeCompare(a.slug) : b.date.localeCompare(a.date)));
