import type { Status } from '@knurled/catalog';

import { cx } from '../cx.ts';
import styles from './StatusChip.module.css';

const STATUS_CLASS: Record<Status, string | undefined> = {
  ACTIVE: styles.active,
  MAINTAINED: styles.maintained,
  PROTOTYPE: styles.prototype,
  SHELVED: styles.shelved,
};

export interface StatusChipProps {
  status: Status;
  className?: string;
}

/** The four-value status vocabulary, rendered. ACTIVE fills; the rest outline. */
export function StatusChip({ status, className }: StatusChipProps) {
  return <span className={cx(styles.chip, STATUS_CLASS[status], className)}>{status}</span>;
}
