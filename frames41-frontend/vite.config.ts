import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const PRODUCTION_API = "https://frames41-production.up.railway.app";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.API_PROXY_TARGET || PRODUCTION_API;

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
      proxy: {
        "/api": { target: apiTarget, changeOrigin: true, secure: true },
        "/webhooks": { target: apiTarget, changeOrigin: true, secure: true },
      },
    },
    build: {
      outDir: "../frames41-backend/public",
      emptyOutDir: true,
    },
  };
});
