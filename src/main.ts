import { createApp } from 'vue'
import App from './App.vue'
import './main.css'
import { VitePWA } from 'vite-plugin-pwa'
export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AR Monument Tour',
        short_name: 'ARTour',
        description: 'Real-time AR monument guide based on your location.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2c3e50',
        orientation: 'portrait-primary',
        scope: '/',
        lang: 'en',
        categories: ['travel', 'navigation', 'education'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
}

createApp(App).mount('#app')
