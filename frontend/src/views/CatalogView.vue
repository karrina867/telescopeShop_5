<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import http from '@/api/http'
import ProductCard from '@/components/ProductCard.vue'
import { formatAmount } from '@/utils/format'

const products = ref([])
const categories = ref([])
const types = ref([])
const loading = ref(false)
const failed = ref(false)
const filtersOpen = ref(false)

const sortOptions = [
  { value: 'new', label: 'Сначала новые' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'name', label: 'По названию' },
]

const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const range = ref({ min: 1000, max: 12000 })

const filters = reactive({
  q: '',
  category_id: '',
  type: '',
  min_price: 1000,
  max_price: 12000,
  in_stock: false,
  sort: 'new',
  per_page: 9,
  page: 1,
})

let searchTimer = null

function requestParams() {
  const sortMap = {
    new: ['created_at', 'desc'],
    'price-asc': ['price', 'asc'],
    'price-desc': ['price', 'desc'],
    name: ['name', 'asc'],
  }
  const [sort, direction] = sortMap[filters.sort] ?? sortMap.new

  return {
    q: filters.q.trim() || undefined,
    category_id: filters.category_id || undefined,
    type: filters.type || undefined,
    min_price: filters.min_price > range.value.min ? filters.min_price : undefined,
    max_price: filters.max_price < range.value.max ? filters.max_price : undefined,
    in_stock: filters.in_stock ? 1 : undefined,
    sort,
    direction,
    per_page: filters.per_page,
    page: filters.page,
  }
}

async function loadProducts() {
  loading.value = true
  failed.value = false

  try {
    const { data } = await http.get('/products', { params: requestParams() })
    products.value = data.data
    meta.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      total: data.total,
    }
  } catch (error) {
    products.value = []
    failed.value = true
  } finally {
    loading.value = false
  }
}

async function loadMeta() {
  try {
    const [categoriesResponse, metaResponse] = await Promise.all([
      http.get('/categories'),
      http.get('/products/meta'),
    ])

    categories.value = categoriesResponse.data
    types.value = metaResponse.data.types ?? []

    if (metaResponse.data.price_max) {
      range.value = {
        min: Math.floor((metaResponse.data.price_min || 0) / 100) * 100,
        max: Math.ceil((metaResponse.data.price_max || 0) / 100) * 100,
      }
      filters.min_price = range.value.min
      filters.max_price = range.value.max
    }
  } catch (error) {
    categories.value = []
    types.value = []
  }
}

function applyFilters() {
  filters.page = 1
  loadProducts()
}

function goToPage(page) {
  if (page < 1 || page > meta.value.last_page || page === meta.value.current_page) {
    return
  }

  filters.page = page
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function chooseCategory(id) {
  filters.category_id = filters.category_id === id ? '' : id
  applyFilters()
}

function toggleType(type) {
  filters.type = filters.type === type ? '' : type
  applyFilters()
}

function resetFilters() {
  filters.q = ''
  filters.category_id = ''
  filters.type = ''
  filters.min_price = range.value.min
  filters.max_price = range.value.max
  filters.in_stock = false
  filters.sort = 'new'
  applyFilters()
}

const categoryName = computed(
  () => categories.value.find((category) => category.id === filters.category_id)?.name || '',
)

const activeChips = computed(() => {
  const chips = []

  if (filters.q.trim()) {
    chips.push({ key: 'q', label: `«${filters.q.trim()}»`, reset: () => (filters.q = '') })
  }
  if (filters.category_id) {
    chips.push({ key: 'category', label: categoryName.value, reset: () => (filters.category_id = '') })
  }
  if (filters.type) {
    chips.push({ key: 'type', label: filters.type, reset: () => (filters.type = '') })
  }
  if (filters.in_stock) {
    chips.push({ key: 'stock', label: 'Только в наличии', reset: () => (filters.in_stock = false) })
  }
  if (filters.min_price > range.value.min || filters.max_price < range.value.max) {
    chips.push({
      key: 'price',
      label: `Цена ${formatAmount(filters.min_price)}–${formatAmount(filters.max_price)}`,
      reset: () => {
        filters.min_price = range.value.min
        filters.max_price = range.value.max
      },
    })
  }

  return chips
})

const hasFilters = computed(() => activeChips.value.length > 0)

const visiblePages = computed(() => {
  const last = meta.value.last_page
  const current = meta.value.current_page

  if (last <= 7) {
    return Array.from({ length: last }, (_, index) => index + 1)
  }

  return [...new Set([1, last, current - 1, current, current + 1])]
    .filter((page) => page >= 1 && page <= last)
    .sort((a, b) => a - b)
})

function removeChip(chip) {
  chip.reset()
  applyFilters()
}

function onSearchInput() {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(applyFilters, 350)
}

function onPriceChange() {
  if (filters.min_price > filters.max_price) {
    ;[filters.min_price, filters.max_price] = [filters.max_price, filters.min_price]
  }

  applyFilters()
}

watch(
  () => filters.in_stock,
  applyFilters,
)

watch(
  () => filters.sort,
  applyFilters,
)

onMounted(async () => {
  await loadMeta()
  loadProducts()
})
</script>

<template>
  <div class="page-shell">
    <header class="mb-8">
      <span class="eyebrow">Каталог</span>
      <h1 class="page-title">Телескопы для любого неба</h1>
      <p class="page-lead">
        Фильтруйте по категории, типу оптики и цене. Каждая модель проверена нашей оптической
        лабораторией.
      </p>
    </header>

    <div class="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <!-- Панель фильтров: на мобильном — выдвижной ящик, на десктопе — колонка -->
      <div
        v-if="filtersOpen"
        class="fixed inset-0 z-30 bg-space-950/70 backdrop-blur-sm lg:hidden"
        aria-hidden="true"
        @click="filtersOpen = false"
      ></div>

      <aside
        id="catalog-filters"
        class="fixed bottom-0 right-0 top-0 z-40 w-80 max-w-[90vw] overflow-y-auto border-l border-white/10 bg-space-900 p-5 transition-transform duration-300 ease-out scrollbar-thin lg:static lg:z-0 lg:h-fit lg:w-auto lg:translate-x-0 lg:overflow-visible lg:rounded-panel lg:border lg:border-white/10 lg:bg-space-800/65 lg:p-5 lg:backdrop-blur-md"
        :class="filtersOpen ? 'translate-x-0' : 'translate-x-full'"
        aria-label="Фильтры каталога"
      >
        <div class="mb-5 flex items-center justify-between gap-2">
          <h2 class="text-sm font-bold text-white">Фильтры</h2>
          <button
            type="button"
            class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
            aria-label="Закрыть фильтры"
            @click="filtersOpen = false"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <div class="space-y-5">
          <div>
            <p class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500" id="filter-category">Категория</p>
            <div class="space-y-1" role="group" aria-labelledby="filter-category">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                :class="!filters.category_id ? 'bg-brand/10 font-semibold text-brand' : 'text-gray-400 hover:bg-white/5 hover:text-white'"
                :aria-pressed="!filters.category_id"
                @click="chooseCategory('')"
              >
                Все категории
                <i v-if="!filters.category_id" class="fa-solid fa-check text-[10px]" aria-hidden="true"></i>
              </button>
              <button
                v-for="category in categories"
                :key="category.id"
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                :class="filters.category_id === category.id ? 'bg-brand/10 font-semibold text-brand' : 'text-gray-400 hover:bg-white/5 hover:text-white'"
                :aria-pressed="filters.category_id === category.id"
                @click="chooseCategory(category.id)"
              >
                {{ category.name }}
                <i v-if="filters.category_id === category.id" class="fa-solid fa-check text-[10px]" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500" id="filter-type">Тип оптики</p>
            <div class="flex flex-wrap gap-1.5" role="group" aria-labelledby="filter-type">
              <button
                v-for="type in types"
                :key="type"
                type="button"
                class="chip transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                :class="filters.type === type ? 'border-brand/40 bg-brand/10 text-brand' : 'hover:border-brand/30'"
                :aria-pressed="filters.type === type"
                @click="toggleType(type)"
              >
                {{ type }}
              </button>
            </div>
          </div>

          <div>
            <div class="mb-2 flex items-center justify-between gap-2">
              <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Цена</p>
              <output class="text-[11px] font-semibold text-white">
                {{ formatAmount(filters.min_price) }} – {{ formatAmount(filters.max_price) }}
              </output>
            </div>
            <label for="price-min" class="mb-1 block text-[11px] text-gray-500">
              Минимум: {{ formatAmount(filters.min_price) }}
            </label>
            <input
              id="price-min"
              v-model.number="filters.min_price"
              type="range"
              :min="range.min"
              :max="range.max"
              step="100"
              class="range-input"
              @change="onPriceChange"
            />
            <label for="price-max" class="mb-1 mt-3 block text-[11px] text-gray-500">
              Максимум: {{ formatAmount(filters.max_price) }}
            </label>
            <input
              id="price-max"
              v-model.number="filters.max_price"
              type="range"
              :min="range.min"
              :max="range.max"
              step="100"
              class="range-input"
              @change="onPriceChange"
            />
          </div>

          <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-gray-300 transition-colors hover:border-brand/30">
            <input
              v-model="filters.in_stock"
              type="checkbox"
              class="h-4 w-4 rounded border-white/20 bg-space-950 text-brand focus:ring-2 focus:ring-brand/30"
            />
            Только в наличии
          </label>

          <button type="button" class="btn-secondary btn-sm w-full" :disabled="!hasFilters" @click="resetFilters">
            Сбросить фильтры
          </button>
        </div>
      </aside>

      <!-- Результаты -->
      <div class="min-w-0">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="relative flex-1 sm:max-w-sm">
            <label for="catalog-search" class="sr-only">Поиск по названию</label>
            <i
              class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
              aria-hidden="true"
            ></i>
            <input
              id="catalog-search"
              v-model="filters.q"
              type="search"
              placeholder="Например, Luna"
              class="field-input py-2.5 pl-9 text-sm"
              @input="onSearchInput"
            />
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-secondary btn-sm lg:hidden"
              aria-controls="catalog-filters"
              :aria-expanded="filtersOpen"
              @click="filtersOpen = true"
            >
              <i class="fa-solid fa-sliders text-xs" aria-hidden="true"></i>
              Фильтры
              <span v-if="activeChips.length" class="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-space-950">
                {{ activeChips.length }}
              </span>
            </button>

            <label for="catalog-sort" class="sr-only">Сортировка</label>
            <select id="catalog-sort" v-model="filters.sort" class="field-input w-auto py-2 text-xs">
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="mb-4 flex flex-wrap items-center gap-2">
          <p class="text-xs text-gray-500">
            Товаров: <span class="font-semibold text-white">{{ meta.total }}</span>
          </p>
          <button
            v-for="chip in activeChips"
            :key="chip.key"
            type="button"
            class="chip gap-1.5 transition-colors hover:border-brand/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            :aria-label="`Убрать фильтр: ${chip.label}`"
            @click="removeChip(chip)"
          >
            {{ chip.label }}
            <i class="fa-solid fa-xmark text-[10px]" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Загрузка -->
        <div v-if="loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Загрузка товаров">
          <div v-for="n in 6" :key="n" class="rounded-panel border border-white/10 bg-space-800/50 p-5">
            <div class="skeleton h-56 w-full"></div>
            <div class="skeleton mt-5 h-4 w-4/5"></div>
            <div class="skeleton mt-2 h-3 w-1/2"></div>
            <div class="skeleton mt-4 h-3 w-1/3"></div>
            <div class="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-4">
              <div class="skeleton h-6 w-24"></div>
              <div class="skeleton h-11 w-11 rounded-full"></div>
            </div>
          </div>
        </div>

        <!-- Ошибка сети -->
        <div v-else-if="failed" class="rounded-panel border border-dashed border-danger/30 bg-danger/5 px-6 py-14 text-center">
          <i class="fa-solid fa-plug-circle-xmark text-3xl text-danger" aria-hidden="true"></i>
          <h2 class="mt-3 text-sm font-bold text-white">Каталог временно недоступен</h2>
          <p class="mt-1 text-xs text-gray-500">Проверьте подключение к API и попробуйте снова.</p>
          <button type="button" class="btn-secondary btn-sm mt-4" @click="loadProducts">Повторить</button>
        </div>

        <!-- Пусто -->
        <div v-else-if="!products.length" class="rounded-panel border border-dashed border-white/15 px-6 py-14 text-center">
          <i class="fa-solid fa-box-open text-3xl text-gray-600" aria-hidden="true"></i>
          <h2 class="mt-3 text-sm font-bold text-white">Под фильтры ничего не подошло</h2>
          <p class="mt-1 text-xs text-gray-500">Попробуйте расширить диапазон цены или убрать часть фильтров.</p>
          <button type="button" class="btn-secondary btn-sm mt-4" @click="resetFilters">Сбросить фильтры</button>
        </div>

        <!-- Сетка -->
        <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>

        <!-- Пагинация -->
        <nav v-if="!loading && meta.last_page > 1" class="mt-8 flex items-center justify-center gap-1" aria-label="Пагинация каталога">
          <button
            type="button"
            class="btn-secondary btn-sm"
            :disabled="meta.current_page === 1"
            aria-label="Предыдущая страница"
            @click="goToPage(meta.current_page - 1)"
          >
            <i class="fa-solid fa-chevron-left text-[10px]" aria-hidden="true"></i>
          </button>

          <template v-for="(page, index) in visiblePages" :key="page">
            <span v-if="index > 0 && page - visiblePages[index - 1] > 1" class="px-1 text-xs text-gray-500">…</span>
            <button
              type="button"
              class="grid h-8 min-w-8 place-items-center rounded-lg px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              :class="page === meta.current_page ? 'bg-brand text-space-950' : 'border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'"
              :aria-current="page === meta.current_page ? 'page' : undefined"
              :aria-label="`Страница ${page}`"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </template>

          <button
            type="button"
            class="btn-secondary btn-sm"
            :disabled="meta.current_page === meta.last_page"
            aria-label="Следующая страница"
            @click="goToPage(meta.current_page + 1)"
          >
            <i class="fa-solid fa-chevron-right text-[10px]" aria-hidden="true"></i>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
