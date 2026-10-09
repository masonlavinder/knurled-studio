import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cx } from '../cx.ts';
import styles from './Window.module.css';

interface WindowOwnProps<T extends ElementType> {
  /**
   * Tag for the face — the surface that holds the title bar and the body.
   * Pass a link component with `interactive` to make the whole window one
   * target.
   */
  as?: T;
  /** Left side of the title bar. Short: a part number, a file name. */
  title: ReactNode;
  /** Right side of the title bar. A version, a lamp, a count. */
  meta?: ReactNode;
  /** Lifts further on hover and seats on press. Moves the focus ring onto the face. */
  interactive?: boolean;
  className?: string;
  children?: ReactNode;
}

export type WindowProps<T extends ElementType = 'div'> = WindowOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof WindowOwnProps<T>>;

/**
 * A panel with a title bar, sitting off the page.
 *
 * Three layers. The plate is a solid ink copy of the chamfer, offset down and
 * right by --lift; the shell paints the edge; the face paints the surface. It
 * is a layer rather than a shadow because clip-path clips any box-shadow
 * away, and because a shadow is light and this is a part sitting on a part.
 *
 * Decorative chrome — the plate and the close box — is hidden from assistive
 * technology. The title is real text.
 */
export function Window<T extends ElementType = 'div'>({
  as,
  title,
  meta,
  interactive = false,
  className,
  children,
  ...rest
}: WindowProps<T>) {
  const Face: ElementType = as ?? 'div';

  return (
    <div className={cx(styles.window, interactive && styles.interactive, className)}>
      <span aria-hidden="true" className={styles.plate} />
      <div className={styles.shell}>
        <Face className={cx(styles.face, interactive && styles.interactiveFace)} {...rest}>
          <div className={styles.bar}>
            <span aria-hidden="true" className={styles.closeBox} />
            <span className={styles.title}>{title}</span>
            {meta === undefined ? null : <span className={styles.meta}>{meta}</span>}
          </div>
          <div className={styles.body}>{children}</div>
        </Face>
      </div>
    </div>
  );
}
