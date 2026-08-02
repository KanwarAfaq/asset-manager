import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Agar aapke paas yeh files public folder mein nahi hain, toh includeAssets line hata sakte hain
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'], 
      manifest: {
        name: 'حساب ', 
        short_name: 'حساب ',
        description: 'Apni aamdani aur kharchay ka hisaab rakhein',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone', 
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})