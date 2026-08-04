import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.API_PROXY_TARGET || env.VITE_API_URL || "http://localhost:5001";

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": { target: apiTarget, changeOrigin: true, secure: false },
        "/webhooks": { target: apiTarget, changeOrigin: true, secure: false },
      },
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
