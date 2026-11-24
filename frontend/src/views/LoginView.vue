<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isDemoMode } from '@/api/demo'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

// Данные администратора подставлены заранее для удобства проверки проекта.
const form = reactive({ email: 'admin@orbita.by', password: 'admin12345' })
const errors = ref({})
const message = ref('')
const loading = ref(false)

const inputClass =
  'w-full rounded-xl border border-white/15 bg-space-950/80 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20'
const labelClass = 'mb-1.5 block text-xs font-medium text-gray-400'

async function submit() {
  loading.value = true
  errors.value = {}
  message.value = ''

  try {
    await auth.login(form)
    const fallback = auth.isAdmin ? { name: 'admin' } : { name: 'home' }
    router.push(route.query.redirect || fallback)
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || { email: [error.response.data.message] }
    } else {
      message.value = 'Не удалось войти. Проверьте соединение с сервером.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="flex min-h-[70vh] items-center py-16">
    <div class="mx-auto w-full max-w-md px-4 sm:px-6">
      <div class="rounded-panel border border-white/10 bg-space-800/65 p-6 backdrop-blur-md sm:p-8">
        <h1 class="text-2xl font-bold text-white">Вход в аккаунт</h1>
        <p class="mb-6 mt-1 text-sm text-gray-400">
          Войдите, чтобы управлять товарами и импортом.
        </p>

        <div
          v-if="isDemoMode"
          class="mb-5 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand"
        >
          Демо-публикация: войдите как администратор (<strong>admin@orbita.by</strong> /
          <strong>admin12345</strong>), чтобы открыть панель управления. Изменения сохраняются
          локально в браузере.
        </div>

        <div
          v-if="message"
          class="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {{ message }}
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <div>
            <label for="login-email" :class="labelClass">Email</label>
            <input id="login-email" v-model="form.email" type="email" :class="inputClass" required />
            <p v-if="errors.email" class="mt-1 text-xs text-red-400">{{ errors.email[0] }}</p>
          </div>
          <div>
            <label for="login-password" :class="labelClass">Пароль</label>
            <input id="login-password" v-model="form.password" type="password" :class="inputClass" required />
            <p v-if="errors.password" class="mt-1 text-xs text-red-400">{{ errors.password[0] }}</p>
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-space-950 transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-glow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i v-if="loading" class="fa-solid fa-spinner fa-spin mr-2"></i> Войти
          </button>
        </form>

        <div class="mt-5 flex justify-between text-sm">
          <router-link :to="{ name: 'forgot-password' }" class="text-gray-400 transition-colors hover:text-brand">
            Забыли пароль?
          </router-link>
          <router-link :to="{ name: 'register' }" class="text-brand transition-colors hover:text-brand-hover">
            Регистрация
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>
