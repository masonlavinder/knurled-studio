import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';

import { Index } from './routes/Index.tsx';
import { Pending, Shell } from './shell/Shell.tsx';

/**
 * Every route but the index is a separate chunk.
 *
 * The index is the landing page and stays in the entry bundle. The rest load
 * on navigation, which keeps the Markdown renderer — the single heaviest
 * dependency here, and one that only a post page needs — out of the initial
 * download entirely.
 */
const About = lazy(() => import('./routes/About.tsx').then((m) => ({ default: m.About })));
const Links = lazy(() => import('./routes/Links.tsx').then((m) => ({ default: m.Links })));
const Log = lazy(() => import('./routes/Log.tsx').then((m) => ({ default: m.Log })));
const NotFound = lazy(() => import('./routes/NotFound.tsx').then((m) => ({ default: m.NotFound })));
const Post = lazy(() => import('./routes/Post.tsx').then((m) => ({ default: m.Post })));
const Tool = lazy(() => import('./routes/Tool.tsx').then((m) => ({ default: m.Tool })));
const Writing = lazy(() => import('./routes/Writing.tsx').then((m) => ({ default: m.Writing })));

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
            <Route path="/log" element={<Log />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Shell>
    </BrowserRouter>
  );
}
