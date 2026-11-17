<script setup>
import { reactive, ref } from 'vue'
import http from '@/api/http'

const form = reactive({ email: '' })
const status = ref('')
const errors = ref({})
const loading = ref(false)

const inputClass =
  'w-full rounded-xl border border-white/15 bg-space-950/80 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20'
const labelClass = 'mb-1.5 block text-xs font-medium text-gray-400'

async function submit() {
  loading.value = true
  status.value = ''
  errors.value = {}

  try {
    const { data } = await http.post('/auth/forgot-password', form)
    status.value = data.message
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || {}
      status.value = error.response.data.message || ''
    } else {
      status.value = 'Не удалось отправить ссылку.'
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
        <h1 class="text-2xl font-bold text-white">Восстановление пароля</h1>
        <p class="mb-6 mt-1 text-sm text-gray-400">
          Укажите email — мы отправим ссылку для сброса пароля.
        </p>

        <div
          v-if="status"
          class="mb-5 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200"
        >
          {{ status }}
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <div>
            <label for="forgot-email" :class="labelClass">Email</label>
            <input id="forgot-email" v-model="form.email" type="email" :class="inputClass" required />
            <p v-if="errors.email" class="mt-1 text-xs text-red-400">{{ errors.email[0] }}</p>
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-space-950 transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-glow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i v-if="loading" class="fa-solid fa-spinner fa-spin mr-2"></i> Отправить ссылку
          </button>
        </form>

        <p class="mt-5 text-sm">
          <router-link :to="{ name: 'login' }" class="text-gray-400 transition-colors hover:text-brand">
            Вернуться ко входу
          </router-link>
        </p>
      </div>
    </div>
  </section>
</template>
