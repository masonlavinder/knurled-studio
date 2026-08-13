export type Status = 'ACTIVE' | 'MAINTAINED' | 'PROTOTYPE' | 'SHELVED';

export interface CatalogEntry {
  partNumber: string; // "KS-002"
  slug: string; // "watchthediff"
  name: string; // "watchthediff"
  tagline: string; // one sentence, spec-sheet register
  /**
   * Optional prose for the spec page, one string per paragraph.
   *
   * The tagline is the label; this is the note beneath it. Absent is a valid
   * state — some parts need nothing more than their one line, and requiring
   * this would make adding a part two decisions instead of one.
   */
  description?: string[];
  status: Status;
  url: string | null; // null when shelved
  firstCut: string; // "2025"
  stack: string[]; // ["FastAPI", "React"]
  sourcePublic: boolean;
}

/** Declaration order is display order wherever status is enumerated. */
export const STATUSES = ['ACTIVE', 'MAINTAINED', 'PROTOTYPE', 'SHELVED'] as const satisfies readonly Status[];

export const PART_NUMBER_PATTERN = /^KS-\d{3}$/;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const FIRST_CUT_PATTERN = /^\d{4}$/;
