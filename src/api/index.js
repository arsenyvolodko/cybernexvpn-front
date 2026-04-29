import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
})

// Похоже на UUID / достаточно длинный URL-safe идентификатор.
const TOKEN_RE = /^[A-Za-z0-9_-]{16,}$/

// Достаём токен сначала из URL (он переезжает между браузерами при копировании
// ссылки — например, при переходе из встроенного браузера Telegram в Safari),
// и только потом из localStorage как запасной вариант.
function getApiToken() {
  try {
    // 1. Новый формат — токен прямо в path: /<uuid>
    const firstSegment = window.location.pathname.split('/').filter(Boolean)[0] || ''
    if (TOKEN_RE.test(firstSegment)) {
      try { localStorage.setItem('api_token', firstSegment) } catch { /* ignore */ }
      return firstSegment
    }
    // 2. Старый формат — query ?token=<uuid>
    const queryToken = new URLSearchParams(window.location.search).get('token')
    if (queryToken) {
      try { localStorage.setItem('api_token', queryToken) } catch { /* ignore */ }
      return queryToken
    }
  } catch { /* ignore */ }
  // 3. Запасной кеш в localStorage.
  try { return localStorage.getItem('api_token') } catch { return null }
}

api.interceptors.request.use((config) => {
  const token = getApiToken()
  if (token) {
    config.headers['X-API-KEY'] = token
  }
  return config
})

// Достаёт человекочитаемое сообщение из ошибки axios.
// Бэкенд для ожидаемых ошибок отдаёт {error_message: "..."}, для непредвиденных —
// {detail: "..."}, для валидации DRF — словарь по полям или non_field_errors.
export function extractErrorMessage(error, fallback = 'Произошла ошибка. Попробуйте позже.') {
  const data = error?.response?.data
  if (!data) return fallback

  if (typeof data === 'string') return data
  if (typeof data.error_message === 'string') return data.error_message
  if (typeof data.detail === 'string') return data.detail

  // DRF валидация: либо non_field_errors, либо ошибки по полям.
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    return String(data.non_field_errors[0])
  }
  for (const key of Object.keys(data)) {
    const v = data[key]
    if (Array.isArray(v) && v.length) return String(v[0])
    if (typeof v === 'string') return v
  }
  return fallback
}

export default api