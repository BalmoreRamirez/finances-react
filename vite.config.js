import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['finance-icon.svg', 'finance-icon-maskable.svg'],
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Finances React',
        short_name: 'Finances',
        description: 'Panel financiero con métricas, categorías y reportes.',
        theme_color: '#0f172a',
        background_color: '#0b1120',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'finance-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'finance-icon-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
