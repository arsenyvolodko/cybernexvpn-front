import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    server: {
      host: true,
      port: 5173,
      // Proxy перенаправляет /api/v1/* → бэкенд.
      // Браузер видит запросы на тот же хост — CORS не срабатывает.
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_ORIGIN || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  }
})