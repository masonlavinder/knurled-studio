/**
 * @knurled/kit — tokens and primitives.
 *
 * The three global stylesheets are separate entry points, imported once per
 * app in this order:
 *
 *   import '@knurled/kit/global.css';   // must be first — declares the layers
 *   import '@knurled/kit/tokens.css';
 *   import '@knurled/kit/fonts.css';
 *
 * patterns.css is deliberately absent from that list. It is reached only
 * through `composes:` in a CSS Module, never referenced from JSX.
 */

export { ColorBar, type ColorBarProps } from './ColorBar/ColorBar.tsx';
export { INKS, type Ink } from './ColorBar/inks.ts';
export { cx } from './cx.ts';
export { Knurl, type KnurlProps } from './Knurl/Knurl.tsx';
export { Mark, type MarkProps } from './Mark/Mark.tsx';
export { Panel, type PanelProps, type PanelTone } from './Panel/Panel.tsx';
export { PartNumber, type PartNumberProps } from './PartNumber/PartNumber.tsx';
export { RegistrationMarks } from './RegistrationMarks/RegistrationMarks.tsx';
export { SpecTable, type SpecRow, type SpecTableProps } from './SpecTable/SpecTable.tsx';
export { StatusChip, type StatusChipProps } from './StatusChip/StatusChip.tsx';
export { StudioFooter, type StudioFooterProps } from './StudioFooter/StudioFooter.tsx';
