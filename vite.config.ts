import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  define: {
    // The day this build was cut, for the header readout. Local date, not
    // UTC, so a late-evening deploy does not stamp tomorrow.
    __BUILD_DATE__: JSON.stringify(new Date().toLocaleDateString('en-CA')),
  },
  build: {
    // index.html must stay uncached while hashed assets are immutable —
    // the CloudFront behaviours in infra/ assume this split.
    assetsDir: 'assets',
  },
});
