import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/admin/',
  // Root = thư mục app này, để `vite build` lấy đúng frontend-admin/index.html
  // (nếu không, Vite lấy index.html ở gốc project = app cũ trong src/).
  root: __dirname,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../dist/frontend-admin'),
    emptyOutDir: true,
  },
});
