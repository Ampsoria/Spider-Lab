import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative asset URLs support GitHub Pages repository paths and other static hosts.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist-static",
    emptyOutDir: true,
  },
});
