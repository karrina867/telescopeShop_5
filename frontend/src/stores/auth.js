import { defineStore } from 'pinia'
import http from '@/api/http'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    isAdmin: (state) => state.user?.role?.name === 'admin',
  },

  actions: {
    restore() {
      this.token = localStorage.getItem('token')
    },

    setToken(token) {
      this.token = token

      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },

    async login(payload) {
      const { data } = await http.post('/auth/login', payload)
      this.user = data.user
      this.setToken(data.token)
      return data
    },

    async register(payload) {
      const { data } = await http.post('/auth/register', payload)
      this.user = data.user
      this.setToken(data.token)
      return data
    },

    async fetchUser() {
      if (!this.token) {
        return
      }

      try {
        const { data } = await http.get('/auth/me')
        this.user = data
      } catch (error) {
        this.user = null
        this.setToken(null)
      }
    },

    async logout() {
      try {
        if (this.token) {
          await http.post('/auth/logout')
        }
      } catch (error) {
      
      }

      this.user = null
      this.setToken(null)
    },
  },
})
