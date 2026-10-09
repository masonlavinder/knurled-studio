import type { CSSProperties } from 'react';

import { cx } from '../cx.ts';
import { INKS } from './inks.ts';
import styles from './ColorBar.module.css';

export interface ColorBarProps {
  /** Patch edge length in px. */
  size?: number;
  className?: string;
}

/**
 * The press control strip — a solid patch of every ink, butted together the
 * way a color bar is printed on the trim edge of packaging.
 *
 * Decorative, so it is hidden from assistive technology; the token name is on
 * each patch as a tooltip for anyone reading with a mouse. Only the ink token
 * is passed from here — the declaration that uses it lives in the stylesheet.
 */
export function ColorBar({ size = 10, className }: ColorBarProps) {
  return (
    <div
      aria-hidden="true"
      className={cx(styles.strip, className)}
      style={{ '--patch-size': `${String(size)}px` } as CSSProperties}
    >
      {INKS.map((ink) => (
        <span
          key={ink}
          className={styles.patch}
          title={ink}
          style={{ '--ink': `var(${ink})` } as CSSProperties}
        />
      ))}
    </div>
  );
}
