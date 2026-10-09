import { cx } from "../utils/cx.ts";
import { Mark, StudioFooter } from "../components/index.ts";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { Boot } from "./Boot.tsx";
import { Readout } from "./Readout.tsx";
import styles from "./Shell.module.css";

/** KS-000. The studio's own part number, and the only place it is written. */
export const STUDIO_PART_NUMBER = "KS-000";

/**
 * The site is one page now, so the nav is a set of jumps into it. Written as
 * /#id rather than #id so they work from a post or a spec page too: the
 * router lands on the index and useRouteReset scrolls to the section.
 */
const NAV = [
  { id: "parts", label: "Parts" },
  { id: "operator", label: "Operator" },
  { id: "elsewhere", label: "Elsewhere" },
];

/**
 * On navigation, put the viewport and the keyboard where the reader asked to
 * go: the named section if the URL has a hash, otherwise the top of the new
 * page. A client-side route change does neither on its own, which strands
 * screen reader and keyboard users mid-document.
 *
 * Keyed on the location key, not the path, so clicking the same section link
 * twice still scrolls back to it. Runs on first render too when there is a
 * hash: the page is rendered by script, so the browser's own jump to the
 * fragment found nothing to jump to.
 */
function useRouteReset(pathname: string, hash: string, key: string) {
  const firstRender = useRef(true);

  useEffect(() => {
    const first = firstRender.current;
    firstRender.current = false;

    const target =
      hash === ""
        ? null
        : document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) {
      const smooth = !first;
      target.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });
      target.focus({ preventScroll: true });
      return;
    }

    if (first) {
      return;
    }
    window.scrollTo(0, 0);
    document.getElementById("main")?.focus();
  }, [pathname, hash, key]);
}

/**
 * Which section of the index is under the reading line, for the nav. The
 * line sits about a third of the way down the viewport, so a section counts
 * as current once its heading has passed it, not when its first pixel shows.
 */
function useCurrentSection(enabled: boolean): string | null {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const sections = NAV.map((item) => document.getElementById(item.id)).filter(
      (section): section is HTMLElement => section !== null,
    );
    const inView = new Set<string>();

    const watcher = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            inView.add(entry.target.id);
          } else {
            inView.delete(entry.target.id);
          }
        }
        // Last in document order wins: a short section ending above the line
        // hands over to the one starting below it.
        const last = NAV.filter((item) => inView.has(item.id)).at(-1);
        setCurrent(last?.id ?? null);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );

    sections.forEach((section) => {
      watcher.observe(section);
    });

    return () => {
      watcher.disconnect();
    };
  }, [enabled]);

  // Off the index there are no sections, whatever was last current there.
  return enabled ? current : null;
}

/** Shown while a route chunk downloads. */
export function Pending() {
  return (
    <p className={styles.pending} role="status">
      Loading
    </p>
  );
}

export interface SectionRuleProps {
  label: string;
  /** Heading level. Sections under a page h1 are h2 unless nested deeper. */
  as?: "h2" | "h3";
}

/**
 * A section label. Shared so the three pages with sections agree on it.
 *
 * Just the label — no band and no rule. The knurl is the studio's signature,
 * not its punctuation, and repeating it at every section turned it into a
 * line across the page every few hundred pixels. It lives in the mark only.
 */
export function SectionRule({ label, as: Heading = "h2" }: SectionRuleProps) {
  return <Heading className={styles.sectionRuleLabel}>{label}</Heading>;
}

export interface PageHeadProps {
  /** Mono label above the heading, e.g. a part number or section name. */
  eyebrow?: ReactNode;
  title: string;
  lede?: string;
  description?: string;
  children?: ReactNode;
}

/** Heading block. Also sets the document title from the page heading. */
export function PageHead({
  eyebrow,
  title,
  lede,
  description,
  children,
}: PageHeadProps) {
  useDocumentTitle(title);

  return (
    <div className={styles.head}>
      {eyebrow === undefined ? null : (
        <div className={styles.eyebrow}>{eyebrow}</div>
      )}
      <h1>{title}</h1>
      {lede === undefined ? null : <p className={styles.lede}>{lede}</p>}
      {description === undefined ? null : (
        <p className={styles.description}>{description}</p>
      )}
      {children}
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { pathname, hash, key } = useLocation();
  useRouteReset(pathname, hash, key);
  const current = useCurrentSection(pathname === "/");

  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>

      <Boot />
      <Readout />

      <header className={styles.header}>
        <NavLink to="/" className={cx(styles.lockup)}>
          <Mark size={22} />
          <span className={styles.wordmark}>Knurled Studio</span>
        </NavLink>
        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.id}
              to={`/#${item.id}`}
              aria-current={current === item.id ? "location" : undefined}
              className={cx(
                styles.navLink,
                current === item.id && styles.navLinkActive,
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main id="main" className={styles.main} tabIndex={-1}>
        {children}
      </main>

      <StudioFooter partNumber={STUDIO_PART_NUMBER} />
    </div>
  );
}
