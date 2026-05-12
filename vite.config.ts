import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    global: {}, // 👈 FIX lỗi: global is not defined
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    proxy: {
      "/claim-proxy": {
        target: "https://api.irrigation.studio",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/claim-proxy/, ""),
        secure: false,
      },
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
