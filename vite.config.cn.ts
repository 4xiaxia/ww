import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Load all environment variables
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    root: '.',
    build: {
      outDir: 'dist-cn',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index-cn.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src-cn')
      }
    },
    define: {
      'import.meta.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY),
    }
  };
});
