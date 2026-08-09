import { BrowserRouter, Route, Routes } from 'react-router';

import { About } from './routes/About.tsx';
import { Index } from './routes/Index.tsx';
import { Links } from './routes/Links.tsx';
import { Log } from './routes/Log.tsx';
import { NotFound } from './routes/NotFound.tsx';
import { Post } from './routes/Post.tsx';
import { Tool } from './routes/Tool.tsx';
import { Writing } from './routes/Writing.tsx';
import { Shell } from './shell/Shell.tsx';

export function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tools/:slug" element={<Tool />} />
          <Route path="/about" element={<About />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/writing/:slug" element={<Post />} />
          <Route path="/links" element={<Links />} />
          <Route path="/log" element={<Log />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
