import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      closeBundle() {
        try {
          copyFileSync(
            path.resolve(__dirname, 'public/_redirects'),
            path.resolve(__dirname, 'dist/_redirects')
          );
          console.log('✅ _redirects file copied to dist folder');
        } catch (error) {
          console.error('❌ Error copying _redirects file:', error);
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  },
});
