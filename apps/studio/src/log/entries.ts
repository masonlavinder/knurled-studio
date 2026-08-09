/**
 * The shop log. One Markdown file per entry, newest first.
 *
 * Entries are two lines, so there is nothing to render as Markdown and no
 * renderer dependency. The loader reads frontmatter for the date and treats
 * the body as plain lines.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;

export interface LogEntry {
  /** ISO date, "2026-08-09". */
  date: string;
  /** Derived from the filename, and the anchor for the entry. */
  slug: string;
  /** Body lines, blanks dropped. */
  lines: string[];
}

function parse(path: string, source: string): LogEntry {
  const match = FRONTMATTER.exec(source);

  if (!match?.[1]) {
    throw new Error(`log: ${path} has no frontmatter block`);
  }

  const fields = new Map<string, string>();
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator > 0) {
      fields.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
    }
  }

  const date = fields.get('date');
  if (date === undefined || !DATE_PATTERN.test(date)) {
    throw new Error(`log: ${path} needs a "date: YYYY-MM-DD" field, got ${String(date)}`);
  }

  const lines = source
    .slice(match[0].length)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error(`log: ${path} has no body`);
  }

  const slug = path.replace(/^.*\//, '').replace(/\.md$/, '');

  return { date, slug, lines };
}

const sources = import.meta.glob<string>('./*.md', { query: '?raw', import: 'default', eager: true });

/** Newest first. Same-day entries fall back to reverse filename order. */
export const log: readonly LogEntry[] = Object.entries(sources)
  .map(([path, source]) => parse(path, source))
  .sort((a, b) => (a.date === b.date ? b.slug.localeCompare(a.slug) : b.date.localeCompare(a.date)));
