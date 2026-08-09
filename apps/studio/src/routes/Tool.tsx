import { bySlug } from '@knurled/catalog';
import { cx, Panel, PartNumber, SpecTable, StatusChip } from '@knurled/kit';
import { Link, useParams } from 'react-router';

import { PageHead } from '../shell/Shell.tsx';
import { NotFound } from './NotFound.tsx';
import styles from './Tool.module.css';

/** Hostname only. The full URL is the link target, not the label. */
function hostOf(url: string): string {
  return new URL(url).hostname;
}

export function Tool() {
  const { slug } = useParams();
  const entry = slug === undefined ? undefined : bySlug(slug);

  if (!entry) {
    return <NotFound />;
  }

  return (
    <>
      <Link to="/" className={cx(styles.back)}>
        ← Index
      </Link>

      <div className={styles.badges}>
        <PartNumber id={entry.partNumber} />
        <StatusChip status={entry.status} />
      </div>

      <PageHead title={entry.name} lede={entry.tagline} />

      <div className={styles.spec}>
        <Panel>
          <SpecTable
            rows={[
              { label: 'Stack', value: entry.stack.join(' · ') },
              { label: 'First cut', value: entry.firstCut },
              { label: 'Host', value: entry.url === null ? '—' : hostOf(entry.url) },
              { label: 'Source', value: entry.sourcePublic ? 'Public' : 'Closed' },
              { label: 'Status', value: entry.status },
            ]}
          />
        </Panel>
      </div>

      {entry.url === null ? (
        <p className={styles.shelvedNote}>Shelved. Nothing is running at this part number.</p>
      ) : (
        <div className={styles.spec}>
          <Panel interactive as="a" href={entry.url} tone="accent">
            <div className={styles.launch}>
              <span className={styles.launchLabel}>Open</span>
              <span className={styles.launchHost}>{hostOf(entry.url)}</span>
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
