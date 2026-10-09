import type { ReactNode } from 'react';

import { cx } from '../cx.ts';
import styles from './SpecTable.module.css';

export interface SpecRow {
  label: string;
  value: ReactNode;
}

export interface SpecTableProps {
  rows: SpecRow[];
  /** Optional heading, rendered as the table caption. */
  caption?: string;
  className?: string;
}

/** A spec sheet. Labels left and muted, values right and tabular. */
export function SpecTable({ rows, caption, className }: SpecTableProps) {
  return (
    <table className={cx(styles.table, className)}>
      {caption === undefined ? null : <caption className={styles.caption}>{caption}</caption>}
      <tbody>
        {rows.map((row, index) => {
          const ruled = index > 0 ? styles.ruled : undefined;
          return (
            <tr key={row.label}>
              <th scope="row" className={cx(styles.label, ruled)}>
                {row.label}
              </th>
              <td className={cx(styles.value, ruled)}>{row.value}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
