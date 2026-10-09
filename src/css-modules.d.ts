/**
 * Fallback types for CSS Modules.
 *
 * typescript-plugin-css-modules gives the editor the real per-class shape, so
 * `styles.panle` is flagged as you type. tsc does not load TS plugins, so this
 * keeps the command-line build resolving. See KNURLED.md.
 */
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
