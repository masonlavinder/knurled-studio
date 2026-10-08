import { catalog } from '@knurled/catalog';
import { cx, SpecTable, StatusChip, Window } from '@knurled/kit';
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';

import { LINK_COUNT, POST_COUNT } from '../../lib/counts.ts';
import { useDocumentTitle } from '../../lib/useDocumentTitle.ts';
import { useReveal } from '../../lib/useReveal.ts';
import styles from './Index.module.css';
import { Lathe } from './Lathe.tsx';

/**
 * Newest first. Part numbers are assigned in the order a project is first cut,
 * so descending by part number is chronological without needing a date — and
 * firstCut is only a year, which cannot order two parts cut the same year.
 * The catalog file itself stays sorted ascending; this is display order.
 */
const entries = [...catalog].sort((a, b) => b.partNumber.localeCompare(a.partNumber));

/** Not parts, so they sit in their own section rather than in the catalog. */
const ON_FILE = [
  { to: '/writing', name: 'Writing', note: 'Longer pieces.', count: POST_COUNT, unit: 'pieces' },
  { to: '/links', name: 'Links', note: 'Tools worth keeping.', count: LINK_COUNT, unit: 'entries' },
];

/** Working rules, in the operator's own words, tightened. */
const PRINCIPLES = [
  'Simple is better. You cannot put lipstick on a pig.',
  'Start in black and white. Shapes and outlines. Never do details before you know where you are heading.',
  "Never over-optimize something that shouldn't exist.",
  "Work with your tools, not around them. Designing around a tool means it is the wrong tool or you don't understand it.",
  'Research what you adopt. You have to live with it.',
];

const RIG = [
  { label: 'Front end', value: 'React · TypeScript' },
  { label: 'Back end', value: 'Python · PostgreSQL' },
  { label: 'Also written', value: 'Java · Go · C++ · C · R' },
  { label: 'Editor', value: 'VS Code' },
  { label: 'Linux', value: 'Ubuntu' },
  { label: 'Keyboards', value: 'Keychron Q1 Max · Gateron Jupiter Red · NuPhy Air60 V2' },
  { label: 'Outside', value: 'Running · Cycling · Hiking · Fishing' },
  { label: 'Distance', value: '10+ half marathons · 1 marathon' },
];

const ELSEWHERE = [
  { name: 'Third Loop', url: 'https://3rd-loop.com' },
  { name: 'GitHub', url: 'https://github.com/masonlavinder' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/mason-lavinder/' },
  { name: 'Letterboxd', url: 'https://letterboxd.com/masonlav' },
];

function hostOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}

function pad(n: number): string {
  return String(n).padStart(3, '0');
}

/** Stagger index for the reveal, as a custom property. */
function order(i: number): CSSProperties {
  return { '--i': i } as CSSProperties;
}

/**
 * The hero name, one span per letter, so each can stamp in on its own beat.
 * The heading keeps its name for assistive technology on the h1 itself; the
 * letters are presentation.
 */
function Stamped({ lines }: { lines: string[] }) {
  let beat = 0;
  return (
    <h1 className={styles.heroTitle} aria-label={lines.join(' ')}>
      {lines.map((line) => (
        <span key={line} className={styles.heroLine} aria-hidden="true">
          {Array.from(line, (letter, i) => (
            <span key={`${letter}-${String(i)}`} className={styles.letter} style={order(beat++)}>
              {letter}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

interface SectionProps {
  id: string;
  index: number;
  title: string;
  /** Right-hand note on the heading row: a count, a hint. */
  note?: string;
  children: ReactNode;
}

/**
 * A numbered section of the page. Focusable so a nav jump can move the
 * keyboard here, not just the viewport.
 */
function Section({ id, index, title, note, children }: SectionProps) {
  return (
    <section id={id} className={styles.section} tabIndex={-1} aria-labelledby={`${id}-title`}>
      <div className={styles.sectionHead} data-reveal="">
        <span className={styles.sectionIndex}>{String(index).padStart(2, '0')}</span>
        <h2 id={`${id}-title`} className={styles.sectionTitle}>
          {title}
        </h2>
        {note === undefined ? null : <span className={styles.sectionNote}>{note}</span>}
      </div>
      {children}
    </section>
  );
}

export function Index() {
  useDocumentTitle('');
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={styles.page}>
      <section className={styles.hero} aria-label="Knurled Studio">
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>KS-000 · Personal project studio</p>
          <Stamped lines={['Knurled', 'Studio']} />
          <p className={styles.lede}>Knurling — the art and craft of creating texture.</p>
          <p className={styles.description}>
            A curated collection of tools and projects from Knurled Studio, a personal project
            studio by Mason Lavinder.
          </p>
          <div className={styles.actions}>
            <Link to="/#parts" className={cx(styles.action, styles.actionPrimary)}>
              ↓ The parts
            </Link>
            <Link to="/#operator" className={cx(styles.action)}>
              → The operator
            </Link>
          </div>
        </div>

        <Window
          className={cx(styles.heroWindow)}
          title="KS-000 · Lathe"
          meta={
            <span className={styles.live}>
              <span className={styles.lamp} aria-hidden="true">
                ■
              </span>{' '}
              Live
            </span>
          }
        >
          <Lathe />
        </Window>
      </section>

      <Section id="parts" index={1} title="Parts" note={`${pad(entries.length)} on file`}>
        <ul className={styles.grid}>
          {entries.map((entry, i) => {
            const shelved = entry.status === 'SHELVED';
            return (
              <li key={entry.partNumber} data-reveal="" style={order(i)}>
                <Window
                  interactive
                  as={Link}
                  to={`/tools/${entry.slug}`}
                  title={entry.partNumber}
                  meta={`Cut ${entry.firstCut}`}
                  className={cx(styles.fill, shelved && styles.shelved)}
                >
                  <h3 className={styles.name}>{entry.name}</h3>
                  <p className={styles.tagline}>{entry.tagline}</p>
                  <div className={styles.meta}>
                    <span>{entry.stack.join(' · ')}</span>
                    <StatusChip status={entry.status} />
                  </div>
                </Window>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section id="operator" index={2} title="Operator">
        <div className={styles.operator}>
          <div className={styles.bio} data-reveal="">
            <h3 className={styles.operatorName}>Mason Lavinder</h3>
            <p className={styles.operatorRole}>Founder and full-stack developer. AI applications.</p>
            <p>
              Aerospace engineering at Virginia Tech, then data science by way of internships and a
              first job. That turned into a Master&rsquo;s in Data Analytics Engineering from George
              Mason, earned at night.
            </p>
            <p>
              At MPR: medical devices through nuclear reactor design, mostly software and data
              engineering. Grew into tech lead and project manager, and the person the room asked
              about software, ML, and data.
            </p>
            <p>
              Now co-founder at Third Loop, building AI tooling for mechanical, electrical, and
              chemical engineers. LLMs, RAG, React, Python, SQLAlchemy, AWS.
            </p>
            <p>Knurled Studio is the workshop for all of the side projects.</p>
          </div>

          <div data-reveal="" style={order(1)}>
            <Window title="Rig.spec" meta={`${pad(RIG.length)} rows`}>
              <SpecTable rows={RIG} />
            </Window>
          </div>
        </div>

        <h3 className={styles.subhead}>Principles</h3>
        <ol className={styles.principles}>
          {PRINCIPLES.map((principle, i) => (
            <li key={principle} className={styles.principle} data-reveal="" style={order(i)}>
              <span className={styles.principleIndex}>{String(i + 1).padStart(2, '0')}</span>
              <span>{principle}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="files" index={3} title="On file">
        <ul className={styles.grid}>
          {ON_FILE.map((item, i) => (
            <li key={item.to} data-reveal="" style={order(i)}>
              <Window
                interactive
                as={Link}
                to={item.to}
                title={item.to}
                meta={`${pad(item.count)} ${item.unit}`}
                className={cx(styles.fill)}
              >
                <h3 className={styles.name}>{item.name}</h3>
                <p className={styles.tagline}>{item.note}</p>
              </Window>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="elsewhere" index={4} title="Elsewhere">
        <ul className={styles.elsewhere}>
          {ELSEWHERE.map((link, i) => (
            <li key={link.url} data-reveal="" style={order(i)}>
              <Window
                interactive
                as="a"
                href={link.url}
                title={link.name}
                meta="↗"
                className={cx(styles.fill)}
              >
                <span className={styles.host}>{hostOf(link.url)}</span>
              </Window>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
