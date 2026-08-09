/**
 * Knurled Studio stylelint config.
 *
 * Rules land in Phase 2. They encode the design direction as build failures:
 * no raw hex outside tokens.css, no border-radius, no box-shadow outside the
 * focus-ring pattern, no faked light (gradient / filter / text-shadow /
 * backdrop-filter), and durations that reference --dur-*.
 *
 * Wired into the Turbo `lint` task from Phase 0 so it is live from the first
 * component rather than retrofitted onto existing CSS.
 */

/** @type {import('stylelint').Config} */
export default {
  rules: {},
};
