/**
 * Tools worth keeping. Ported from the personal site.
 *
 * Grouped by the first category, which is the one that decides where a link
 * belongs; the rest ride along as labels.
 */

export interface LinkEntry {
  title: string;
  url: string;
  description: string;
  categories: string[];
}

export const links: readonly LinkEntry[] = [
  {
    title: 'Coolors',
    url: 'https://coolors.co/',
    description: 'Fast color palette generator for creating solid color schemes.',
    categories: ['design', 'tools'],
  },
  {
    title: '7 Rules for Creating Gorgeous UI',
    url: 'https://medium.com/@erikdkennedy/7-rules-for-creating-gorgeous-ui-part-1-559d4e805cda',
    description: 'Essential design principles for developers who want to get started.',
    categories: ['design', 'learning'],
  },
  {
    title: 'Figma',
    url: 'https://figma.com',
    description: 'Industry Standard. Stop mocking in PowerPoint',
    categories: ['design', 'tools'],
  },
  {
    title: 'Software is Joy',
    url: 'https://blog.jsbarretto.com/post/software-is-joy?utm_source=tldrwebdev',
    description: 'Thoughtful article about the joy and craft of software dev.',
    categories: ['learning', 'articles'],
  },
  {
    title: 'TLDR Tech',
    url: 'https://tldr.tech/',
    description: 'This actually does help me stay up to date on news. Despite their Instagram ads.',
    categories: ['learning', 'news'],
  },
  {
    title: 'Vite',
    url: 'https://vite.dev/',
    description: 'My default frontend build tool with extremely-fast dev server. Scales well.',
    categories: ['dev', 'tools'],
  },
  {
    title: 'CSS Loaders',
    url: 'https://css-loaders.com/',
    description: 'Collection of copy-paste CSS loading animations.',
    categories: ['design'],
  },
  {
    title: 'Google Fonts',
    url: 'https://fonts.google.com/',
    description: 'Free, open-source fonts optimized for the web.',
    categories: ['design'],
  },
  {
    title: 'Storybook',
    url: 'https://storybook.js.org/',
    description: 'Tool for building UI components in isolation for React et al.',
    categories: ['dev', 'tools'],
  },
  {
    title: 'Lucide Icons',
    url: 'https://lucide.dev/guide/packages/lucide-react',
    description: 'Consistent icon library for React applications.',
    categories: ['design', 'dev'],
  },
  {
    title: 'Visual Studio Code',
    url: 'https://code.visualstudio.com/',
    description: 'I am basic. I like VSCode.',
    categories: ['dev', 'tools'],
  },
  {
    title: 'Bundlephobia',
    url: 'https://bundlephobia.com/',
    description: 'Bundlephobia helps you find the cost of adding a npm package to your bundle.',
    categories: ['dev', 'tools'],
  }
];


/** Category order on the page. Anything unlisted sorts to the end. */
const ORDER = ['dev', 'design', 'learning'];

function rank(category: string): number {
  const index = ORDER.indexOf(category);
  return index === -1 ? ORDER.length : index;
}

export interface LinkGroup {
  category: string;
  entries: LinkEntry[];
}

const grouped = new Map<string, LinkEntry[]>();
for (const link of links) {
  const key = link.categories[0] ?? 'other';
  const bucket = grouped.get(key);
  if (bucket) {
    bucket.push(link);
  } else {
    grouped.set(key, [link]);
  }
}

export const linkGroups: readonly LinkGroup[] = [...grouped.entries()]
  .map(([category, entries]) => ({
    category,
    entries: [...entries].sort((a, b) => a.title.localeCompare(b.title)),
  }))
  .sort((a, b) => rank(a.category) - rank(b.category) || a.category.localeCompare(b.category));
