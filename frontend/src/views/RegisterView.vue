<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({
  name: '',
  email: '',
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
    await auth.register(form)
    router.push({ name: 'home' })
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || {}
    } else {
      message.value = 'Не удалось зарегистрироваться.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="flex min-h-[70vh] items-center py-16">
    <div class="mx-auto w-full max-w-lg px-4 sm:px-6">
      <div class="rounded-panel border border-white/10 bg-space-800/65 p-6 backdrop-blur-md sm:p-8">
        <h1 class="text-2xl font-bold text-white">Регистрация</h1>
        <p class="mb-6 mt-1 text-sm text-gray-400">Создайте аккаунт магазина «Орбита».</p>

        <div
          v-if="message"
          class="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {{ message }}
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <div>
            <label for="register-name" :class="labelClass">Имя</label>
            <input id="register-name" v-model="form.name" :class="inputClass" required />
            <p v-if="errors.name" class="mt-1 text-xs text-red-400">{{ errors.name[0] }}</p>
          </div>
          <div>
            <label for="register-email" :class="labelClass">Email</label>
            <input id="register-email" v-model="form.email" type="email" :class="inputClass" required />
            <p v-if="errors.email" class="mt-1 text-xs text-red-400">{{ errors.email[0] }}</p>
          </div>
          <div>
            <label for="register-password" :class="labelClass">Пароль</label>
            <input id="register-password" v-model="form.password" type="password" :class="inputClass" required />
            <p v-if="errors.password" class="mt-1 text-xs text-red-400">{{ errors.password[0] }}</p>
          </div>
          <div>
            <label for="register-password-confirmation" :class="labelClass">Повторите пароль</label>
            <input
              id="register-password-confirmation"
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
            <i v-if="loading" class="fa-solid fa-spinner fa-spin mr-2"></i> Зарегистрироваться
          </button>
        </form>

        <p class="mt-5 text-sm text-gray-400">
          Уже есть аккаунт?
          <router-link :to="{ name: 'login' }" class="text-brand transition-colors hover:text-brand-hover">
            Войти
          </router-link>
        </p>
      </div>
    </div>
  </section>
</template>
