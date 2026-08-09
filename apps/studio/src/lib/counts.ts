import { links } from '../links/links.ts';

/**
 * Counts for the index, taken from the data rather than typed in.
 *
 * The glob here is deliberately NOT eager: Vite resolves it to a map of path
 * to loader, so counting the keys never loads a post. The index pays for the
 * number, not for the writing.
 */
export const POST_COUNT = Object.keys(import.meta.glob('../writing/*.md')).length;

export const LINK_COUNT = links.length;
