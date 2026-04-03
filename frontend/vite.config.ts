/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  const apiBase = process.env.VITE_API_URL || 'http://localhost:5000/api';
  let apiOriginPattern = /^https?:\/\/localhost:\d+\/api\/.*/i;
  try {
    const apiOrigin = new URL(apiBase).origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    apiOriginPattern = new RegExp(`^${apiOrigin}/api/.*`, 'i');
  } catch {
    // Keep localhost fallback pattern when VITE_API_URL is invalid.
  }

  return {
    test: {
      globals: false,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'YENE BET',
          short_name: 'YENE BET',
          description: 'Find and list rental properties in Ethiopia',
          theme_color: '#0066CC',
          background_color: '#FFFFFF',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https?:\/\/localhost:\d+\/api\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: apiOriginPattern,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-v1',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
                },
                networkTimeoutSeconds: 5
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'images-v1',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts-v1',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            }
          ]
        }
      })
    ],
  };
});
