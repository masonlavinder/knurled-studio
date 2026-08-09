import { cx, Knurl, StudioFooter } from '@knurled/kit';
import { type ReactNode, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router';

import styles from './Shell.module.css';

/** KS-000. The studio's own part number, and the only place it is written. */
export const STUDIO_PART_NUMBER = 'KS-000';

const NAV = [
  { to: '/', label: 'Index', end: true },
  { to: '/log', label: 'Log', end: false },
  { to: '/about', label: 'About', end: false },
];

/**
 * On navigation, put the viewport and the keyboard back at the top of the new
 * page. A client-side route change does neither on its own, which strands
 * screen reader and keyboard users mid-document.
 */
function useRouteReset(pathname: string) {
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus();
  }, [pathname]);
}

function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title === '' ? 'Knurled Studio' : `${title} · Knurled Studio`;
  }, [title]);
}

export interface PageHeadProps {
  /** Mono label above the heading, e.g. a part number or section name. */
  eyebrow?: ReactNode;
  title: string;
  /** One sentence under the heading. Spec-sheet register. */
  lede?: string;
  children?: ReactNode;
}

/** Heading block. Also sets the document title from the page heading. */
export function PageHead({ eyebrow, title, lede, children }: PageHeadProps) {
  useDocumentTitle(title);

  return (
    <div className={styles.head}>
      {eyebrow === undefined ? null : <div className={styles.eyebrow}>{eyebrow}</div>}
      <h1>{title}</h1>
      {lede === undefined ? null : <p className={styles.lede}>{lede}</p>}
      {children}
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  useRouteReset(pathname);

  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>

      <header className={styles.header}>
        <NavLink to="/" className={cx(styles.wordmark)}>
          Knurled Studio
        </NavLink>
        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cx(styles.navLink, isActive && styles.navLinkActive)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Knurl height={7} />

      <main id="main" className={styles.main} tabIndex={-1}>
        {children}
      </main>

      <StudioFooter partNumber={STUDIO_PART_NUMBER} />
    </div>
  );
}
