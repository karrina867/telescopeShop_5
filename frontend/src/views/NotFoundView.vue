<template>
  <section class="flex min-h-[70vh] items-center py-20 text-center">
    <div class="mx-auto max-w-page px-4 sm:px-6 lg:px-12">
      <p class="text-sm font-bold uppercase tracking-[0.3em] text-brand">Ошибка 404</p>
      <h1 class="mt-4 text-7xl font-extrabold tracking-tight text-white sm:text-9xl">404</h1>
      <p class="mx-auto mt-4 max-w-lg text-sm text-gray-400 sm:text-base">
        Страница не найдена. Возможно, она улетела в другую галактику.
      </p>
      <router-link
        :to="{ name: 'home' }"
        class="mt-8 inline-flex items-center gap-3 rounded-full bg-brand px-8 py-4 text-base font-semibold text-space-950 transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-glow-sm"
      >
        На главную
        <i class="fa-solid fa-arrow-right text-sm"></i>
      </router-link>
    </div>
  </section>
</template>
