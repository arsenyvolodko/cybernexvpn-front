import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
})

// Перед каждым запросом вставляем токен из localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('api_token')
  if (token) {
    config.headers['X-API-KEY'] = token
  }
  return config
})

export default api