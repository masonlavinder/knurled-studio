import { useEffect, useRef } from 'react';

import { prefersReducedMotion } from './motion.ts';

/**
 * Scroll-in, once. Every element under the returned ref that carries a
 * `data-reveal` attribute gets `data-shown` the first time it enters the
 * viewport; the CSS does the rest.
 *
 * `data-shown` is set on the DOM directly and never rendered from React, so
 * a re-render cannot take it back off. For a reader who asked for less
 * motion everything is shown at once.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) {
      return;
    }

    const targets = root.querySelectorAll<HTMLElement>('[data-reveal]');
    const show = (target: HTMLElement) => {
      target.dataset.shown = '';
    };

    if (prefersReducedMotion()) {
      targets.forEach(show);
      return;
    }

    const watcher = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            show(entry.target);
            watcher.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );

    targets.forEach((target) => {
      watcher.observe(target);
    });

    return () => {
      watcher.disconnect();
    };
  }, []);

  return ref;
}
