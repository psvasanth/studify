import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// IMPORTANT: `base` must match your GitHub repo name for GitHub Pages
// project sites, e.g. if your repo is github.com/you/studify then
// base should be "/studify/". If you deploy to a custom domain or a
// user/organization page (you.github.io), set base to "/" instead.
export default defineConfig({
  base: "/studify/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png"],
      manifest: {
        name: "Studify — Exam Prep Companion",
        short_name: "Studify",
        description:
          "Tables quiz, study tracker, and exam countdowns for competitive exam prep.",
        theme_color: "#09090b",
        background_color: "#09090b",
        display: "standalone",
        orientation: "portrait",
        start_url: ".",
        scope: ".",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/maskable-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg}"],
      },
    }),
  ],
});
