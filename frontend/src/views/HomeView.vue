<script setup>
import { onMounted, ref } from 'vue'
import http from '@/api/http'
import AdSlot from '@/components/AdSlot.vue'
import ProductCard from '@/components/ProductCard.vue'

const products = ref([])
const loading = ref(false)
const leadName = ref('')
const leadContact = ref('')
const leadSent = ref(false)

const stats = [
  { value: '7 лет', label: 'помогаем смотреть дальше' },
  { value: '4 800+', label: 'телескопов нашли своих владельцев' },
  { value: '2 года', label: 'гарантия и собственный сервис' },
  { value: '1–3 дня', label: 'доставка по крупным городам' },
]

const scenarios = [
  {
    number: '01',
    title: 'Луна и планеты',
    text: 'Контрастные кратеры, кольца Сатурна и спутники Юпитера. Отличный выбор для города.',
    image: '/img/img_1.png',
  },
  {
    number: '02',
    title: 'Туманности и галактики',
    text: 'Больше света для далёких объектов и тёмного загородного неба.',
    image: '/img/img_2.png',
  },
  {
    number: '03',
    title: 'Поездки и балкон',
    text: 'Компактные модели, которые легко взять с собой и быстро настроить.',
    image: '/img/img_3.png',
  },
]

const services = [
  { icon: 'fa-sliders', title: 'Проверяем оптику', text: 'Юстируем и тестируем каждый телескоп перед отправкой.' },
  { icon: 'fa-video', title: 'Помогаем начать', text: 'Бесплатная настройка по видеосвязи и вводный урок.' },
  { icon: 'fa-box-open', title: 'Бережно доставляем', text: 'Усиленная упаковка и страховка по всей стране.' },
  { icon: 'fa-shield-halved', title: 'Гарантия 2 года', text: 'Собственный сервис и запасные детали без ожидания.' },
]

const reviews = [
  {
    initials: 'АМ',
    name: 'Анна Миронова',
    meta: 'Минск · Luna 90 EQ',
    color: 'bg-cyan-800',
    text: 'Первый вечер — и мы уже увидели кольца Сатурна. Консультант объяснил всё без сложных терминов.',
  },
  {
    initials: 'ИС',
    name: 'Илья Самойлов',
    meta: 'Минск · DeepSky 130',
    color: 'bg-indigo-800',
    text: 'DeepSky 130 оказался именно тем, что нужно для выездов за город. Светосильный, собран аккуратно.',
  },
  {
    initials: 'МВ',
    name: 'Марина Волкова',
    meta: 'Брест · Start 70 AZ',
    color: 'bg-slate-700',
    text: 'Покупали сыну, а теперь наблюдаем всей семьёй. Вводный курс помог начать в день доставки.',
  },
]

const faqs = [
  {
    question: 'Сложно ли настроить телескоп впервые?',
    answer:
      'Нет. Мы собираем и юстируем телескоп перед выдачей, а затем показываем настройку на месте или по видеосвязи. Обычно первый вечер занимает 20–30 минут.',
  },
  {
    question: 'Что можно увидеть из города?',
    answer:
      'Луну, Юпитер, Сатурн, Венеру, двойные звёзды и яркие туманности. Для далёких галактик лучше выехать за город — мы подскажем удобные площадки.',
  },
  {
    question: 'Можно ли вернуть телескоп, если он не подошёл?',
    answer:
      'Да, в течение 14 дней при сохранении комплектации и упаковки. Оптику проверяем вместе с вами, чтобы исключить повреждения при транспортировке.',
  },
  {
    question: 'Есть ли рассрочка или доставка?',
    answer:
      'Для моделей от 3 000 A доступна рассрочка на 6 месяцев без переплаты. Доставка по крупным городам занимает 1–3 дня, по остальным — до 5 дней.',
  },
]

const inputClass =
  'w-full rounded-xl border border-white/15 bg-space-950/80 px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20'

async function loadProducts() {
  loading.value = true
  try {
    const { data } = await http.get('/products', { params: { per_page: 4 } })
    products.value = data.data
  } catch (error) {
    products.value = []
  } finally {
    loading.value = false
  }
}

function submitLead() {
  leadSent.value = true
  leadName.value = ''
  leadContact.value = ''
}

onMounted(loadProducts)
</script>

<template>
  <div>
    <!-- Hero -->
    <section
      class="stars-bg relative overflow-hidden bg-[linear-gradient(to_right,rgba(3,7,18,0.95),rgba(3,7,18,0.7),transparent),url('/img/back.png')] bg-cover bg-center bg-no-repeat pb-16 pt-12 light:bg-[linear-gradient(to_right,rgba(248,250,252,0.96),rgba(248,250,252,0.82),rgba(248,250,252,0.35)),url('/img/back.png')] md:pb-24 md:pt-20"
    >
      <div
        class="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand/20 blur-3xl motion-safe:animate-float-slow"
        aria-hidden="true"
      ></div>
      <div
        class="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl motion-safe:animate-pulse"
        aria-hidden="true"
      ></div>

      <div class="relative mx-auto max-w-page px-4 sm:px-6 lg:px-12">
        <div class="max-w-3xl space-y-6 text-center lg:text-left">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand sm:text-sm"
          >
            <span class="h-2 w-2 animate-pulse rounded-full bg-brand"></span>
            Космос начинается дома
          </span>

          <h1 class="text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ваш первый телескоп.<br class="hidden sm:inline" />
            <span class="bg-gradient-to-r from-white via-cyan-100 to-brand bg-clip-text text-transparent">
              Впечатления — навсегда
            </span>
          </h1>

          <p class="mx-auto max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg lg:mx-0">
            Подберём оптику под ваши цели, проверим перед отправкой и научим видеть больше — от лунных
            кратеров до далёких галактик.
          </p>

          <div class="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row lg:justify-start">
            <router-link
              :to="{ name: 'catalog' }"
              class="inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand px-8 py-4 text-base font-semibold text-space-950 transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-glow-sm sm:w-auto"
            >
              Выбрать телескоп
              <i class="fa-solid fa-arrow-right text-sm"></i>
            </router-link>
            <a
              href="#consultation"
              class="w-full rounded-full border border-white/15 bg-white/5 px-8 py-4 text-center text-base font-medium text-white transition-all hover:border-white/25 hover:bg-white/10 sm:w-auto"
            >
              Получить консультацию
            </a>
          </div>

          <div class="flex items-center justify-center gap-3 pt-4 lg:justify-start">
            <div class="flex -space-x-2">
              <span
                class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-space-950 bg-slate-700 text-xs font-bold text-white"
              >Н</span>
              <span
                class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-space-950 bg-cyan-800 text-xs font-bold text-white"
              >А</span>
              <span
                class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-space-950 bg-indigo-800 text-xs font-bold text-white"
              >И</span>
            </div>
            <div class="text-left text-xs text-gray-400 sm:text-sm">
              <span class="font-bold text-white">4,9 из 5</span> — более 1 200 наблюдателей
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="border-y border-white/10 bg-space-900/50 py-10">
      <div class="mx-auto max-w-page px-4 sm:px-6 lg:px-12">
        <div class="grid grid-cols-2 gap-8 text-center sm:text-left lg:grid-cols-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="space-y-1 lg:border-r lg:border-white/10 lg:pr-4 lg:last:border-none"
          >
            <div class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{{ stat.value }}</div>
            <div class="text-sm text-gray-400">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Catalog -->
    <section id="catalog" class="mx-auto max-w-page px-4 py-section sm:px-6 lg:px-12">
      <div class="mb-10 flex flex-col justify-between gap-6 md:mb-12 md:flex-row md:items-end">
        <div>
          <span class="mb-2 block text-xs font-bold uppercase tracking-widest text-brand">Популярное</span>
          <h2 class="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Телескопы, с которых хочется начать
          </h2>
          <p class="mt-2 max-w-2xl text-sm text-gray-400 sm:text-base">
            Четыре понятных модели для разных задач — все проверены нашей оптической лабораторией.
          </p>
        </div>
        <router-link
          :to="{ name: 'catalog' }"
          class="group inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
        >
          Смотреть весь каталог
          <i class="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1"></i>
        </router-link>
      </div>

      <div v-if="loading" class="py-16 text-center text-gray-400">
        <i class="fa-solid fa-spinner fa-spin mr-2"></i>Загрузка каталога…
      </div>

      <div
        v-else-if="!products.length"
        class="rounded-panel border border-white/10 bg-white/5 px-6 py-8 text-center text-sm text-gray-400"
      >
        Каталог пуст. Добавьте товары в админ-панели или через импорт Excel.
      </div>

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>

      <!-- Рекламный плейсхолдер: баннер между блоками главной страницы -->
      <div class="mt-12">
        <AdSlot size="banner" />
      </div>
    </section>

    <!-- Scenarios -->
    <section id="scenarios" class="border-y border-white/5 bg-space-900/60 py-section">
      <div class="mx-auto max-w-page px-4 sm:px-6 lg:px-12">
        <div class="mb-10 md:mb-12">
          <span class="mb-2 block text-xs font-bold uppercase tracking-widest text-brand">Подбор по цели</span>
          <h2 class="text-2xl font-bold tracking-tight text-white sm:text-4xl">Что вы хотите увидеть первым?</h2>
          <p class="mt-2 text-sm text-gray-400 sm:text-base">
            Не нужно разбираться в формулах. Начните со сценария — мы покажем подходящую оптику.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div
            v-for="item in scenarios"
            :key="item.number"
            class="group relative flex h-96 flex-col justify-between overflow-hidden rounded-panel border border-white/10 bg-space-800/65 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-glow"
          >
            <img
              :src="item.image"
              :alt="item.title"
              class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-75 transition-all duration-700 group-hover:scale-110 group-hover:opacity-40"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/60 to-transparent"
            ></div>

            <span class="relative z-10 text-sm font-extrabold tracking-widest text-brand">{{ item.number }}</span>

            <div class="relative z-10 space-y-3">
              <h3 class="text-2xl font-bold text-white">{{ item.title }}</h3>
              <p class="text-xs leading-relaxed text-gray-300 sm:text-sm">{{ item.text }}</p>
              <router-link
                :to="{ name: 'selection' }"
                class="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-brand transition-colors hover:text-white"
              >
                Подобрать модель <i class="fa-solid fa-arrow-right text-xs"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About -->
    <section id="about" class="mx-auto max-w-page px-4 py-section sm:px-6 lg:px-12">
      <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div class="relative lg:col-span-6">
          <div class="relative overflow-hidden rounded-panel border border-white/10 bg-space-800/65 p-3 backdrop-blur-md">
            <img
              src="/img/master.png"
              alt="Эксперт проверяет оптику телескопа"
              class="h-[380px] w-full rounded-card object-cover sm:h-[480px]"
            />
            <div
              class="absolute bottom-6 right-6 max-w-xs rounded-panel border border-white/20 bg-space-950/80 p-5 shadow-2xl backdrop-blur-md"
            >
              <div class="text-2xl font-extrabold text-brand">7 лет</div>
              <div class="mt-1 text-xs text-gray-300">подбираем оптику без переплаты</div>
            </div>
          </div>
        </div>

        <div class="space-y-6 lg:col-span-6">
          <span class="block text-xs font-bold uppercase tracking-widest text-brand">О магазине</span>
          <h2 class="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Мы продаём не коробки.<br />
            <span class="text-brand">Мы открываем небо.</span>
          </h2>

          <p class="text-base leading-relaxed text-gray-300">
            «Орбиту» создали практикующие наблюдатели. Поэтому в каталоге нет случайных моделей: каждую
            мы собираем, проверяем на стенде и рекомендуем только под реальные условия.
          </p>

          <ul class="space-y-4 pt-2">
            <li
              v-for="item in [
                'Честно говорим, что будет видно из города',
                'Подбираем комплект без лишних аксессуаров',
                'Остаёмся на связи после первой ночи наблюдений',
              ]"
              :key="item"
              class="flex items-start gap-3"
            >
              <span
                class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand"
              >
                <i class="fa-solid fa-check text-xs"></i>
              </span>
              <span class="text-sm text-gray-300">{{ item }}</span>
            </li>
          </ul>

          <div class="flex flex-col gap-3 pt-4 sm:flex-row">
            <router-link
              :to="{ name: 'about' }"
              class="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/25 hover:bg-white/10"
            >
              Узнать нашу историю
              <i class="fa-solid fa-arrow-right text-xs"></i>
            </router-link>
            <router-link
              :to="{ name: 'services' }"
              class="inline-flex items-center justify-center gap-2 px-2 py-3.5 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
            >
              Услуги и тарифы
              <i class="fa-solid fa-arrow-right text-xs"></i>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Services -->
    <section id="services" class="border-t border-white/5 bg-space-900/40 py-section">
      <div class="mx-auto max-w-page px-4 sm:px-6 lg:px-12">
        <div class="mb-10 md:mb-12">
          <span class="mb-2 block text-xs font-bold uppercase tracking-widest text-brand">Сервис Орбиты</span>
          <h2 class="text-2xl font-bold tracking-tight text-white sm:text-4xl">Спокойный старт в астрономии</h2>
          <p class="mt-2 text-sm text-gray-400 sm:text-base">
            Всё необходимое, чтобы от покупки до первого наблюдения прошёл один вечер, а не несколько недель.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="service in services"
            :key="service.title"
            class="space-y-4 rounded-panel border border-white/10 bg-space-800/65 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-glow"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-xl text-brand"
            >
              <i class="fa-solid" :class="service.icon"></i>
            </div>
            <h3 class="text-lg font-bold text-white">{{ service.title }}</h3>
            <p class="text-xs leading-relaxed text-gray-400">{{ service.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Cosmic banner -->
    <section
      class="relative overflow-hidden border-y border-white/5 bg-[linear-gradient(to_right,rgba(3,7,18,0.92),rgba(3,7,18,0.6)),url('/img/back_12.png')] bg-cover bg-center py-24 light:bg-[linear-gradient(to_right,rgba(248,250,252,0.94),rgba(248,250,252,0.72)),url('/img/back_12.png')]"
    >
      <div class="relative z-10 mx-auto max-w-page px-4 sm:px-6 lg:px-12">
        <div class="max-w-2xl space-y-4">
          <span class="block text-xs font-bold uppercase tracking-widest text-brand">Стоит увидеть самому</span>
          <h2 class="text-3xl font-extrabold leading-tight text-white sm:text-5xl">Небо ближе, чем кажется.</h2>
          <p class="text-sm leading-relaxed text-gray-300 sm:text-base">
            Свет от Андромеды шёл к нам 2,5 миллиона лет. Сегодня вечером он может оказаться в вашем окуляре.
          </p>
        </div>
      </div>
    </section>

    <!-- Reviews -->
    <section id="reviews" class="mx-auto max-w-page px-4 py-section sm:px-6 lg:px-12">
      <div class="mb-10 flex flex-col justify-between gap-4 md:mb-12 md:flex-row md:items-end">
        <div>
          <span class="mb-2 block text-xs font-bold uppercase tracking-widest text-brand">Отзывы</span>
          <h2 class="text-2xl font-bold tracking-tight text-white sm:text-4xl">Первый свет запоминается</h2>
          <p class="mt-2 text-sm text-gray-400 sm:text-base">
            Истории людей, которые однажды просто решили посмотреть вверх.
          </p>
        </div>
        <div class="text-sm text-gray-400">
          <span class="font-bold text-white">4,9 / 5</span> · 1 200+ отзывов
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div
          v-for="review in reviews"
          :key="review.name"
          class="flex flex-col justify-between space-y-6 rounded-panel border border-white/10 bg-space-800/65 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-glow"
        >
          <div class="space-y-3">
            <div class="flex gap-1 text-sm text-amber-400">
              <i v-for="n in 5" :key="n" class="fa-solid fa-star"></i>
            </div>
            <p class="text-sm italic leading-relaxed text-gray-300">«{{ review.text }}»</p>
          </div>
          <div class="flex items-center gap-3 border-t border-white/10 pt-4">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
              :class="review.color"
            >
              {{ review.initials }}
            </div>
            <div>
              <div class="text-sm font-semibold text-white">{{ review.name }}</div>
              <div class="text-xs text-gray-500">{{ review.meta }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Consultation -->
    <section id="consultation" class="border-t border-white/5 bg-space-900/60 py-section">
      <div class="mx-auto max-w-page px-4 sm:px-6 lg:px-12">
        <div
          class="grid grid-cols-1 items-center gap-8 rounded-panel border border-white/10 bg-space-800/65 p-8 backdrop-blur-md sm:p-12 lg:grid-cols-12"
        >
          <div class="space-y-3 lg:col-span-7">
            <span class="block text-xs font-bold uppercase tracking-widest text-brand">Бесплатный подбор</span>
            <h2 class="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Не уверены в выборе? Спросите астронома.
            </h2>
            <p class="text-sm text-gray-400 sm:text-base">
              Расскажите, где и что хотите наблюдать. Ответим в течение 15 минут в рабочее время.
            </p>
          </div>

          <div class="lg:col-span-5">
            <div
              v-if="leadSent"
              class="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300"
            >
              Спасибо! Мы свяжемся с вами в ближайшее время.
            </div>
            <form v-else class="space-y-4" @submit.prevent="submitLead">
              <input
                v-model="leadName"
                :class="inputClass"
                placeholder="Ваше имя"
                aria-label="Ваше имя"
                autocomplete="name"
                required
              />
              <input
                v-model="leadContact"
                :class="inputClass"
                placeholder="Телефон или Telegram"
                aria-label="Телефон или Telegram"
                autocomplete="tel"
                required
              />
              <button
                type="submit"
                class="w-full rounded-xl bg-brand py-4 text-sm font-bold tracking-wide text-space-950 transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-glow-sm"
              >
                Получить рекомендацию
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="mx-auto max-w-page px-4 py-section sm:px-6 lg:px-12">
      <div class="grid gap-8 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <span class="mb-2 block text-xs font-bold uppercase tracking-widest text-brand">Вопросы</span>
          <h2 class="text-2xl font-bold tracking-tight text-white sm:text-4xl">Коротко о главном</h2>
          <p class="mt-3 text-sm leading-relaxed text-gray-400">
            Если ответа нет — напишите нам. Астроном-консультант отвечает в рабочее время
            в течение 15 минут.
          </p>
          <router-link
            :to="{ name: 'support', hash: '#faq' }"
            class="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand transition-colors hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Ещё вопросы в поддержке
            <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </router-link>
        </div>

        <div class="space-y-3 lg:col-span-8">
          <details
            v-for="(faq, index) in faqs"
            :key="faq.question"
            class="group overflow-hidden rounded-card border border-white/10 bg-space-800/60 backdrop-blur-md transition-colors duration-200 hover:border-brand/25"
            :open="index === 0"
          >
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-white transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
            >
              <span>{{ faq.question }}</span>
              <i
                class="fa-solid fa-chevron-down shrink-0 text-xs text-gray-500 transition-transform duration-300 group-open:rotate-180"
              ></i>
            </summary>
            <p class="border-t border-white/5 px-5 py-4 text-sm leading-relaxed text-gray-400">
              {{ faq.answer }}
            </p>
          </details>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section
      class="stars-bg relative overflow-hidden border-t border-white/5 bg-[linear-gradient(to_right,rgba(3,7,18,0.95),rgba(3,7,18,0.7),transparent),url('/img/back_13.png')] bg-cover bg-center bg-no-repeat py-24 light:bg-[linear-gradient(to_right,rgba(248,250,252,0.96),rgba(248,250,252,0.82),rgba(248,250,252,0.35)),url('/img/back_13.png')]"
    >
      <div
        class="relative z-10 mx-auto flex max-w-page flex-col items-center justify-between gap-8 px-4 text-center sm:px-6 lg:flex-row lg:px-12 lg:text-left"
      >
        <div class="max-w-2xl space-y-3">
          <h2 class="text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            Сегодня — просто небо.<br />
            Завтра — ваша первая галактика.
          </h2>
          <p class="text-sm text-gray-400 sm:text-base">Начните с модели, которая подходит именно вам.</p>
        </div>
        <router-link
          :to="{ name: 'catalog' }"
          class="inline-flex shrink-0 items-center gap-3 rounded-full bg-brand px-8 py-4 text-base font-semibold text-space-950 transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-glow-sm"
        >
          Перейти в каталог
          <i class="fa-solid fa-arrow-right text-sm"></i>
        </router-link>
      </div>
    </section>
  </div>
</template>
