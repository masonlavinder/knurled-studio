import { BrowserRouter, Route, Routes } from 'react-router';

import { About } from './routes/About.tsx';
import { Index } from './routes/Index.tsx';
import { Log } from './routes/Log.tsx';
import { NotFound } from './routes/NotFound.tsx';
import { Tool } from './routes/Tool.tsx';
import { Shell } from './shell/Shell.tsx';

export function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tools/:slug" element={<Tool />} />
          <Route path="/about" element={<About />} />
          <Route path="/log" element={<Log />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
