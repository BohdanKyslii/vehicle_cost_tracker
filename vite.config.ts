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
