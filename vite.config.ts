/// <reference types="vitest/config" />
import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Turns the site into an installable Progressive Web App (PWA):
    // generates the service worker, caches assets for offline use,
    // and injects the web app manifest below.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'StudyTrack — Exam & Homework Planner',
        short_name: 'StudyTrack',
        description:
          'Track your subjects, count down to exams, and jot homework/quiz notes. Works offline.',
        theme_color: '#4f46e5',
        background_color: '#0b1020',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'th',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cache the built app shell so it opens instantly and works offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      devOptions: {
        // Let us test the PWA/service worker while running `npm run dev`.
        enabled: true,
      },
    }),
  ],
  // Vitest configuration (used by `npm run test`).
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    // The backend (server/) is its own project with its own tests & deps.
    exclude: [...configDefaults.exclude, 'server/**'],
  },
})
