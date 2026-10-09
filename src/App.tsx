import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { Index } from './pages/Index/Index.tsx';
import { Pending, Shell } from './shell/Shell.tsx';

/**
 * Every route but the index is a separate chunk.
 *
 * The index is the landing page and stays in the entry bundle. The rest load
 * on navigation, which keeps the Markdown renderer — the single heaviest
 * dependency here, and one that only a post page needs — out of the initial
 * download entirely.
 */
const Links = lazy(() => import('./pages/Links/Links.tsx').then((m) => ({ default: m.Links })));
const NotFound = lazy(() =>
  import('./pages/NotFound/NotFound.tsx').then((m) => ({ default: m.NotFound })),
);
const Post = lazy(() => import('./pages/Post/Post.tsx').then((m) => ({ default: m.Post })));
const Tool = lazy(() => import('./pages/Tool/Tool.tsx').then((m) => ({ default: m.Tool })));
const Writing = lazy(() =>
  import('./pages/Writing/Writing.tsx').then((m) => ({ default: m.Writing })),
);

export function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Suspense fallback={<Pending />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tools/:slug" element={<Tool />} />
            <Route path="/writing" element={<Writing />} />
            <Route path="/writing/:slug" element={<Post />} />
            <Route path="/links" element={<Links />} />
            {/* About is a section of the index now. The old URL still lands. */}
            <Route path="/about" element={<Navigate to="/#operator" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Shell>
    </BrowserRouter>
  );
}
