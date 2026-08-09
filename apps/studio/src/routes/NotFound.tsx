import { cx } from '@knurled/kit';
import { Link } from 'react-router';

import { PageHead } from '../shell/Shell.tsx';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <>
      <PageHead
        eyebrow={<span className={styles.code}>HTTP 404</span>}
        title="No part at this address"
        lede="Part numbers come from the catalog. This one is not in it."
      />
      <Link to="/" className={cx(styles.back)}>
        ← Index
      </Link>
    </>
  );
}
