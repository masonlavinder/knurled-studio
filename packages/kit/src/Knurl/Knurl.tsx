import { useId } from 'react';

import styles from './Knurl.module.css';

/**
 * Band geometry, in px.
 *
 * These are constants rather than custom properties because the band is an
 * SVG `<pattern>` in `userSpaceOnUse`, which needs real numbers at render
 * time — a `var()` cannot reach a pattern's `width`/`height` attributes. The
 * colour still comes from the token layer, via `--knurl-line` on the stroke.
 *
 * The band is SVG rather than gradients because the triangles stand apart.
 * Crossing `repeating-linear-gradient` families can only ever produce a
 * lattice whose triangles share their edges; separating them needs closed
 * outlines, which gradients cannot draw.
 */
const BASE = 15;
const HEIGHT = 12;
const STROKE = 1.5;
const ROWS = 2;

/** Clear space left around every triangle, the same on all four sides. */
const GAP = 3;

/**
 * Horizontal step from one triangle to the next.
 *
 * NOT `BASE + GAP`. An up-triangle's right edge and the next down-triangle's
 * left edge are parallel, so what reads as "the space between them" is the
 * perpendicular distance between those edges — spacing the bounding boxes
 * instead leaves them nearly touching at the baseline and splayed into a
 * wedge at the apex. Solving for a perpendicular clear of GAP gives this,
 * where the square root is the length of a triangle's sloped side.
 */
const STEP = BASE / 2 + ((GAP + STROKE) * Math.sqrt(HEIGHT ** 2 + BASE ** 2 / 4)) / HEIGHT;

/**
 * Vertical step. The facing edges here are horizontal and parallel already,
 * so the clear space is just the gap — no projection needed.
 */
const PITCH = HEIGHT + GAP;
const BAND = PITCH * ROWS;

/** Half the stroke, so the outline sits inside the band instead of clipping. */
const INSET = STROKE / 2;

/**
 * A triangle in the cell at (`x`, `y`), pointing up or down.
 *
 * Built by joining a points list rather than interpolating, because the lint
 * rules reject bare numbers in a template literal and a path is nothing else.
 */
function triangle(x: number, y: number, pointUp: boolean): string {
  const base = y + (pointUp ? HEIGHT - INSET : INSET);
  const apex = y + (pointUp ? INSET : HEIGHT - INSET);
  const points = [
    [x + INSET, base],
    [x + BASE / 2, apex],
    [x + BASE - INSET, base],
  ];
  return 'M' + points.map((point) => point.join(' ')).join(' L') + ' Z';
}

/**
 * The tile is two cells across and both rows down.
 *
 * Each row alternates, so an inverted triangle sits in the space between two
 * of its neighbours; and the second row starts on the opposite orientation,
 * so every column reads as one way up above and the other way below.
 */
const TILE_WIDTH = STEP * 2;
const TILE_HEIGHT = PITCH * ROWS;

const TRIANGLES = [
  triangle(0, 0, true),
  triangle(STEP, 0, false),
  triangle(0, PITCH, false),
  triangle(STEP, PITCH, true),
];

export interface KnurlProps {
  /** Band height in px. Omit for the house depth, two rows of triangles. */
  height?: number;
}

/**
 * The banner: two aligned rows of open triangles alternating point-up and
 * point-down, spaced apart rather than sharing edges.
 *
 * Geometry, not a raster texture, and the grain never rotates. Decorative, so
 * it is hidden from assistive technology.
 */
export function Knurl({ height = BAND }: KnurlProps) {
  // Pattern ids are document-global; two banners on a page would collide.
  const id = useId();

  return (
    <svg aria-hidden="true" className={styles.knurl} width="100%" height={height}>
      <defs>
        <pattern id={id} width={TILE_WIDTH} height={TILE_HEIGHT} patternUnits="userSpaceOnUse">
          {TRIANGLES.map((d) => (
            <path key={d} d={d} fill="none" stroke="var(--knurl-line)" strokeWidth={STROKE} />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
