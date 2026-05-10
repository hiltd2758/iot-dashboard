import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Auth endpoints không cần interceptor refresh
const AUTH_ENDPOINTS = ['/api/v1/auth/login', '/api/v1/auth/sign-up', '/api/v1/auth/refresh-token']

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token
api.interceptors.request.use((config) => {
  const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => config.url?.includes(ep))
  if (!isAuthEndpoint) {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto refresh on 401 — bỏ qua auth endpoints
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => original.url?.includes(ep))

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh-token/${refreshToken}`
        )
        const newToken = data.data?.accessToken
        localStorage.setItem('accessToken', newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api