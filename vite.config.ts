import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import { VitePWA} from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Без цього Service Worker перехоплював УСІ навігації (Workbox
      // NavigationRoute за замовчуванням без винятків) і віддавав
      // закешований index.html навіть для /admin/ — який на проді nginx
      // проксіює напряму на Django admin (nginx.conf). SPA-шелл
      // перехоплював запит раніше, ніж він узагалі йшов у мережу, тож
      // замість Django-логіну користувач бачив 404 самого React-застосунку.
      workbox: {
        navigateFallbackDenylist: [/^\/admin/],
        // Дефолтний ліміт workbox — 2 MiB; головний JS-бандл вже 2.13 MiB
        // і зростає з кожною фічею, тому build почав падати (не просто
        // попереджати) на PLUGIN_ERROR "exceeds the limit" — precache
        // одразу зупиняв весь build, а не просто пропускав файл.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
       name: 'Vehicle Cost Tracker',
       short_name: 'Vehicle Tracker',
        theme_color: '#1e40af',
        display: 'standalone',
        start_url: '/driver',
      },
    }),
  ],
})
