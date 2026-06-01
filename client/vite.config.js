import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
