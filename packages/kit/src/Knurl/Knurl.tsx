import type { CSSProperties } from 'react';

import styles from './Knurl.module.css';

export interface KnurlProps {
  /**
   * Strip height in px. Omit for the default two stacked rows of diamonds —
   * a row is `--knurl-pitch` × √2 tall, so whole rows are the only heights
   * that do not clip.
   */
  height?: number;
}

/**
 * The texture strip: crossed 45° lines on a --knurl-pitch spacing, crossed at 45°.
 *
 * Geometry, not a raster texture, and the grain never rotates. Decorative, so
 * it is hidden from assistive technology.
 */
export function Knurl({ height }: KnurlProps) {
  return (
    <div
      aria-hidden="true"
      className={styles.knurl}
      style={
        height === undefined
          ? undefined
          : ({ '--knurl-height': `${String(height)}px` } as CSSProperties)
      }
    />
  );
}
