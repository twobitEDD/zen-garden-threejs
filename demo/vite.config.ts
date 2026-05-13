import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "three", "@react-three/fiber", "@react-three/drei"],
    alias: {
      "@twobitedd/zen-garden-threejs": path.resolve(__dirname, "../src/index.ts"),
    },
  },
  server: { port: 5174, open: true },
});
