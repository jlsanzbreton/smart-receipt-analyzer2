import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    base: "/smart-receipt-analyzer2/",
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          globPatterns: [
            "**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}",
          ],
        },
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
        manifest: {
          name: "Smart Receipt Analyzer",
          short_name: "Receipt Analyzer",
          description: "Analyze and track your receipts for savings insights",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: "/smart-receipt-analyzer2/",
          start_url: "/smart-receipt-analyzer2/",
          icons: [
            {
              src: "/smart-receipt-analyzer2/icons/icon-192x192.svg",
              sizes: "192x192",
              type: "image/svg+xml",
              purpose: "any maskable",
            },
            {
              src: "/smart-receipt-analyzer2/icons/icon-512x512.svg",
              sizes: "512x512",
              type: "image/svg+xml",
              purpose: "any maskable",
            },
          ],
        },
      }),
    ],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            heroicons: ["@heroicons/react/24/outline"],
            recharts: ["recharts"],
            genai: ["@google/genai"],
            dexie: ["dexie"],
          },
        },
      },
      chunkSizeWarningLimit: 500,
    },
  };
});
