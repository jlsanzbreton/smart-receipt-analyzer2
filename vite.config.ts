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
        // añadimos aquí los nuevos PNG de iOS y el mask-icon
        includeAssets: [
          "favicon.ico",
          "icons/apple-touch-icon.png",
          "icons/apple-touch-icon-120x120.png",
          "icons/apple-touch-icon-152x152.png",
          "icons/apple-touch-icon-180x180.png",
          "icons/mask-icon.svg",
        ],
        manifest: {
          name: "Smart Receipt Analyzer",
          short_name: "Receipt Analyzer",
          description: "Analyze and track your receipts for savings insights",
          theme_color: "#10B981",
          background_color: "#1F2937",
          display: "standalone",
          orientation: "portrait",
          scope: "/smart-receipt-analyzer2/",
          start_url: "/smart-receipt-analyzer2/",
          icons: [
            // SVGs habituales
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
            // nuevos iconos para iOS
            {
              src: "/smart-receipt-analyzer2/icons/apple-touch-icon.png",
              sizes: "180x180",
              type: "image/png",
            },
            {
              src: "/smart-receipt-analyzer2/icons/apple-touch-icon-152x152.png",
              sizes: "152x152",
              type: "image/png",
            },
            {
              src: "/smart-receipt-analyzer2/icons/apple-touch-icon-120x120.png",
              sizes: "120x120",
              type: "image/png",
            },
            // máscara para Safari
            {
              src: "/smart-receipt-analyzer2/icons/mask-icon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "maskable",
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
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
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
