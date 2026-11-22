<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useTheme } from '@/composables/useTheme'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const route = useRoute()
const { theme, toggleTheme } = useTheme()

const mobileOpen = ref(false)
const userOpen = ref(false)
const userMenu = ref(null)

const userLabel = computed(() => auth.user?.name || auth.user?.email || 'Аккаунт')

const navLinks = [
  { name: 'catalog', label: 'Каталог' },
  { name: 'selection', label: 'Подбор' },
  { name: 'services', label: 'Услуги' },
  { name: 'about', label: 'О нас' },
  { name: 'support', label: 'Поддержка' },
]

const adminLinks = [
  { name: 'admin', label: 'Обзор магазина', icon: 'fa-gauge-high' },
  { name: 'admin-orders', label: 'Заказы', icon: 'fa-clipboard-list' },
  { name: 'admin-products', label: 'Товары', icon: 'fa-boxes-stacked' },
  { name: 'admin-import', label: 'Импорт Excel', icon: 'fa-file-excel' },
  { name: 'admin-files', label: 'Файлы', icon: 'fa-folder-open' },
]

const navLinkClass =
  'rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-brand md:rounded-none md:px-0 md:py-0 md:hover:bg-transparent'
const mobileLinkClass =
  'block rounded-xl px-4 py-3 text-base font-medium text-gray-200 transition-colors hover:bg-white/5 hover:text-brand'
const menuItemClass =
  'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/5 hover:text-brand'

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
    userOpen.value = false
  },
)

function onDocumentClick(event) {
  if (userMenu.value && !userMenu.value.contains(event.target)) {
    userOpen.value = false
  }
}

async function handleLogout() {
  userOpen.value = false
  await auth.logout()
  router.push({ name: 'home' })
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <header
    :data-menu-open="mobileOpen"
    class="sticky top-0 z-50 border-b border-white/5 bg-space-950/80 backdrop-blur-md"
  >
    <div class="mx-auto flex h-20 max-w-page items-center justify-between px-4 sm:px-6 lg:px-12">
      <router-link :to="{ name: 'home' }" class="group flex items-center gap-2.5">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-brand transition-colors group-hover:border-brand dark:border-white/30 dark:bg-white/90"
        >
          <img src="/logo.png" alt="" class="h-8 w-8 object-contain" aria-hidden="true" />
        </span>
        <span class="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-brand">
          Орбита
        </span>
      </router-link>

      <!-- Навигация для планшета и ПК -->
      <nav class="hidden items-center gap-8 text-sm font-medium text-gray-300 md:flex" aria-label="Основная навигация">
        <router-link
          v-for="link in navLinks"
          :key="link.name"
          :to="{ name: link.name }"
          class="transition-colors hover:text-brand"
          active-class="text-brand"
        >
          {{ link.label }}
        </router-link>
      </nav>

      <div class="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          role="switch"
          class="rounded-xl p-2 text-gray-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Тёмная тема сайта"
          :aria-checked="theme === 'dark'"
          :title="theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'"
          @click="toggleTheme"
        >
          <i :class="theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'" class="text-lg"></i>
        </button>

        <router-link
          :to="{ name: 'cart' }"
          class="relative hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-brand/40 hover:text-white sm:inline-flex"
          :aria-label="`Корзина, товаров: ${cart.count}`"
        >
          <i class="fa-solid fa-cart-shopping text-brand" aria-hidden="true"></i>
          <span class="hidden lg:inline">Корзина</span>
          <span
            v-if="cart.count > 0"
            class="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-space-950"
            aria-hidden="true"
          >
            {{ cart.count }}
          </span>
        </router-link>

        <template v-if="auth.isAuthenticated">
          <div ref="userMenu" class="relative">
            <button
              type="button"
              class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 transition-colors hover:border-brand/40 hover:text-white"
              :aria-expanded="userOpen"
              aria-haspopup="true"
              @click="userOpen = !userOpen"
            >
              <i class="fa-solid fa-user-astronaut text-brand"></i>
              <span class="hidden max-w-[10rem] truncate sm:inline">{{ userLabel }}</span>
              <i
                class="fa-solid fa-chevron-down text-[10px] text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': userOpen }"
              ></i>
            </button>

            <div
              v-if="userOpen"
              class="absolute right-0 mt-2 w-64 overflow-hidden rounded-panel border border-white/10 bg-space-900 p-2 shadow-2xl"
            >
              <p class="px-3 py-2 text-[11px] text-gray-500">
                {{ auth.isAdmin ? 'Администратор' : 'Личный кабинет' }}
              </p>

              <router-link
                v-for="link in adminLinks"
                :key="link.name"
                :to="{ name: link.name }"
                :class="menuItemClass"
              >
                <i class="fa-solid w-3.5 text-center text-xs" :class="link.icon" aria-hidden="true"></i>
                {{ link.label }}
              </router-link>

              <div class="my-1 h-px bg-white/10"></div>

              <a
                href="http://127.0.0.1:8000/admin"
                target="_blank"
                rel="noopener"
                :class="menuItemClass"
              >
                <i class="fa-solid fa-database w-3.5 text-center text-xs" aria-hidden="true"></i>
                Voyager
                <i class="fa-solid fa-arrow-up-right-from-square ml-auto text-[10px] text-gray-500" aria-hidden="true"></i>
              </a>

              <button
                type="button"
                class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-gray-200 transition-colors hover:bg-white/5 hover:text-brand"
                @click="handleLogout"
              >
                <i class="fa-solid fa-arrow-right-from-bracket w-3.5 text-center text-xs" aria-hidden="true"></i>
                Выйти
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <router-link
            :to="{ name: 'login' }"
            class="hidden text-sm font-medium text-gray-300 transition-colors hover:text-brand sm:inline-flex"
          >
            Вход
          </router-link>
          <router-link
            :to="{ name: 'register' }"
            class="hidden items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-space-950 transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-glow-sm sm:inline-flex"
          >
            Регистрация
          </router-link>
        </template>

        <!-- Burger -->
        <button
          type="button"
          class="rounded-xl p-2 text-gray-300 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          :aria-expanded="mobileOpen"
          aria-label="Меню"
          aria-controls="mobile-menu"
          :data-open="mobileOpen"
          @click="mobileOpen = !mobileOpen"
        >
          <i :class="mobileOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'" class="text-2xl"></i>
        </button>
      </div>
    </div>

    <!-- Мобильное меню -->
    <div
      id="mobile-menu"
      :data-open="mobileOpen"
      class="overflow-hidden border-t border-white/5 bg-space-900 transition-all duration-300 md:hidden"
      :class="mobileOpen ? 'visible max-h-[48rem] opacity-100' : 'invisible max-h-0 opacity-0'"
    >
      <nav class="flex flex-col gap-1 px-4 py-4 sm:px-6" aria-label="Мобильная навигация">
        <router-link
          v-for="link in navLinks"
          :key="link.name"
          :to="{ name: link.name }"
          :class="mobileLinkClass"
          active-class="text-brand"
        >
          {{ link.label }}
        </router-link>

        <router-link
          :to="{ name: 'cart' }"
          :class="mobileLinkClass"
          active-class="text-brand"
          class="flex items-center justify-between gap-3"
        >
          <span class="flex items-center gap-2">
            <i class="fa-solid fa-cart-shopping w-4 text-center text-xs" aria-hidden="true"></i>
            Корзина
          </span>
          <span
            v-if="cart.count > 0"
            class="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-space-950"
          >
            {{ cart.count }}
          </span>
        </router-link>

        <template v-if="auth.isAuthenticated">
          <p class="mt-3 border-t border-white/10 px-4 pt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Панель управления
          </p>
          <router-link
            v-for="link in adminLinks"
            :key="link.name"
            :to="{ name: link.name }"
            :class="mobileLinkClass"
            active-class="text-brand"
          >
            <i class="fa-solid mr-2 w-4 text-center text-xs" :class="link.icon" aria-hidden="true"></i>
            {{ link.label }}
          </router-link>
          <button
            type="button"
            class="mt-2 w-full rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-brand/40 hover:text-brand"
            @click="handleLogout"
          >
            Выйти ({{ userLabel }})
          </button>
        </template>

        <template v-else>
          <div class="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
            <router-link
              :to="{ name: 'login' }"
              class="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-brand/40 hover:text-brand"
            >
              Вход
            </router-link>
            <router-link
              :to="{ name: 'register' }"
              class="rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-space-950 transition-colors hover:bg-brand-hover"
            >
              Регистрация
            </router-link>
          </div>
        </template>
      </nav>
    </div>
  </header>
</template>
