import { cx, Panel, SpecTable } from '@knurled/kit';

import { PageHead } from '../shell/Shell.tsx';
import styles from './About.module.css';

/** Working rules, in the operator's own words, tightened. */
const PRINCIPLES = [
  'Simple is better. You cannot put lipstick on a pig.',
  'Start in black and white. Shapes and outlines. Never do details before you know where you are heading.',
  'Never over-optimize something that shouldn\'t exist.',
  'Work with your tools, not around it. Designing around a tool means it is the wrong tool or you don\'t understand it.',
  'Use the bare minimum. There are plenty of tools and frameworks whose only use it to bloat a package.',
  'Research what you adopt. You have to live with it.',
];

const ELSEWHERE = [
  { name: 'Third Loop', url: 'https://3rd-loop.com' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/mason-lavinder/' },
  { name: 'GitHub', url: 'https://github.com/masonlavinder' },
  { name: 'Letterboxd', url: 'https://letterboxd.com/masonlav' },
];

function hostOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}

export function About() {
  return (
    <>
      <PageHead
        eyebrow="Operator"
        title="Mason Lavinder"
        lede="Founder and full-stack developer. AI applications."
      />

      <div className={styles.prose}>
        <p>
          Aerospace engineering at Virginia Tech, then data science by way of internships and a first
          job. That turned into a Master&rsquo;s in Data Analytics Engineering from George Mason,
          earned at night.
        </p>
        <p>
          At MPR: medical devices through nuclear reactor design, mostly software and data
          engineering. Grew into tech lead and project manager, and the person the room asked about
          software, ML, and data.
        </p>
        <p>
          Now co-founder at Third Loop, building AI tooling for mechanical, electrical, and chemical
          engineers. LLMs, RAG, React, Python, SQLAlchemy, AWS.
        </p>
        <p>Knurled Studio is the workshop for everything outside that. The site before it is KS-001.</p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Principles</h2>
        <ol className={styles.principles}>
          {PRINCIPLES.map((principle, index) => (
            <li key={principle} className={styles.principle}>
              <span className={styles.principleIndex}>{String(index + 1).padStart(2, '0')}</span>
              <span>{principle}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Tools</h2>
        <Panel>
          <SpecTable
            rows={[
              { label: 'Front end', value: 'React · TypeScript' },
              { label: 'Back end', value: 'Python · PostgreSQL' },
              { label: 'Also written', value: 'Go · C++ · C · R' },
              { label: 'Editor', value: 'VS Code' },
              { label: 'Linux', value: 'Ubuntu' },
              { label: 'Keyboards', value: 'Keychron Q1 Max · Gateron Jupiter Red · NuPhy Air60 V2' },
              { label: 'Outside', value: 'Cycling · hiking · trail running · fishing' },
              { label: 'Distance', value: '10+ half marathons · 1 marathon' },
            ]}
          />
        </Panel>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>All Time Greats</h2>
        <Panel>
          <SpecTable
            rows={[
              { label: 'Fiction', value: 'Dune · East of Eden · The Hobbit · The Alchemist' },
              {
                label: 'Nonfiction',
                value: 'Kitchen Confidential · The Psychology of Money · Washington: A Life',
              },
              {
                label: 'Film',
                value:
                  "Ferris Bueller's Day Off · Interstellar · LOTR · Inglourious Basterds · Empire Strikes Back",
              },
            ]}
          />
        </Panel>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Where to Find Him</h2>
        <ul className={styles.links}>
          {ELSEWHERE.map((link) => (
            <li key={link.url}>
              <Panel interactive as="a" href={link.url} className={cx(styles.linkPanel)}>
                <div className={styles.linkRow}>
                  <span className={styles.linkName}>{link.name}</span>
                  <span className={styles.linkHost}>{hostOf(link.url)}</span>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
