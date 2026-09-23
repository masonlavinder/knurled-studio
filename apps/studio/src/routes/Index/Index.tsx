import { catalog } from '@knurled/catalog';
import { cx, Panel, PartNumber, StatusChip } from '@knurled/kit';
import { Link } from 'react-router';

import { LINK_COUNT, POST_COUNT } from '../../lib/counts.ts';
import { PageHead, SectionRule } from '../../shell/Shell.tsx';
import styles from './Index.module.css';

/** Not parts, so they sit below the catalog rather than in it. */
const ALSO = [
  { to: '/writing', name: 'Writing', note: 'Longer pieces.', count: `${String(POST_COUNT)} pieces` },
  { to: '/links', name: 'Links', note: 'Tools worth keeping.', count: `${String(LINK_COUNT)} entries` },
];

/**
 * Newest first. Part numbers are assigned in the order a project is first cut,
 * so descending by part number is chronological without needing a date — and
 * firstCut is only a year, which cannot order two parts cut the same year.
 * The catalog file itself stays sorted ascending; this is display order.
 */
const entries = [...catalog].sort((a, b) => b.partNumber.localeCompare(a.partNumber));

export function Index() {
  return (
    <>
      <PageHead
        eyebrow="Catalog"
        title="Knurled Studio"
        description="A curated collection of tools and projects from Knurled Studio, a personal project studio by Mason Lavinder."
        lede={`Knurling - the art and craft of creating texture`}
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

      <section className={styles.also}>
        <SectionRule label="Also on file" />
        <ul className={styles.alsoList}>
          {ALSO.map((item) => (
            <li key={item.to}>
              <Panel interactive as={Link} to={item.to} className={cx(styles.alsoPanel)}>
                <div className={styles.alsoCard}>
                  <div className={styles.alsoTop}>
                    <h3 className={styles.alsoName}>{item.name}</h3>
                    <span className={styles.alsoCount}>{item.count}</span>
                  </div>
                  <p className={styles.alsoNote}>{item.note}</p>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
