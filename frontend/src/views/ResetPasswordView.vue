<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '@/api/http'

const route = useRoute()
const router = useRouter()

const form = reactive({
  token: route.params.token,
  email: route.query.email || '',
  password: '',
  password_confirmation: '',
})
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
    const { data } = await http.post('/auth/reset-password', form)
    message.value = data.message
    setTimeout(() => router.push({ name: 'login' }), 1500)
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || {}
      message.value = error.response.data.message || ''
    } else {
      message.value = 'Не удалось сбросить пароль.'
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
        <h1 class="text-2xl font-bold text-white">Новый пароль</h1>
        <p class="mb-6 mt-1 text-sm text-gray-400">Придумайте новый пароль для вашего аккаунта.</p>

        <div
          v-if="message"
          class="mb-5 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200"
        >
          {{ message }}
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <div>
            <label for="reset-email" :class="labelClass">Email</label>
            <input id="reset-email" v-model="form.email" type="email" :class="inputClass" required />
            <p v-if="errors.email" class="mt-1 text-xs text-red-400">{{ errors.email[0] }}</p>
          </div>
          <div>
            <label for="reset-password" :class="labelClass">Новый пароль</label>
            <input id="reset-password" v-model="form.password" type="password" :class="inputClass" required />
            <p v-if="errors.password" class="mt-1 text-xs text-red-400">{{ errors.password[0] }}</p>
          </div>
          <div>
            <label for="reset-password-confirmation" :class="labelClass">Повторите пароль</label>
            <input
              id="reset-password-confirmation"
              v-model="form.password_confirmation"
              type="password"
              :class="inputClass"
              required
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-space-950 transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-glow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i v-if="loading" class="fa-solid fa-spinner fa-spin mr-2"></i> Сбросить пароль
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
