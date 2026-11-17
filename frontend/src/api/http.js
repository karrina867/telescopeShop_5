import axios from 'axios'
import { demoAdapter, isDemoMode } from './demo'

const http = axios.create({
  // Адрес API можно переопределить на этапе сборки (например, для отдельного backend).
  // Без переменной используется относительный путь и прокси Vite / SPA-fallback.
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    Accept: 'application/json',
  },
  // На статическом хостинге Laravel недоступен, поэтому витрина работает
  // на локальном демо-каталоге. В dev-режиме адаптер не подключается.
  ...(isDemoMode ? { adapter: demoAdapter } : {}),
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }

    return Promise.reject(error)
  },
)

export default http
