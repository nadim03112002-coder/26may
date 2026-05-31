import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5000,
        host: '0.0.0.0',
        allowedHosts: true,
        watch: {
          ignored: ['**/.cache/**', '**/node_modules/**', '**/dist/**'],
        },
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'favicon.ico', 'robots.txt'],
          manifest: {
            id: '/',
            name: 'IIC - Educational Learning Platform',
            short_name: 'IIC',
            description: 'AI-driven Educational Platform for CBSE, BSEB and Competitive Exams. Notes, MCQs, Audio, Video and Live Tests.',
            theme_color: '#1e293b',
            background_color: '#f1f5f9',
            display: 'standalone',
            display_override: ['standalone', 'minimal-ui', 'browser'],
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            lang: 'en-IN',
            dir: 'ltr',
            categories: ['education', 'productivity', 'books'],
            prefer_related_applications: false,
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
              }
            ],
            screenshots: [
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                form_factor: 'narrow',
                label: 'IIC Home'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                form_factor: 'wide',
                label: 'IIC Dashboard'
              }
            ]
          },
          workbox: {
            maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
            globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              }
            ]
          }
        })
      ],
      build: {
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) return 'vendor-react';
              if (id.includes('node_modules/firebase/')) return 'vendor-firebase';
              if (id.includes('node_modules/recharts/') || id.includes('node_modules/@reduxjs/') || id.includes('node_modules/redux')) return 'vendor-charts';
              if (id.includes('node_modules/framer-motion/')) return 'vendor-animation';
              if (id.includes('node_modules/react-markdown/') || id.includes('node_modules/remark') || id.includes('node_modules/rehype') || id.includes('node_modules/katex/')) return 'vendor-markdown';
              if (id.includes('node_modules/react-player/') || id.includes('node_modules/hls.js/')) return 'vendor-media';
              if (id.includes('node_modules/pdfjs-dist/') || id.includes('node_modules/react-pdf/')) return 'vendor-pdf';
              if (id.includes('node_modules/jspdf/') || id.includes('node_modules/html2canvas/') || id.includes('node_modules/jszip/')) return 'vendor-export';
              if (id.includes('node_modules/three/') || id.includes('node_modules/@google/model-viewer')) return 'vendor-3d';
              if (id.includes('node_modules/localforage/') || id.includes('node_modules/idb/')) return 'vendor-storage';
              if (id.includes('node_modules/')) return 'vendor-misc';
            }
          }
        }
      },
      optimizeDeps: {
        include: ['pdfjs-dist', 'clsx', 'eventemitter3'],
        esbuildOptions: {
          sourcemap: false,
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      }
    };
});
