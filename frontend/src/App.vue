<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const cart = useCartStore()
const isAdmin = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <div class="flex min-h-screen flex-col overflow-x-clip bg-space-950 text-gray-100">
    <a
      href="#main-content"
      class="sr-only rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-space-950 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]"
    >
      Перейти к содержимому
    </a>

    <AppNavbar />

    <main id="main-content" class="flex-1" tabindex="-1">
      <router-view />
    </main>

    <AppFooter v-if="!isAdmin" />

    <!-- Уведомление о действиях с корзиной -->
    <div
      class="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end"
      role="status"
      aria-live="polite"
    >
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-2 opacity-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="translate-y-2 opacity-0"
      >
        <div
          v-if="cart.notice"
          class="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-panel border border-brand/30 bg-space-900/95 px-4 py-3 shadow-2xl backdrop-blur-md"
        >
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/15 text-sm text-brand">
            <i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>
          </span>
          <p class="min-w-0 flex-1 text-xs leading-relaxed text-gray-200">{{ cart.notice }}</p>
          <router-link
            :to="{ name: 'cart' }"
            class="shrink-0 text-xs font-semibold text-brand transition-colors hover:text-brand-hover"
          >
            Открыть
          </router-link>
        </div>
      </transition>
    </div>
  </div>
</template>
