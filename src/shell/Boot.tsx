import { catalog } from "../catalog/index.ts";
import { cx } from "../utils/cx.ts";
import { useEffect, useState } from "react";

import { LINK_COUNT, POST_COUNT } from "../utils/counts.ts";
import styles from "./Boot.module.css";

const SEEN_KEY = "knurled:booted";
const BAR_CELLS = 24;

function count(n: number): string {
  return String(n).padStart(3, "0");
}

/** Each line appears once the progress passes its threshold, in percent. */
const LINES = [
  { at: 8, label: "CHECKING STOCK", value: "OK" },
  { at: 26, label: "LOADING CATALOG", value: `${count(catalog.length)} PARTS` },
  { at: 44, label: "INDEXING WRITING", value: `${count(POST_COUNT)} PIECES` },
  { at: 62, label: "SHARPENING TOOLS", value: `${count(LINK_COUNT)} LINKS` },
  { at: 80, label: "SPINNING UP LATHE", value: "OK" },
];

/**
 * sessionStorage can be missing or throw — private windows, blocked site
 * data. Either way the answer is "not seen", and a reader who sees the boot
 * twice has lost a second, not the page.
 */
function seen(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) !== null;
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Nothing to do. See seen().
  }
}

/**
 * Only on a cold landing on the index, once a session, and never for a
 * reader who asked for less motion. A deep link to a post or a #section is
 * someone who wants that thing now.
 */
function shouldBoot(): boolean {
  return (
    window.location.pathname === "/" && window.location.hash === "" && !seen()
  );
}

/**
 * A duration token in ms, read from CSS so the stylesheet and the counter
 * cannot disagree. Unit-aware: the minifier rewrites 2000ms as 2s in the
 * built CSS, and a bare parseFloat would read that as 2.6ms.
 */
function durationToken(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const value = Number.parseFloat(raw);
  const ms = raw.endsWith("ms") ? value : value * 1000;
  return Number.isFinite(ms) && ms > 0 ? ms : fallback;
}

type Phase = "run" | "exit" | "done";

/**
 * The boot screen. A machine powering on: a few lines of POST, a block
 * progress bar, then the screen lifts away off the top.
 *
 * While it runs, <html data-booting> holds back the hero's own entrance so
 * the type stamps in as the screen clears rather than behind it. The page
 * underneath is mounted and readable the whole time; this only covers it.
 * Any key or press skips.
 */
export function Boot() {
  const [phase, setPhase] = useState<Phase>(() =>
    shouldBoot() ? "run" : "done",
  );
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (phase !== "run") {
      return;
    }

    markSeen();
    const root = document.documentElement;
    root.dataset.booting = "";

    const duration = durationToken("--dur-boot", 2000);
    const hold = durationToken("--dur-boot-hold", 3000);
    let holdTimer = 0;
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      // A frame's timestamp is when the frame began, which can be a little
      // before `start` on the first one; a negative count would throw in
      // repeat() and take the page down with it.
      const next = Math.min(
        100,
        Math.max(0, Math.round(((now - start) / duration) * 100)),
      );
      setPercent(next);
      if (next < 100) {
        frame = requestAnimationFrame(step);
      } else {
        holdTimer = window.setTimeout(() => {
          setPhase("exit");
        }, hold);
      }
    });

    function skip() {
      setPercent(100);
      setPhase("exit");
    }

    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(holdTimer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "done") {
      delete document.documentElement.dataset.booting;
    }
  }, [phase]);

  if (phase === "done") {
    return null;
  }

  const filled = Math.round((percent / 100) * BAR_CELLS);

  return (
    <div
      aria-hidden="true"
      className={cx(styles.boot, phase === "exit" && styles.exit)}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) {
          setPhase("done");
        }
      }}
    >
      <div className={styles.screen}>
        <p className={styles.title}>KNURLED STUDIO ─ KS-000</p>
        <p className={styles.sub}>WORKSHOP OF MASON LAVINDER</p>

        <ul className={styles.lines}>
          {LINES.filter((line) => percent >= line.at).map((line) => (
            <li key={line.label} className={styles.line}>
              <span className={styles.label}>{line.label}</span>
              <span className={styles.dots} />
              <span className={styles.value}>{line.value}</span>
            </li>
          ))}
        </ul>

        <p className={styles.progress}>
          <span className={styles.bar}>
            {"█".repeat(filled)}
            <span className={styles.empty}>
              {"░".repeat(BAR_CELLS - filled)}
            </span>
          </span>
          <span className={styles.percent}>
            {String(percent).padStart(3, " ")}%
          </span>
        </p>

        {/* Shown during the hold at 100%, which is --dur-boot-hold: 3000ms.
            If that token changes, change the number here — it is a joke,
            but it is not allowed to be a lie. */}
        {percent === 100 ? (
          <p className={styles.aside}>
            {"// added a sleep(3000) so this gimmick would land"}
          </p>
        ) : null}

        <p className={styles.hint}>
          PRESS ANY KEY<span className={styles.cursor}>▪</span>
        </p>
      </div>
    </div>
  );
}
