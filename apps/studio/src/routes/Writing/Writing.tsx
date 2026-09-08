import { cx } from '@knurled/kit';
import { Link } from 'react-router';

import { posts } from '../writing/posts.ts';
import { PageHead } from '../shell/Shell.tsx';
import styles from './Writing.module.css';

export function Writing() {
  return (
    <>
      <PageHead
        eyebrow="Long form"
        title="Writing"
        lede={`${String(posts.length)} pieces. Newest first.`}
      />

      <ul className={styles.list}>
        {posts.map((post, index) => (
          <li key={post.slug} className={cx(styles.item, index > 0 && styles.ruled)}>
            <Link to={`/writing/${post.slug}`} className={cx(styles.link)}>
              <div className={styles.meta}>
                <time className={styles.date} dateTime={post.date}>
                  {post.date}
                </time>
                {post.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className={styles.title}>{post.title}</h2>
              <p className={styles.excerpt}>{post.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
