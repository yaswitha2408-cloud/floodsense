import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import dotenv from 'dotenv';

// Ensure .env is loaded on the server side
dotenv.config();

function serverlessApiPlugin() {
  return {
    name: 'serverless-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        if (url.pathname.startsWith('/api/')) {
          const endpoint = url.pathname.replace(/^\/api\//, '').replace(/\/$/, '');
          
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
            } catch {
              req.body = {};
            }

            // Decorate res with status() and json() helpers matching Vercel serverless
            res.status = (statusCode) => {
              res.statusCode = statusCode;
              return res;
            };

            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };

            try {
              if (endpoint === 'analyze') {
                const { default: handler } = await import('./api/analyze.js');
                await handler(req, res);
              } else {
                res.status(404).json({ error: `Endpoint /api/${endpoint} not found` });
              }
            } catch (err) {
              console.error(`Error in /api/${endpoint}:`, err);
              res.status(500).json({ error: 'Internal Server Error', message: err.message });
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    serverlessApiPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.svg', 'pwa-512x512.svg'],
      manifest: {
        name: 'FloodSense - Hyperlocal Flood Warning',
        short_name: 'FloodSense',
        description: 'Hyperlocal flood early warning and street water depth reporting',
        theme_color: '#0369a1',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
