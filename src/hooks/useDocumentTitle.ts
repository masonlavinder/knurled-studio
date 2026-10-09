import { useEffect } from 'react';

/** Sets the tab title. An empty title is the studio's own name, unsuffixed. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title === '' ? 'Knurled Studio' : `${title} · Knurled Studio`;
  }, [title]);
}
