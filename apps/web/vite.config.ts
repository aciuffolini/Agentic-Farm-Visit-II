import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  // Disable service worker for Android builds (Capacitor bundles everything)
  // Service worker causes caching issues in native apps where files are bundled
  // When building for Android, use --mode android to disable PWA plugin
  const disablePWA = mode === 'android' || process.env.BUILD_TARGET === 'android';
  
  return {
    base: "/",
    plugins: [
      react(),
      // Only enable PWA/service worker for web builds, not Android
      // Android builds bundle everything, so service worker caching causes issues
      ...(disablePWA ? [] : [
        VitePWA({
          registerType: "autoUpdate",
          manifest: {
            name: "Farm Field Visit",
            short_name: "Farm Visit",
            start_url: "/",
            scope: "/",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: "#22c55e",
            orientation: "portrait",
            icons: [
              { src: "pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
              { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
            ]
          },
          workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg}"] }
        })
      ])
    ],
    server: {
      port: 5173,
      host: true, // Allow access from network (for mobile testing)
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
  };
});

