/**
 * Minimal frontmatter reader for the Markdown content in this app.
 *
 * Deliberately not a YAML parser. The frontmatter here is flat `key: value`
 * lines with quoted strings and one bracketed list, which is all this needs to
 * understand. A real parser would be a dependency earning its keep on five
 * files.
 */

const BLOCK = /^---\n([\s\S]*?)\n---\n?/;

export interface Frontmatter {
  fields: Map<string, string>;
  body: string;
}

export function parseFrontmatter(path: string, source: string): Frontmatter {
  const match = BLOCK.exec(source);

  if (!match?.[1]) {
    throw new Error(`${path}: no frontmatter block`);
  }

  const fields = new Map<string, string>();
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator > 0) {
      fields.set(line.slice(0, separator).trim(), unquote(line.slice(separator + 1).trim()));
    }
  }

  return { fields, body: source.slice(match[0].length) };
}

/** Strips one layer of matching quotes. */
export function unquote(value: string): string {
  const quoted = /^"(.*)"$|^'(.*)'$/.exec(value);
  return quoted ? (quoted[1] ?? quoted[2] ?? '') : value;
}

/** Reads a `["a", "b"]` frontmatter list. Returns [] when the field is absent. */
export function parseList(value: string | undefined): string[] {
  if (value === undefined || value.trim() === '') {
    return [];
  }
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((item) => unquote(item.trim()))
    .filter((item) => item !== '');
}

/** Requires an ISO date. A malformed one is an authoring error, not a fallback. */
export function requireDate(path: string, value: string | undefined): string {
  if (value === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${path}: needs a "date: YYYY-MM-DD" field, got ${String(value)}`);
  }
  return value;
}

/** Requires a non-empty field. */
export function requireField(path: string, name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === '') {
    throw new Error(`${path}: missing "${name}"`);
  }
  return value;
}

/** Filename without directory or extension. */
export function slugFromPath(path: string): string {
  return path.replace(/^.*\//, '').replace(/\.md$/, '');
}
