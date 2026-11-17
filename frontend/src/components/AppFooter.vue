<template>
  <footer class="mt-16 border-t border-white/10 bg-space-950 pt-16 pb-12 text-gray-400">
    <div class="mx-auto max-w-page px-4 sm:px-6 lg:px-12">
      <div class="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div class="space-y-4 lg:col-span-2">
          <router-link :to="{ name: 'home' }" class="group flex items-center gap-2.5">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-brand transition-colors group-hover:border-brand"
            >
              <i class="fa-solid fa-satellite -rotate-45 text-sm transition-transform duration-300 group-hover:rotate-0"></i>
            </span>
            <span class="text-xl font-bold tracking-tight text-white">Орбита</span>
          </router-link>
          <p class="max-w-sm text-xs leading-relaxed text-gray-400">
            Телескопы, оптика и поддержка для тех, кто хочет увидеть космос своими глазами.
          </p>
          <div class="pt-2">
            <a
              href="tel:+375296982476"
              class="block text-xl font-bold text-white transition-colors hover:text-brand"
            >
              +375 (29) 698-24-76
            </a>
            <p class="mt-1 text-xs text-gray-500">Ежедневно 10:00–20:00 · shop@orbita.by</p>
          </div>
          <div class="flex items-center gap-3 pt-2">
            <a
              href="#"
              aria-label="Telegram"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs transition-colors hover:bg-brand hover:text-space-950"
            >
              <i class="fa-solid fa-paper-plane"></i>
            </a>
            <a
              href="#"
              aria-label="VKontakte"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs transition-colors hover:bg-brand hover:text-space-950"
            >
              <i class="fa-brands fa-vk"></i>
            </a>
            <a
              href="#"
              aria-label="YouTube"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs transition-colors hover:bg-brand hover:text-space-950"
            >
              <i class="fa-brands fa-youtube"></i>
            </a>
          </div>
        </div>

        <div>
          <h4 class="mb-4 text-xs font-bold uppercase tracking-wider text-white">Магазин</h4>
          <ul class="space-y-2.5 text-xs">
            <li>
              <router-link :to="{ name: 'catalog' }" class="transition-colors hover:text-brand">
                Каталог телескопов
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'selection' }" class="transition-colors hover:text-brand">
                Подбор телескопа
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'services' }" class="transition-colors hover:text-brand">
                Услуги и тарифы
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'about' }" class="transition-colors hover:text-brand">
                О магазине
              </router-link>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="mb-4 text-xs font-bold uppercase tracking-wider text-white">Покупателям</h4>
          <ul class="space-y-2.5 text-xs">
            <li>
              <router-link :to="{ name: 'cart' }" class="transition-colors hover:text-brand">
                Корзина и оформление
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'home', hash: '#scenarios' }" class="transition-colors hover:text-brand">
                Как выбрать
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'services', hash: '#delivery' }" class="transition-colors hover:text-brand">
                Доставка и оплата
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'services', hash: '#warranty' }" class="transition-colors hover:text-brand">
                Гарантия
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'home', hash: '#reviews' }" class="transition-colors hover:text-brand">
                Отзывы
              </router-link>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="mb-4 text-xs font-bold uppercase tracking-wider text-white">Поддержка</h4>
          <ul class="space-y-2.5 text-xs">
            <li>
              <a href="tel:+375296982476" class="transition-colors hover:text-brand">
                +375 (29) 698-24-76
              </a>
            </li>
            <li>
              <a href="mailto:shop@orbita.by" class="transition-colors hover:text-brand">
                shop@orbita.by
              </a>
            </li>
            <li>
              <router-link :to="{ name: 'support' }" class="transition-colors hover:text-brand">
                Чат с астрономом
              </router-link>
            </li>
            <li class="text-gray-500">Минск, ул. Звёздная, 8</li>
          </ul>
        </div>
      </div>

      <div
        class="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-[11px] text-gray-500 sm:flex-row"
      >
        <div>© {{ new Date().getFullYear() }} Орбита. Все права защищены.</div>
        <div class="flex gap-6">
          <a href="#" class="transition-colors hover:text-gray-300">Политика конфиденциальности</a>
          <a href="#" class="transition-colors hover:text-gray-300">Оферта</a>
        </div>
      </div>
    </div>
  </footer>
</template>
