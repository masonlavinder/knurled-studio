import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cx } from '../cx.ts';
import styles from './Panel.module.css';

export type PanelTone = 'default' | 'accent' | 'warn';

const TONE_CLASS: Record<PanelTone, string | undefined> = {
  default: styles.toneDefault,
  accent: styles.toneAccent,
  warn: styles.toneWarn,
};

interface PanelOwnProps<T extends ElementType> {
  /**
   * Tag for the panel. When `interactive`, this is the tag of the focusable
   * face — pass a link component here. Otherwise it is the tag of the outer
   * shell, so `as="li"` and `as="section"` produce valid markup.
   */
  as?: T;
  /** Paints the 1px edge. */
  tone?: PanelTone;
  /**
   * Renders the face as a focusable element and moves the focus ring onto it.
   * Defaults the tag to `button`.
   */
  interactive?: boolean;
  className?: string;
  children?: ReactNode;
}

export type PanelProps<T extends ElementType = 'div'> = PanelOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof PanelOwnProps<T>>;

/**
 * The chamfered surface. Corners are cut top-left and bottom-right at 45°.
 *
 * Two nested layers, because clip-path clips a border away: the shell paints
 * the edge colour, the face is inset 1px and paints the surface. The same
 * clipping is why an interactive panel's focus ring is an inset box-shadow on
 * the face rather than an outline on the shell.
 */
export function Panel<T extends ElementType = 'div'>({
  as,
  tone = 'default',
  interactive = false,
  className,
  children,
  ...rest
}: PanelProps<T>) {
  const Element: ElementType = as ?? (interactive ? 'button' : 'div');
  const shell = cx(styles.shell, TONE_CLASS[tone], className);

  // A bare <button> in a form submits it. Not what a panel is for.
  const faceProps = Element === 'button' && !('type' in rest) ? { type: 'button', ...rest } : rest;

  if (interactive) {
    return (
      <div className={shell}>
        <Element className={styles.interactiveFace} {...faceProps}>
          {children}
        </Element>
      </div>
    );
  }

  return (
    <Element className={shell} {...rest}>
      <div className={styles.face}>{children}</div>
    </Element>
  );
}
