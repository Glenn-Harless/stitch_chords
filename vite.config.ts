import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/stitch_chords/' : '/',
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
      '/health': 'http://localhost:8787',
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['jam-icon.svg'],
      manifest: {
        name: 'Jam Companion',
        short_name: 'JamCompanion',
        description: 'Personal electronica jam companion for chords, melody, bass, and theory guidance',
        theme_color: '#081020',
        icons: [
          {
            src: 'jam-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ],
}))
