import type { CSSProperties } from 'react';

import styles from './Knurl.module.css';

export interface KnurlProps {
  /** Strip height in px. */
  height?: number;
}

/**
 * The texture strip: 1px lines on a 7px pitch, crossed at 45°.
 *
 * Geometry, not a raster texture, and the grain never rotates. Decorative, so
 * it is hidden from assistive technology.
 */
export function Knurl({ height = 8 }: KnurlProps) {
  return (
    <div
      aria-hidden="true"
      className={styles.knurl}
      style={{ '--knurl-height': `${String(height)}px` } as CSSProperties}
    />
  );
}
