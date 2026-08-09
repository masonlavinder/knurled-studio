import { cx } from '@knurled/kit';

import { log } from '../log/entries.ts';
import { PageHead } from '../shell/Shell.tsx';
import styles from './Log.module.css';

export function Log() {
  return (
    <>
      <PageHead eyebrow="Shop log" title="Log" lede="What changed, and when. Newest first." />

      <ul className={styles.list}>
        {log.map((entry, index) => (
          <li key={entry.slug} className={cx(styles.entry, index > 0 && styles.ruled)}>
            <time className={styles.date} dateTime={entry.date}>
              {entry.date}
            </time>
            <div className={styles.lines}>
              {entry.lines.map((line) => (
                <p key={line} className={styles.line}>
                  {line}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
