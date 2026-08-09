import { cx } from '../cx.ts';
import styles from './RegistrationMarks.module.css';

/**
 * Corner ticks marking a section edge, the way a drawing marks its trim.
 *
 * Absolutely positioned: the parent needs its own positioning context.
 * Decorative, so it is hidden from assistive technology.
 */
export function RegistrationMarks() {
  return (
    <div aria-hidden="true" className={styles.marks}>
      <span className={cx(styles.tick, styles.topLeft)} />
      <span className={cx(styles.tick, styles.topRight)} />
      <span className={cx(styles.tick, styles.bottomLeft)} />
      <span className={cx(styles.tick, styles.bottomRight)} />
    </div>
  );
}
