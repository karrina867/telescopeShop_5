import axios from 'axios'
import { demoCategories, demoProducts } from '@/data/demoCatalog'

// Демо-режим включается только в production-сборке без адреса реального API.
// Локальная разработка (`npm run dev`) всегда ходит в Laravel через прокси Vite.
export const isDemoMode = import.meta.env.PROD && !import.meta.env.VITE_API_URL

const SORTABLE_FIELDS = ['id', 'name', 'price', 'stock', 'created_at']

function ok(config, data) {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config,
    request: {},
  }
}

function unavailable(config, message) {
  const response = {
    data: { message },
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'content-type': 'application/json' },
    config,
    request: {},
  }

  return Promise.reject(new axios.AxiosError(message, 'ERR_DEMO_UNAVAILABLE', config, null, response))
}

function compare(a, b, field) {
  if (field === 'name') {
    return a.name.localeCompare(b.name, 'ru')
  }

  if (field === 'created_at') {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  }

  return Number(a[field] || 0) - Number(b[field] || 0)
}

function paginate(rows, params) {
  const perPage = Math.min(100, Math.max(1, Number(params.per_page) || 10))
  const total = rows.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const currentPage = Math.min(lastPage, Math.max(1, Number(params.page) || 1))
  const from = total === 0 ? null : (currentPage - 1) * perPage + 1
  const to = total === 0 ? null : Math.min(total, currentPage * perPage)

  return {
    data: rows.slice((currentPage - 1) * perPage, currentPage * perPage),
    current_page: currentPage,
    last_page: lastPage,
    per_page: perPage,
    total,
    from,
    to,
  }
}

function filteredProducts(params = {}) {
  let rows = [...demoProducts]

  const query = String(params.q ?? '').trim().toLowerCase()

  if (query) {
    rows = rows.filter((product) => product.name.toLowerCase().includes(query))
  }

  if (params.category_id !== undefined && params.category_id !== '') {
    rows = rows.filter((product) => product.category_id === Number(params.category_id))
  }

  if (params.type) {
    rows = rows.filter((product) => product.type === params.type)
  }

  if (params.min_price !== undefined && params.min_price !== '') {
    rows = rows.filter((product) => Number(product.price) >= Number(params.min_price))
  }

  if (params.max_price !== undefined && params.max_price !== '') {
    rows = rows.filter((product) => Number(product.price) <= Number(params.max_price))
  }

  if (params.in_stock) {
    rows = rows.filter((product) => Number(product.stock) > 0)
  }

  const field = SORTABLE_FIELDS.includes(params.sort) ? params.sort : 'created_at'
  const direction = params.direction === 'asc' ? 1 : -1

  rows.sort((a, b) => compare(a, b, field) * direction)

  return rows
}

function productMeta() {
  const types = [...new Set(demoProducts.map((product) => product.type))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  )
  const mounts = [...new Set(demoProducts.map((product) => product.mount))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  )
  const prices = demoProducts.map((product) => Number(product.price))

  return {
    types,
    mounts,
    price_min: Math.min(...prices),
    price_max: Math.max(...prices),
  }
}

// Адаптер axios: повторяет ответы Laravel для витрины и возвращает 503
// для всего, что требует backend (авторизация, админка, импорт).
export function demoAdapter(config) {
  const method = String(config.method || 'get').toLowerCase()
  const path = String(config.url || '').split('?')[0]
  const params = config.params || {}

  if (method !== 'get') {
    return unavailable(
      config,
      'Демо-версия опубликована как статический сайт: изменения и авторизация доступны только локально.',
    )
  }

  if (path === '/categories') {
    const rows = [...demoCategories].sort((a, b) => a.name.localeCompare(b.name, 'ru'))

    return Promise.resolve(ok(config, rows))
  }

  if (path === '/products/meta') {
    return Promise.resolve(ok(config, productMeta()))
  }

  if (path === '/products') {
    return Promise.resolve(ok(config, paginate(filteredProducts(params), params)))
  }

  const productMatch = path.match(/^\/products\/(\d+)$/)

  if (productMatch) {
    const product = demoProducts.find((item) => item.id === Number(productMatch[1]))

    if (product) {
      return Promise.resolve(ok(config, product))
    }

    return unavailable(config, 'Товар не найден в демо-каталоге.')
  }

  return unavailable(
    config,
    'Демо-версия опубликована как статический сайт: этот раздел доступен только локально.',
  )
}
