import { cx } from '@knurled/kit';
import Markdown from 'react-markdown';
import { Link, useParams } from 'react-router';
import remarkGfm from 'remark-gfm';

import { postBySlug } from '../writing/posts.ts';
import { PageHead } from '../shell/Shell.tsx';
import { NotFound } from './NotFound.tsx';
import styles from './Post.module.css';

export function Post() {
  const { slug } = useParams();
  const post = slug === undefined ? undefined : postBySlug(slug);

  if (!post) {
    return <NotFound />;
  }

  return (
    <>
      <Link to="/writing" className={cx(styles.back)}>
        ← Writing
      </Link>

      <div className={styles.byline}>
        <time className={styles.date} dateTime={post.date}>
          {post.date}
        </time>
        {post.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>

      <PageHead title={post.title} />

      <div className={styles.markdown}>
        <Markdown remarkPlugins={[remarkGfm]}>{post.body}</Markdown>
      </div>
    </>
  );
}
