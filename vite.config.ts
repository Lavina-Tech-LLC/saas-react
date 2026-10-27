import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [react()],
  // The library build (vp pack, tsdown): both entries in ESM and CJS with their types. Peer dependencies (react,
  // react-dom, @mantine/*, lucide-react) stay external — tsdown never bundles a package listed in peerDependencies.
  pack: {
    entry: { index: 'src/index.ts', react: 'src/react.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    // Browser code (fetch, window); ESM keeps the .js names package.json points at, CJS is .cjs
    platform: 'browser',
    fixedExtension: false,
    unbundle: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
