<<<<<<< HEAD
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
=======
import path from "path";
import { defineConfig } from "vite";
// Use require for React plugin if import fails
let react;
try {
  react = require("@vitejs/plugin-react");
} catch (error) {
  console.error("Failed to import @vitejs/plugin-react:", error);
  // Fallback to empty plugin array if React plugin isn't available
  react = () => [];
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [typeof react === 'function' ? react() : []],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
>>>>>>> 48d66ff (Updated Code)
