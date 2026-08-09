import { byPartNumber } from '@knurled/catalog';

import { ColorBar } from '../ColorBar/ColorBar.tsx';
import { Knurl } from '../Knurl/Knurl.tsx';
import { Mark } from '../Mark/Mark.tsx';
import { PartNumber } from '../PartNumber/PartNumber.tsx';
import { StatusChip } from '../StatusChip/StatusChip.tsx';
import { cx } from '../cx.ts';
import styles from './StudioFooter.module.css';

/** The studio itself is KS-000, so its url is where every app points home. */
const STUDIO_HOME = byPartNumber('KS-000')?.url ?? 'https://knurled.studio';

export interface StudioFooterProps {
  /** The mounting app's own part number, e.g. "KS-002". */
  partNumber: string;
  className?: string;
}

/**
 * The plate every app carries. One subdomain per tool, one footer across all
 * of them — this is what makes them read as one studio.
 *
 * Throws on an unknown part number. Part numbers come from the catalog and
 * nowhere else, so a miss is an authoring error, and every page mounts this.
 */
export function StudioFooter({ partNumber, className }: StudioFooterProps) {
  const entry = byPartNumber(partNumber);

  if (!entry) {
    throw new Error(
      `StudioFooter: ${partNumber} is not in the catalog. Add it to packages/catalog/catalog.json — part numbers are not invented at the call site.`,
    );
  }

  return (
    <footer className={cx(styles.footer, className)}>
      <Knurl height={7} />
      <div className={styles.bar}>
        <div className={styles.identity}>
          <Mark size={16} />
          <PartNumber id={entry.partNumber} />
          <span className={styles.name}>{entry.name}</span>
          <StatusChip status={entry.status} />
        </div>

        <ColorBar />

        <a className={styles.home} href={STUDIO_HOME}>
          knurled.studio
        </a>
      </div>
    </footer>
  );
}
