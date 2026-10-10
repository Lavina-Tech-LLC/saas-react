import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

// Peer dependencies are provided by the host app — never bundled into the SDK
const EXTERNAL = [/^react($|\/)/, /^react-dom($|\/)/, /^@mantine\//, /^lucide-react($|\/)/];

export default defineConfig({
  plugins: [react(), dts({ rollupTypes: true, exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'] })],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        react: resolve(__dirname, 'src/react.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: { external: EXTERNAL },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
