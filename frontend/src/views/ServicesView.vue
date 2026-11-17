<script setup>
import PriceTag from '@/components/PriceTag.vue'

const services = [
  { icon: 'fa-truck-fast', title: 'Доставка 1–3 дня', text: 'Усиленная упаковка, страховка и отслеживание по всей стране.' },
  { icon: 'fa-sliders', title: 'Юстировка перед отправкой', text: 'Проверяем оптику по искусственной звезде и настраиваем механику.' },
  { icon: 'fa-video', title: 'Запуск по видеосвязи', text: 'Помогаем собрать телескоп и навести его на первый объект.' },
  { icon: 'fa-shield-halved', title: 'Гарантия 2 года', text: 'Собственный сервис и запасные части без долгого ожидания.' },
  { icon: 'fa-credit-card', title: 'Рассрочка на 6 месяцев', text: 'Без переплаты для моделей от 3 000 рублей — оформление на месте.' },
  { icon: 'fa-moon', title: 'Выездные наблюдения', text: 'Совместные вечера за городом с астрономом и телескопами клуба.' },
]

const plans = [
  {
    name: 'Базовый',
    price: 0,
    note: 'Для первого знакомства',
    popular: false,
    cta: 'Создать аккаунт',
    route: 'register',
    features: [
      { text: 'Полный доступ к каталогу', ok: true },
      { text: 'Статьи о наблюдениях', ok: true },
      { text: 'Подбор модели по сценарию', ok: true },
      { text: 'Личный астроном-гид', ok: false },
      { text: 'Выездные наблюдения', ok: false },
    ],
  },
  {
    name: 'Наблюдатель',
    price: 29,
    note: 'Для регулярных наблюдений',
    popular: true,
    cta: 'Подключить',
    route: 'support',
    features: [
      { text: 'Всё из «Базового»', ok: true },
      { text: 'Личный астроном-гид', ok: true },
      { text: 'Проверка юстировки дважды в год', ok: true },
      { text: 'Скидка 10% на аксессуары', ok: true },
      { text: 'Выездные наблюдения', ok: false },
    ],
  },
  {
    name: 'Клуб',
    price: 99,
    note: 'Для клубов и школ',
    popular: false,
    cta: 'Обсудить условия',
    route: 'support',
    features: [
      { text: 'Всё из «Наблюдателя»', ok: true },
      { text: 'Выездные наблюдения с гидом', ok: true },
      { text: 'Групповые занятия', ok: true },
      { text: 'Приоритетный сервис', ok: true },
      { text: 'Персональный менеджер', ok: true },
    ],
  },
]

const delivery = [
  { icon: 'fa-box', title: 'Упаковка', text: 'Жёсткий короб, пеноматериал и отдельная защита трубы и монтировки.' },
  { icon: 'fa-location-dot', title: 'Города', text: 'Минск — в день заказа, областные центры — 1–3 дня, остальные — до 5 дней.' },
  { icon: 'fa-money-bill-wave', title: 'Оплата', text: 'Карта, ЕРИП, наличные при получении и рассрочка без переплаты.' },
]

const faqs = [
  {
    question: 'Сколько стоит доставка?',
    answer: 'По Минску — бесплатно при заказе от 300 рублей. По стране — от 15 рублей, точная сумма видна при оформлении.',
  },
  {
    question: 'Что входит в гарантию?',
    answer: 'Два года на оптику и механику, бесплатная юстировка в первый год и консультации по эксплуатации без ограничений.',
  },
  {
    question: 'Можно ли вернуть телескоп?',
    answer: 'Да, в течение 14 дней при сохранении комплектации и упаковки. Оптику проверяем вместе с вами при возврате.',
  },
]
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-white/5 bg-space-900/40">
      <div
        class="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-brand/15 blur-3xl motion-safe:animate-pulse"
        aria-hidden="true"
      ></div>
      <div
        class="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl motion-safe:animate-float-slow"
        aria-hidden="true"
      ></div>

      <div class="page-shell relative grid items-center gap-10 lg:grid-cols-12">
        <div class="space-y-5 lg:col-span-7">
          <span class="eyebrow">Сервис и тарифы</span>
          <h1 class="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Спокойный старт
            <span class="bg-gradient-to-r from-brand via-cyan-300 to-brand-hover bg-clip-text text-transparent">
              в астрономии
            </span>
          </h1>
          <p class="max-w-xl text-base leading-relaxed text-gray-400">
            Всё, чтобы от покупки до первого наблюдения прошёл один вечер: доставка, юстировка,
            настройка и поддержка астронома.
          </p>
          <div class="flex flex-col gap-3 sm:flex-row">
            <a href="#pricing" class="btn-primary btn-lg">
              Посмотреть тарифы
              <i class="fa-solid fa-arrow-down text-xs" aria-hidden="true"></i>
            </a>
            <router-link :to="{ name: 'selection' }" class="btn-secondary btn-lg">
              Подобрать телескоп
            </router-link>
          </div>
        </div>

        <div class="lg:col-span-5">
          <div class="panel">
            <h2 class="text-sm font-bold text-white">Что уже включено в покупку</h2>
            <ul class="mt-4 space-y-3 text-sm text-gray-300">
              <li v-for="item in ['Сборка и юстировка', 'Первый запуск с гидом', 'Гарантия 2 года', 'Поддержка в чате']" :key="item" class="flex items-center gap-3">
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand">
                  <i class="fa-solid fa-check text-[10px]" aria-hidden="true"></i>
                </span>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="page-shell" aria-labelledby="services-title">
      <div class="mb-8 max-w-2xl">
        <span class="eyebrow">Услуги</span>
        <h2 id="services-title" class="page-title">Забота после оплаты</h2>
        <p class="page-lead">Каждый пункт — часть обычной покупки, а не платная опция.</p>
      </div>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="service in services" :key="service.title" class="card-hover">
          <span class="flex h-11 w-11 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-lg text-brand">
            <i class="fa-solid" :class="service.icon" aria-hidden="true"></i>
          </span>
          <h3 class="mt-4 text-base font-bold text-white">{{ service.title }}</h3>
          <p class="mt-2 text-xs leading-relaxed text-gray-400">{{ service.text }}</p>
        </article>
      </div>
    </section>

    <section id="pricing" class="border-y border-white/5 bg-space-900/50 py-section">
      <div class="mx-auto max-w-page px-4 sm:px-6 lg:px-12">
        <div class="mx-auto mb-10 max-w-2xl text-center">
          <span class="eyebrow">Тарифы</span>
          <h2 class="page-title">Клубная поддержка «Орбиты»</h2>
          <p class="page-lead mx-auto">
            Базовые консультации бесплатны навсегда. Подписка добавляет личного гида и выездные
            наблюдения.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-center">
          <article
            v-for="plan in plans"
            :key="plan.name"
            class="relative flex h-full flex-col rounded-panel border p-6 transition-all duration-300"
            :class="
              plan.popular
                ? 'border-brand/40 bg-space-800/80 shadow-glow ring-2 ring-brand lg:scale-105'
                : 'border-white/10 bg-space-800/50 hover:border-brand/25 hover:shadow-glow-sm'
            "
          >
            <span
              v-if="plan.popular"
              class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-space-950"
            >
              Выбирают чаще
            </span>
            <h3 class="text-lg font-bold text-white">{{ plan.name }}</h3>
            <p class="mt-1 text-xs text-gray-400">{{ plan.note }}</p>
            <p class="mt-5 flex items-end gap-1 text-4xl text-white">
              <PriceTag :value="plan.price" />
              <span class="pb-1 text-sm font-normal text-gray-400">/ мес</span>
            </p>
            <ul class="mt-6 flex-1 divide-y divide-white/10 text-sm">
              <li v-for="feature in plan.features" :key="feature.text" class="flex items-center gap-3 py-2.5">
                <i
                  class="fa-solid w-4 text-center text-xs"
                  :class="feature.ok ? 'fa-check text-emerald-400' : 'fa-xmark text-red-400'"
                  aria-hidden="true"
                ></i>
                <span :class="feature.ok ? 'text-gray-300' : 'text-gray-500 line-through'">{{ feature.text }}</span>
                <span class="sr-only">{{ feature.ok ? 'включено' : 'не включено' }}</span>
              </li>
            </ul>
            <router-link
              :to="{ name: plan.route }"
              class="mt-6 w-full"
              :class="plan.popular ? 'btn-primary' : 'btn-secondary'"
            >
              {{ plan.cta }}
            </router-link>
          </article>
        </div>

        <p class="mt-6 text-center text-xs text-gray-500">
          Подписку можно отменить в любой момент — оплата прекращается со следующего месяца.
        </p>
      </div>
    </section>

    <section id="delivery" class="page-shell" aria-labelledby="delivery-title">
      <div class="grid gap-8 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <span class="eyebrow">Доставка и оплата</span>
          <h2 id="delivery-title" class="page-title">Довезём целым</h2>
          <p class="mt-3 text-sm leading-relaxed text-gray-400">
            Телескоп — не та вещь, которую стоит трясти в дороге. Поэтому упаковываем в жёсткий
            короб и страхуем каждую отправку.
          </p>
        </div>
        <div class="grid gap-5 sm:grid-cols-3 lg:col-span-8">
          <article v-for="item in delivery" :key="item.title" class="panel">
            <i class="fa-solid text-xl text-brand" :class="item.icon" aria-hidden="true"></i>
            <h3 class="mt-3 text-sm font-bold text-white">{{ item.title }}</h3>
            <p class="mt-2 text-xs leading-relaxed text-gray-400">{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="warranty" class="border-y border-white/5 bg-space-900/50 py-section">
      <div class="mx-auto grid max-w-page gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-12">
        <div class="lg:col-span-6">
          <span class="eyebrow">Гарантия</span>
          <h2 class="page-title">Два года на оптику и механику</h2>
          <p class="mt-3 text-sm leading-relaxed text-gray-400">
            Ремонт делаем в собственном сервисе. Если неисправность наша — забираем, чиним и
            возвращаем бесплатно. На время ремонта можем выдать подменный окуляр.
          </p>
          <ul class="mt-5 space-y-3 text-sm text-gray-300">
            <li v-for="item in ['Бесплатная юстировка в первый год', 'Консультации по эксплуатации без ограничений', 'Запасные части со склада в Минске']" :key="item" class="flex items-start gap-3">
              <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand">
                <i class="fa-solid fa-check text-[10px]" aria-hidden="true"></i>
              </span>
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="lg:col-span-6">
          <div class="panel">
            <h3 class="text-base font-bold text-white">Частые вопросы</h3>
            <div class="mt-4 space-y-3">
              <details v-for="(faq, index) in faqs" :key="faq.question" class="group faq-item" :open="index === 0">
                <summary class="faq-summary">
                  <span>{{ faq.question }}</span>
                  <i class="fa-solid fa-chevron-down shrink-0 text-xs text-gray-500 transition-transform duration-300 group-open:rotate-180" aria-hidden="true"></i>
                </summary>
                <p class="border-t border-white/5 px-4 py-3 text-xs leading-relaxed text-gray-400">{{ faq.answer }}</p>
              </details>
            </div>
            <router-link :to="{ name: 'support', hash: '#faq' }" class="btn-secondary btn-sm mt-5 w-full">
              Все вопросы в поддержке
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="page-shell">
      <div class="flex flex-col items-center justify-between gap-4 rounded-panel border border-brand/20 bg-brand/5 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
        <div>
          <h2 class="text-lg font-bold text-white sm:text-xl">Не уверены, нужна ли подписка?</h2>
          <p class="mt-1 text-sm text-gray-400">Начните с бесплатного подбора — гид ответит на вопросы без обязательств.</p>
        </div>
        <router-link :to="{ name: 'selection' }" class="btn-primary shrink-0">
          Пройти подбор
          <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
        </router-link>
      </div>
    </section>
  </div>
</template>
