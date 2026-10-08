/**
 * Whether the reader asked for less motion. Read at call time rather than
 * cached, so flipping the OS setting takes effect on the next mount.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
