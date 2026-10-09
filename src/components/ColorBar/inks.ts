/**
 * Every ink in the palette, dark to light within each family.
 *
 * Semantic aliases are left out — they point at these, and a control strip
 * shows each ink once. Kept apart from the component so fast refresh keeps
 * working, and so anything else needing the palette can read it.
 */
export const INKS = [
  '--stock-950',
  '--stock-800',
  '--stock-600',
  '--stock-400',
  '--stock-100',
  '--stock-050',
  '--paper',
  '--lavinder-600',
  '--lavinder-400',
  '--lavinder-050',
  '--verdigris-700',
  '--verdigris-050',
] as const;

export type Ink = (typeof INKS)[number];
