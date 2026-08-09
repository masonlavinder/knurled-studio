import { catalog } from '@knurled/catalog';
import { cx, Panel, PartNumber, StatusChip } from '@knurled/kit';
import { Link } from 'react-router';

import { PageHead } from '../shell/Shell.tsx';
import styles from './Index.module.css';

/** Ascending by part number. The catalog is validated sorted; this is display order. */
const entries = [...catalog].sort((a, b) => a.partNumber.localeCompare(b.partNumber));

export function Index() {
  return (
    <>
      <PageHead
        eyebrow="Catalog"
        title="Index"
        lede={`${String(entries.length)} parts. Each one runs on its own subdomain.`}
      />

      <ul className={styles.list}>
        {entries.map((entry) => {
          const shelved = entry.status === 'SHELVED';
          return (
            <li key={entry.partNumber}>
              <Panel
                interactive
                as={Link}
                to={`/tools/${entry.slug}`}
                className={cx(styles.entryPanel, shelved && styles.shelved)}
              >
                <div className={styles.card}>
                  <div className={styles.cardTop}>
                    <PartNumber id={entry.partNumber} />
                    <StatusChip status={entry.status} />
                  </div>
                  <h2 className={styles.name}>{entry.name}</h2>
                  <p className={styles.tagline}>{entry.tagline}</p>
                  <div className={styles.meta}>
                    <span>{entry.stack.join(' · ')}</span>
                    <span className={styles.cut}>{entry.firstCut}</span>
                  </div>
                </div>
              </Panel>
            </li>
          );
        })}
      </ul>
    </>
  );
}
