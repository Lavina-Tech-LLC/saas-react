import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';

const src = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));
// The kit's imports, as in the boilerplate: `@/` is src/, and react-i18next is the SDK's own i18n (lib/i18nAdapter.ts)
const alias = { '@': src(''), 'react-i18next': src('lib/i18nAdapter.ts') };

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
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
    alias,
    // The kit's CSS Modules: each module's stylesheet is imported by its own JS, so an app loads only what it renders
    css: { inject: true },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
