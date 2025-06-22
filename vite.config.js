import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // ⬅️ 꼭 추가

export default defineConfig({
  base: '/theUBoo/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@user': path.resolve(__dirname, './components/user'), // ⬅️ 이거 추가
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  }
});