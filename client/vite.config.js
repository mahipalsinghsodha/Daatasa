import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Daatasa E-commerce',
        short_name: 'Daatasa',
        description: 'Premium Ghee and Fresh Products',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    proxy: {
      // ── HTTP API proxy ────────────────────────────────────────────────────
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // ✅ Rewrite cookie domain so httpOnly refresh cookie is stored
        // for localhost:3000 (Vite) not localhost:5000 (backend).
        // Without this, Set-Cookie headers may be dropped or misattributed.
        cookieDomainRewrite: { '*': '' },
      },
      // ── Socket.io WebSocket proxy ─────────────────────────────────────────
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    }
  },
  optimizeDeps: {
    force: true
  }
})
