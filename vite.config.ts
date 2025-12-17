
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load all environment variables (including those without VITE_ prefix)
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // Configure base path for GitHub Pages deployment
    // For GitHub Pages: set REPO_NAME to your repository name (e.g., 'ww')
    // For custom domain or root deployment: leave REPO_NAME empty
    base: env.REPO_NAME ? `/${env.REPO_NAME}/` : '/',
    build: {
      // Optimize build output
      outDir: 'dist',
      // Generate source maps for debugging in production
      sourcemap: mode === 'development',
      // Use esbuild for minification (faster than terser)
      minify: 'esbuild',
      // Optimize chunk size
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            genai: ['@google/genai'],
          },
        },
      },
    },
    // Remove console.log in production
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    define: {
      // Polyfill process.env with actual values from the environment
      // usage of JSON.stringify ensures that values are injected as valid strings or valid JSON objects
      'process.env': JSON.stringify({
        API_BASE_URL: env.API_BASE_URL,
        API_KEY: env.API_KEY,
      }),
    },
  };
});
