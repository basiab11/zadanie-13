import { resolve } from 'node:path';
    import { defineConfig } from 'vite'; 
    import { fileURLToPath } from 'node:url';

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = resolve(fileURLToPath(import.meta.url), '..');

    export default defineConfig({
      base: '/zadanie-13/',
      root: resolve(__dirname, 'src'),
      build: {
        emptyOutDir: true,
        outDir: resolve(__dirname, 'dist'),
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'src/index.html'),
            login: resolve(__dirname, 'src/login/index.html')
          },
          external: ['fsevents'],
        },
      },
      server: {
        watch: {
          usePolling: true,
        },
      },
