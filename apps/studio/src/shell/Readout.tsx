import { catalog } from '@knurled/catalog';
import { useEffect, useRef } from 'react';

import styles from './Readout.module.css';

/** Zero-padded to a fixed width so the strip never reflows as it counts. */
function axis(value: number): string {
  return value.toFixed(1).padStart(6, '0');
}

function clockTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour12: false });
}

/**
 * The digital readout across the top of every page, the way a machine's
 * display reads off a lathe: pointer position, the time, the day this build
 * was cut and the parts on file.
 *
 * Updated by writing textContent from refs, not by state. The pointer can fire
 * a hundred times a second and a React render each time would be waste for a
 * dozen characters. Decorative, so hidden from assistive technology — none of
 * it is information the page does not already give.
 */
export function Readout() {
  const coords = useRef<HTMLSpanElement>(null);
  const clock = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    let x = 0;
    let y = 0;

    function paint() {
      frame = 0;
      if (coords.current) {
        coords.current.textContent = `X ${axis(x)}  Y ${axis(y)}`;
      }
    }

    function onMove(event: PointerEvent) {
      x = event.pageX;
      y = event.pageY;
      if (frame === 0) {
        frame = requestAnimationFrame(paint);
      }
    }

    function tick() {
      if (clock.current) {
        clock.current.textContent = clockTime(new Date());
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    const timer = window.setInterval(tick, 1000);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.clearInterval(timer);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.readout} aria-hidden="true">
      <span ref={coords} className={styles.coords}>
        X ----.-  Y ----.-
      </span>
      <span className={styles.cell}>
        <span ref={clock}>{clockTime(new Date())}</span>
      </span>
      <span className={styles.cell}>LAST CUT {__BUILD_DATE__}</span>
      <span className={styles.cell}>{String(catalog.length).padStart(3, '0')} PARTS ON FILE</span>
    </div>
  );
}
