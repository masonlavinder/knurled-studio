import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// global.css first — it declares the cascade order, and a layer that appears
// before that declaration is pinned where it lands.
import '@knurled/kit/global.css';
import '@knurled/kit/tokens.css';
import '@knurled/kit/fonts.css';

import { App } from './App.tsx';

const root = document.getElementById('root');

if (!root) {
  throw new Error('main: #root is missing from index.html');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
