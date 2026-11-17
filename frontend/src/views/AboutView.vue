<script setup>
const stats = [
  { value: '7 лет', label: 'наблюдаем и продаём оптику' },
  { value: '4 800+', label: 'телескопов нашли владельцев' },
  { value: '12', label: 'астрономов-гидов в команде' },
  { value: '4,9 / 5', label: 'средняя оценка сервиса' },
]

const values = [
  {
    icon: 'fa-eye',
    title: 'Говорим, что видно',
    text: 'Не обещаем «галактики с балкона». Объясняем реальные возможности модели под ваш город и условия.',
  },
  {
    icon: 'fa-microscope',
    title: 'Проверяем каждую трубу',
    text: 'Собираем, юстируем и тестируем по звёздам перед отправкой. Вы получаете настроенный инструмент.',
  },
  {
    icon: 'fa-handshake-angle',
    title: 'Остаёмся рядом',
    text: 'Первый вечер, поиск объектов, чистка оптики — на связи в чате и по телефону, пока не получится.',
  },
]

const team = [
  {
    initials: 'АК',
    name: 'Артём Ковалёв',
    role: 'Астроном-гид · Минск',
    bio: 'Провожу первые наблюдения и помогаю найти объекты, которые видно даже из города.',
    sessions: '1 284 наблюдения',
    color: 'bg-cyan-800',
  },
  {
    initials: 'МВ',
    name: 'Марина Волкова',
    role: 'Оптик-инженер',
    bio: 'Отвечаю за юстировку, чистку и ремонт. Проверяю каждую партию оптики перед продажей.',
    sessions: '860 проверок оптики',
    color: 'bg-indigo-800',
  },
  {
    initials: 'ИС',
    name: 'Илья Савин',
    role: 'Ночной консультант',
    bio: 'Помогаю выбрать окуляр и настроить монтировку. На связи до последней звезды.',
    sessions: '640 консультаций',
    color: 'bg-slate-700',
  },
  {
    initials: 'АМ',
    name: 'Анна Морозова',
    role: 'Куратор клуба «Орион»',
    bio: 'Собираю выездные наблюдения для города и школ. Знаю удобные площадки в каждом районе.',
    sessions: '2 100 участников клуба',
    color: 'bg-cyan-800',
  },
]

const steps = [
  { number: '01', title: 'Разговор о цели', text: 'Спрашиваем, что и где вы хотите увидеть. Без формул и навязывания.' },
  { number: '02', title: 'Подбор комплекта', text: 'Собираем модель, окуляры и фильтры под конкретный сценарий наблюдений.' },
  { number: '03', title: 'Проверка и юстировка', text: 'Тестируем оптику по искусственной звезде и настраиваем механику.' },
  { number: '04', title: 'Первый свет', text: 'Помогаем навести телескоп на Луну или планеты в день доставки.' },
]
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-white/5 bg-space-900/40">
      <div
        class="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand/15 blur-3xl motion-safe:animate-float-slow"
        aria-hidden="true"
      ></div>
      <div class="page-shell relative">
        <div class="grid items-center gap-10 lg:grid-cols-12">
          <div class="space-y-5 lg:col-span-6">
            <span class="eyebrow">О магазине</span>
            <h1 class="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Мы открываем небо,<br />
              <span class="bg-gradient-to-r from-brand via-brand to-brand-hover bg-clip-text text-transparent">
                а не коробки
              </span>
            </h1>
            <p class="max-w-xl text-base leading-relaxed text-gray-400">
              «Орбиту» собрали практикующие наблюдатели. В каталоге нет случайных моделей: каждую мы
              проверяем на стенде и рекомендуем под реальные условия — от балкона в Минске до выезда
              в поле.
            </p>
            <div class="flex flex-col gap-3 pt-2 sm:flex-row">
              <router-link :to="{ name: 'catalog' }" class="btn-primary btn-lg">
                Смотреть каталог
                <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
              </router-link>
              <router-link :to="{ name: 'support' }" class="btn-secondary btn-lg">
                Написать астроному
              </router-link>
            </div>
          </div>

          <div class="lg:col-span-6">
            <div class="relative overflow-hidden rounded-panel border border-white/10 bg-space-800/65 p-3 backdrop-blur-md">
              <img
                src="/img/master.png"
                alt="Астроном настраивает телескоп перед наблюдениями"
                class="h-[320px] w-full rounded-card object-cover sm:h-[420px]"
              />
              <div
                class="absolute bottom-6 right-6 max-w-[13rem] rounded-panel border border-white/20 bg-space-950/80 p-4 shadow-2xl backdrop-blur-md"
              >
                <div class="text-2xl font-extrabold text-brand">100%</div>
                <p class="mt-1 text-[11px] leading-relaxed text-gray-300">
                  телескопов выезжают к покупателю уже настроенными
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-white/5 bg-space-950 py-10" aria-label="Магазин в цифрах">
      <div class="mx-auto max-w-page px-4 sm:px-6 lg:px-12">
        <div class="grid grid-cols-2 gap-8 text-center sm:text-left lg:grid-cols-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="space-y-1 lg:border-r lg:border-white/10 lg:pr-4 lg:last:border-none"
          >
            <div class="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{{ stat.value }}</div>
            <div class="text-xs text-gray-400 sm:text-sm">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="page-shell" aria-labelledby="values-title">
      <div class="mb-8 max-w-2xl">
        <span class="eyebrow">Принципы</span>
        <h2 id="values-title" class="page-title">Три вещи, за которые нам не стыдно</h2>
        <p class="page-lead">
          Мы продаём оптику так, как хотели бы, чтобы продавали нам: спокойно, честно и с
          возможностью вернуться с любым вопросом.
        </p>
      </div>

      <div class="grid gap-5 md:grid-cols-3">
        <article v-for="value in values" :key="value.title" class="card-hover">
          <span class="flex h-12 w-12 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-xl text-brand">
            <i class="fa-solid" :class="value.icon" aria-hidden="true"></i>
          </span>
          <h3 class="mt-4 text-lg font-bold text-white">{{ value.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-gray-400">{{ value.text }}</p>
        </article>
      </div>
    </section>

    <section class="border-y border-white/5 bg-space-900/50 py-section" aria-labelledby="team-title">
      <div class="mx-auto max-w-page px-4 sm:px-6 lg:px-12">
        <div class="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <span class="eyebrow">Команда</span>
            <h2 id="team-title" class="page-title">Люди, которые смотрят вместе с вами</h2>
            <p class="page-lead">
              Астрономы-гиды, оптик и куратор клуба. Каждому можно написать напрямую.
            </p>
          </div>
          <router-link
            :to="{ name: 'support' }"
            class="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
          >
            Записаться на наблюдение
            <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
          </router-link>
        </div>

        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="person in team"
            :key="person.name"
            class="group flex h-full flex-col rounded-panel border border-white/10 bg-space-800/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-glow"
          >
            <div class="flex items-center gap-3">
              <span
                class="grid h-14 w-14 shrink-0 place-items-center rounded-full text-sm font-bold text-white ring-2 ring-brand/20 transition-colors group-hover:ring-brand/50"
                :class="person.color"
                aria-hidden="true"
              >
                {{ person.initials }}
              </span>
              <div class="min-w-0">
                <h3 class="truncate text-sm font-bold text-white">{{ person.name }}</h3>
                <p class="truncate text-[11px] text-brand">{{ person.role }}</p>
              </div>
            </div>

            <p class="mt-4 flex-1 text-xs leading-relaxed text-gray-400">{{ person.bio }}</p>

            <p class="mt-4 flex items-center gap-2 text-[11px] font-medium text-gray-500">
              <i class="fa-solid fa-star text-warning" aria-hidden="true"></i>
              {{ person.sessions }}
            </p>

            <div class="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
              <a
                href="tel:+375296982476"
                class="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs text-gray-300 transition-colors hover:bg-brand hover:text-space-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                :aria-label="`Позвонить: ${person.name}`"
              >
                <i class="fa-solid fa-phone" aria-hidden="true"></i>
              </a>
              <router-link
                :to="{ name: 'support' }"
                class="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs text-gray-300 transition-colors hover:bg-brand hover:text-space-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                :aria-label="`Написать в поддержку: ${person.name}`"
              >
                <i class="fa-solid fa-comment-dots" aria-hidden="true"></i>
              </router-link>
              <span class="ml-auto text-[10px] text-gray-600 transition-colors group-hover:text-brand">на связи</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="page-shell" aria-labelledby="process-title">
      <div class="mb-8 max-w-2xl">
        <span class="eyebrow">Как мы работаем</span>
        <h2 id="process-title" class="page-title">От первого вопроса до первого света</h2>
      </div>

      <ol class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="step in steps" :key="step.number" class="panel relative overflow-hidden">
          <span class="text-3xl font-extrabold text-white/10">{{ step.number }}</span>
          <h3 class="mt-2 text-base font-bold text-white">{{ step.title }}</h3>
          <p class="mt-2 text-xs leading-relaxed text-gray-400">{{ step.text }}</p>
        </li>
      </ol>

      <div class="mt-10 flex flex-col items-center justify-between gap-4 rounded-panel border border-brand/20 bg-brand/5 p-6 sm:flex-row sm:p-8">
        <div>
          <h3 class="text-lg font-bold text-white sm:text-xl">Хотите сначала посмотреть в телескоп?</h3>
          <p class="mt-1 text-sm text-gray-400">Запишитесь на бесплатное наблюдение в Минске — покажем небо и ответим на вопросы.</p>
        </div>
        <router-link :to="{ name: 'support' }" class="btn-primary shrink-0">
          Записаться
          <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
        </router-link>
      </div>
    </section>
  </div>
</template>
