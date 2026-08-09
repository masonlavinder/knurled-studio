import {
  parseFrontmatter,
  parseList,
  requireDate,
  requireField,
  slugFromPath,
} from '../lib/frontmatter.ts';

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  /** Markdown body. The title heading is stripped at authoring time. */
  body: string;
}

const sources = import.meta.glob<string>('./*.md', { query: '?raw', import: 'default', eager: true });

/** Newest first. */
export const posts: readonly Post[] = Object.entries(sources)
  .map(([path, source]) => {
    const { fields, body } = parseFrontmatter(path, source);
    const slug = slugFromPath(path);

    if (fields.get('slug') !== slug) {
      throw new Error(`${path}: frontmatter slug "${String(fields.get('slug'))}" must match the filename`);
    }

    return {
      slug,
      title: requireField(path, 'title', fields.get('title')),
      date: requireDate(path, fields.get('publishDate')),
      excerpt: requireField(path, 'excerpt', fields.get('excerpt')),
      tags: parseList(fields.get('tags')),
      body: body.trim(),
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

export function postBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}
