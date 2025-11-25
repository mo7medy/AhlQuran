import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // safely expose process.env to the browser
      'process.env': JSON.stringify(env)
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});