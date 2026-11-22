<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps({
  title: { type: String, required: true },
})

const auth = useAuthStore()
const route = useRoute()
const open = ref(false)

const links = [
  { name: 'admin', label: 'Обзор', icon: 'fa-gauge-high' },
  { name: 'admin-orders', label: 'Заказы', icon: 'fa-clipboard-list' },
  { name: 'admin-products', label: 'Товары', icon: 'fa-boxes-stacked' },
  { name: 'admin-import', label: 'Импорт Excel', icon: 'fa-file-excel' },
  { name: 'admin-files', label: 'Файлы', icon: 'fa-folder-open' },
]

const initials = computed(() => {
  const name = auth.user?.name || 'Орбита'

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
})

watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)
</script>

<template>
  <div class="flex min-h-[calc(100vh-5rem)] items-stretch">
    <div
      v-if="open"
      class="fixed inset-x-0 bottom-0 top-20 z-30 bg-space-950/70 backdrop-blur-sm lg:hidden"
      aria-hidden="true"
      @click="open = false"
    ></div>

    <aside
      id="admin-sidebar"
      class="fixed bottom-0 left-0 top-20 z-40 flex w-64 shrink-0 flex-col border-r border-white/10 bg-space-900 transition-transform duration-300 ease-out lg:sticky lg:bottom-auto lg:top-20 lg:z-0 lg:h-[calc(100vh-5rem)] lg:translate-x-0"
      :class="open ? 'translate-x-0' : '-translate-x-full'"
      aria-label="Меню панели управления"
    >
      <div class="flex h-14 items-center gap-2 border-b border-white/10 px-4">
        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand dark:bg-white/90">
          <img src="/logo.png" alt="" class="h-4 w-4 object-contain" aria-hidden="true" />
        </span>
        <span class="truncate text-sm font-bold text-white">Orbit Admin</span>
        <button
          type="button"
          class="ml-auto rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
          aria-label="Закрыть меню"
          @click="open = false"
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto scrollbar-thin p-3" aria-label="Разделы панели управления">
        <router-link
          v-for="link in links"
          :key="link.name"
          :to="{ name: link.name }"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          :class="
            route.name === link.name
              ? 'bg-brand/10 font-semibold text-brand'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          "
          :aria-current="route.name === link.name ? 'page' : undefined"
        >
          <i class="fa-solid w-4 text-center text-xs" :class="link.icon" aria-hidden="true"></i>
          <span class="truncate">{{ link.label }}</span>
        </router-link>
      </nav>

      <div class="border-t border-white/10 p-3">
        <div class="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/20 text-xs font-bold text-brand">
            {{ initials }}
          </span>
          <div class="min-w-0">
            <p class="truncate text-xs font-semibold text-white">{{ auth.user?.name || 'Администратор' }}</p>
            <p class="truncate text-[11px] text-gray-500">{{ auth.user?.email || 'admin@orbita.by' }}</p>
          </div>
        </div>
      </div>
    </aside>

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-3 border-b border-white/10 bg-space-950/70 px-4 py-3 backdrop-blur sm:px-6">
        <button
          type="button"
          class="rounded-xl p-2 text-gray-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
          aria-label="Открыть меню"
          aria-controls="admin-sidebar"
          :aria-expanded="open"
          @click="open = true"
        >
          <i class="fa-solid fa-bars" aria-hidden="true"></i>
        </button>

        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Панель управления</p>
          <h1 class="truncate text-sm font-bold text-white sm:text-base">{{ title }}</h1>
        </div>

        <div class="ml-auto flex items-center gap-3">
          <router-link
            :to="{ name: 'home' }"
            class="hidden items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-brand sm:inline-flex"
          >
            На сайт
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]" aria-hidden="true"></i>
          </router-link>
          <span class="grid h-8 w-8 place-items-center rounded-full bg-brand/15 text-[10px] font-bold text-brand">
            {{ initials }}
          </span>
        </div>
      </div>

      <div class="p-4 sm:p-6">
        <slot />
      </div>
    </div>
  </div>
</template>
