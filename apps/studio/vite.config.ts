import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    // index.html must stay uncached while hashed assets are immutable —
    // the CloudFront behaviours in infra/ assume this split.
    assetsDir: 'assets',
  },
});
