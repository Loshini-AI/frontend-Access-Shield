import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const isReplit = process.env.REPL_ID !== undefined;
const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig(async () => {
  const replitPlugins = [];
  if (isReplit && isDev) {
    const { default: err } = await import('@replit/vite-plugin-runtime-error-modal');
    replitPlugins.push(err());
  }
  return {
    base: process.env.BASE_PATH || '/',
    plugins: [react(), tailwindcss(), ...replitPlugins],
    resolve: {
      alias: { '@': path.resolve(import.meta.dirname, 'src') },
      dedupe: ['react', 'react-dom'],
    },
    build: { outDir: 'dist', emptyOutDir: true },
    server: { port: Number(process.env.PORT) || 5173, host: '0.0.0.0', allowedHosts: true },
  };
});
