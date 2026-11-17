<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import http from '@/api/http'
import { formatDate } from '@/utils/format'
import ProductFormModal from '@/components/ProductFormModal.vue'
import PriceTag from '@/components/PriceTag.vue'
import AdminShell from '@/components/admin/AdminShell.vue'

const products = ref([])
const categories = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(false)
const alert = ref(null)
const showModal = ref(false)
const editing = ref(null)

const filters = reactive({
  q: '',
  date: '',
  from: '',
  to: '',
  per_page: 10,
  page: 1,
})

const hasPeriod = computed(() => Boolean(filters.from || filters.to))

const inputClass =
  'w-full rounded-xl border border-white/15 bg-space-950/80 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20'
const labelClass = 'mb-1.5 block text-xs font-medium text-gray-400'

async function loadCategories() {
  const { data } = await http.get('/categories')
  categories.value = data
}

async function loadProducts() {
  loading.value = true
  try {
    const { data } = await http.get('/products', { params: filters })
    products.value = data.data
    meta.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      total: data.total,
    }
  } catch (error) {
    alert.value = { type: 'danger', text: 'Не удалось загрузить товары.' }
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  filters.page = 1
  loadProducts()
}

function resetFilters() {
  filters.q = ''
  filters.date = ''
  filters.from = ''
  filters.to = ''
  filters.page = 1
  loadProducts()
}

function goToPage(page) {
  if (page < 1 || page > meta.value.last_page) {
    return
  }

  filters.page = page
  loadProducts()
}

function openCreate() {
  editing.value = null
  showModal.value = true
}

function openEdit(product) {
  editing.value = product
  showModal.value = true
}

async function handleSaved() {
  showModal.value = false
  alert.value = { type: 'success', text: 'Сохранено.' }
  await loadProducts()
}

async function removeProduct(product) {
  if (!window.confirm(`Удалить «${product.name}»?`)) {
    return
  }

  try {
    await http.delete(`/products/${product.id}`)
    alert.value = { type: 'success', text: 'Товар удалён.' }
    await loadProducts()
  } catch (error) {
    alert.value = { type: 'danger', text: 'Не удалось удалить товар.' }
  }
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<template>
  <AdminShell title="Товары">
    <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <p class="max-w-2xl text-sm text-gray-400">
        Каталог магазина: наличие, цены и характеристики моделей.
      </p>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-space-950 transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-glow-sm"
        @click="openCreate"
      >
        <i class="fa-solid fa-plus mr-1"></i> Добавить товар
      </button>
    </div>

    <div
      v-if="alert"
      class="mb-6 rounded-xl border px-4 py-3 text-sm"
      :class="
        alert.type === 'danger'
          ? 'border-red-400/30 bg-red-500/10 text-red-300'
          : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
      "
    >
      {{ alert.text }}
    </div>

    <form
      class="mb-8 rounded-panel border border-white/10 bg-space-800/65 p-5 backdrop-blur-md"
      @submit.prevent="applyFilters"
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
        <div class="lg:col-span-3">
          <label for="products-q" :class="labelClass">Поиск</label>
          <input id="products-q" v-model="filters.q" :class="inputClass" placeholder="Название" />
        </div>
        <div class="lg:col-span-2">
          <label for="products-date" :class="labelClass">Дата добавления</label>
          <input id="products-date" v-model="filters.date" type="date" :class="inputClass" />
        </div>
        <div class="lg:col-span-2">
          <label for="products-from" :class="labelClass">Период с</label>
          <input id="products-from" v-model="filters.from" type="date" :class="inputClass" />
        </div>
        <div class="lg:col-span-2">
          <label for="products-to" :class="labelClass">по</label>
          <input id="products-to" v-model="filters.to" type="date" :class="inputClass" />
        </div>
        <div class="lg:col-span-1">
          <label for="products-per-page" :class="labelClass">Строк</label>
          <select id="products-per-page" v-model.number="filters.per_page" :class="inputClass">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>
        <div class="lg:col-span-2">
          <button
            type="submit"
            class="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-space-950 transition-all hover:bg-brand-hover"
          >
            <i class="fa-solid fa-filter mr-1"></i> Фильтр
          </button>
          <button
            type="button"
            class="mt-1 w-full rounded-xl px-4 py-1.5 text-xs text-gray-400 transition-colors hover:text-white"
            @click="resetFilters"
          >
            Сбросить
          </button>
        </div>
      </div>
      <p v-if="hasPeriod" class="mt-3 text-xs text-gray-500">
        Выбран период: {{ filters.from || '—' }} … {{ filters.to || '—' }}
      </p>
    </form>

    <div class="overflow-hidden rounded-panel border border-white/10 bg-space-800/65 backdrop-blur-md">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead class="border-b border-white/10 text-[11px] uppercase tracking-wider text-gray-400">
            <tr>
              <th class="px-4 py-3 font-semibold">ID</th>
              <th class="px-4 py-3 font-semibold">Название</th>
              <th class="px-4 py-3 font-semibold">Категория</th>
              <th class="px-4 py-3 font-semibold">Оптика</th>
              <th class="px-4 py-3 text-right font-semibold">Цена</th>
              <th class="px-4 py-3 text-right font-semibold">Кол-во</th>
              <th class="px-4 py-3 font-semibold">Добавлен</th>
              <th class="px-4 py-3 text-right font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-if="loading">
              <td colspan="8" class="px-4 py-10 text-center text-gray-400">
                <i class="fa-solid fa-spinner fa-spin mr-2"></i>Загрузка…
              </td>
            </tr>
            <tr v-else-if="!products.length">
              <td colspan="8" class="px-4 py-10 text-center text-gray-400">Товары не найдены.</td>
            </tr>
            <tr
              v-for="product in products"
              :key="product.id"
              class="transition-colors hover:bg-brand/5"
            >
              <td class="px-4 py-3 text-gray-500">{{ product.id }}</td>
              <td class="px-4 py-3 font-medium text-white">{{ product.name }}</td>
              <td class="px-4 py-3 text-gray-400">{{ product.category?.name || '—' }}</td>
              <td class="px-4 py-3 text-xs text-gray-400">
                {{ [product.type, product.aperture_mm && `${product.aperture_mm}/${product.focal_mm} мм`, product.mount]
                  .filter(Boolean)
                  .join(' · ') || '—' }}
              </td>
              <td class="px-4 py-3 text-right text-white"><PriceTag :value="product.price" /></td>
              <td class="px-4 py-3 text-right">
                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="
                    product.stock > 0
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-red-500/15 text-red-300'
                  "
                >
                  {{ product.stock }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-400">{{ formatDate(product.created_at) }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-right">
                <button
                  type="button"
                  class="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand/30 text-brand transition-colors hover:bg-brand/10"
                  aria-label="Редактировать"
                  @click="openEdit(product)"
                >
                  <i class="fa-solid fa-pen text-xs"></i>
                </button>
                <button
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/30 text-red-300 transition-colors hover:bg-red-500/10"
                  aria-label="Удалить"
                  @click="removeProduct(product)"
                >
                  <i class="fa-solid fa-trash text-xs"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div class="text-sm text-gray-400">
        Всего: {{ meta.total }} · страница {{ meta.current_page }} из {{ meta.last_page }}
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          :disabled="meta.current_page <= 1"
          class="rounded-lg border border-white/15 px-4 py-2 text-sm text-brand transition-colors enabled:hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-40"
          @click="goToPage(meta.current_page - 1)"
        >
          Назад
        </button>
        <button
          type="button"
          :disabled="meta.current_page >= meta.last_page"
          class="rounded-lg border border-white/15 px-4 py-2 text-sm text-brand transition-colors enabled:hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-40"
          @click="goToPage(meta.current_page + 1)"
        >
          Вперёд
        </button>
      </div>
    </div>

    <ProductFormModal
      v-if="showModal"
      :product="editing"
      :categories="categories"
      @close="showModal = false"
      @saved="handleSaved"
    />
  </AdminShell>
</template>
