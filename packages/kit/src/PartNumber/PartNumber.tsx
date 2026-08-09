import { cx } from '../cx.ts';
import styles from './PartNumber.module.css';

export interface PartNumberProps {
  /** A part number from the catalog, e.g. "KS-002". */
  id: string;
  className?: string;
}

/** Renders a part number in the house accent. Numbers come from the catalog. */
export function PartNumber({ id, className }: PartNumberProps) {
  return <span className={cx(styles.partNumber, className)}>{id}</span>;
}
