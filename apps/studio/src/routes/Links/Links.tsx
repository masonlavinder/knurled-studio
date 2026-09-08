import { cx, Panel } from '@knurled/kit';

import { linkGroups, links } from '../links/links.ts';
import { PageHead, SectionRule } from '../shell/Shell.tsx';
import styles from './Links.module.css';

function hostOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}

export function Links() {
  return (
    <>
      <PageHead
        eyebrow="Reference"
        title="Links"
        lede={`${String(links.length)} tools and articles worth keeping.`}
      />

      {linkGroups.map((group) => (
        <section key={group.category} className={styles.group}>
          <SectionRule label={group.category} />
          <ul className={styles.list}>
            {group.entries.map((link) => (
              <li key={link.url}>
                <Panel interactive as="a" href={link.url} className={cx(styles.panel)}>
                  <div className={styles.card}>
                    <span className={styles.title}>{link.title}</span>
                    <p className={styles.description}>{link.description}</p>
                    <div className={styles.foot}>
                      <span className={styles.host}>{hostOf(link.url)}</span>
                      <span className={styles.tags}>{link.categories.join(' · ')}</span>
                    </div>
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
