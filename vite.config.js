import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getBuildInputs() {
  const collectedInputs = [];
  for await (const entry of glob('src/**/*.html')) {
      console.log(resolve(__dirname, entry));
      collectedInputs.push(resolve(__dirname, entry));
  }
  return collectedInputs;
}

export default defineConfig(async ({ command, mode }) => {
  const resolvedInputs = await getBuildInputs();

  return {
    base: '/zadanie-13/',
    plugins: [],
    root: resolve(__dirname, 'src'),
    build: {
      emptyOutDir: true,
      rollupOptions: {
        input: resolvedInputs,
      },
      outDir: resolve(__dirname, 'dist'),
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
