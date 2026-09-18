import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { parseApiBaseUrl } from './src/shared/config/apiBaseUrl.ts';

export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      parseApiBaseUrl(loadEnv(mode, process.cwd(), 'VITE_').VITE_API_BASE_URL),
    ),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@app': fileURLToPath(new URL('./src/app', import.meta.url)) },
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
}));
