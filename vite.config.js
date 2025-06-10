import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getBuildInputs() {
  const collectedInputs = [];
  for await (const entry of glob('src/**/*.html')) {
      collectedInputs.push(resolve(__dirname, entry));
  }
  return collectedInputs;
}

export default defineConfig(async ({ command, mode }) => {
  const resolvedInputs = await getBuildInputs();

  return {
    base: '/zadanie-13/',
    root: resolve(__dirname, 'src'),
    build: {
      emptyOutDir: true,
      outDir: resolve(__dirname, 'dist'),
      rollupOptions: {
        input: resolvedInputs,
        external: ['fsevents'],
      },
    },
    server: {
      watch: {
        usePolling: true,
      },
    },
    optimizeDeps: {
      exclude: ['fsevents', 'lightningcss', 'chokidar'],
    },
    ssr: {
      noExternal: ['fsevents', 'lightningcss', 'chokidar'],
    },
    resolve: {
      dedupe: ['fsevents', 'lightningcss', 'chokidar']
    }
  };
});
