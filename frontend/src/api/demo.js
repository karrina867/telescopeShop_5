import axios from 'axios'
import { demoCategories as seedCategories, demoProducts as seedProducts } from '@/data/demoCatalog'

// Демо-режим включается только в production-сборке без адреса реального API.
// Локальная разработка (`npm run dev`) всегда ходит в Laravel через прокси Vite.
export const isDemoMode = import.meta.env.PROD && !import.meta.env.VITE_API_URL

const STORAGE_KEY = 'orbita-demo-db'
const DEMO_TOKEN = 'demo-admin-token'
const SORTABLE_FIELDS = ['id', 'name', 'price', 'stock', 'created_at']

const DEMO_ADMIN = {
  id: 1,
  name: 'Administrator',
  email: 'admin@orbita.by',
  role: { id: 1, name: 'admin' },
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.products) || !Array.isArray(parsed.categories)) {
      return null
    }
    return parsed
  } catch (error) {
    return null
  }
}

function seedDb() {
  const db = {
    categories: clone(seedCategories),
    products: clone(seedProducts),
    nextProductId: Math.max(0, ...seedProducts.map((p) => Number(p.id) || 0)) + 1,
    nextCategoryId: Math.max(0, ...seedCategories.map((c) => Number(c.id) || 0)) + 1,
  }
  saveDb(db)
  return db
}

function getDb() {
  return loadDb() || seedDb()
}

function saveDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (error) {
    // localStorage может быть недоступен или переполнен — демо продолжит работать в памяти запроса.
  }
}

function ok(config, data, status = 200) {
  return Promise.resolve({
    data,
    status,
    statusText: status === 201 ? 'Created' : status === 204 ? 'No Content' : 'OK',
    headers: { 'content-type': 'application/json' },
    config,
    request: {},
  })
}

function fail(config, status, data) {
  const response = {
    data,
    status,
    statusText: status === 401 ? 'Unauthorized' : status === 404 ? 'Not Found' : status === 422 ? 'Unprocessable Content' : 'Error',
    headers: { 'content-type': 'application/json' },
    config,
    request: {},
  }
  return Promise.reject(new axios.AxiosError(data?.message || 'Demo error', `ERR_DEMO_${status}`, config, null, response))
}

function unauthorized(config) {
  return fail(config, 401, { message: 'Unauthenticated.' })
}

function getAuthToken(config) {
  const header = config.headers?.Authorization || config.headers?.authorization || ''
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7)
  }
  return null
}

function isAdminRequest(config) {
  return getAuthToken(config) === DEMO_TOKEN
}

function parseBody(config) {
  const data = config.data
  if (data === undefined || data === null || data === '') return {}

  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const obj = {}
    for (const [key, value] of data.entries()) {
      if (value instanceof File) {
        obj[key] = value
      } else if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const existing = obj[key]
        obj[key] = Array.isArray(existing) ? [...existing, value] : [existing, value]
      } else {
        obj[key] = value
      }
    }
    return obj
  }

  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch (error) {
      return {}
    }
  }

  if (typeof data === 'object') {
    return { ...data }
  }

  return {}
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    if (!(typeof File !== 'undefined' && file instanceof File)) {
      resolve(null)
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

function normalizeId(value) {
  const num = Number(value)
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : null
}

function normalizeNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function normalizeInt(value) {
  const num = normalizeNumber(value)
  if (num === null) return null
  return Math.max(0, Math.floor(num))
}

function categoryById(db, id) {
  const cid = normalizeId(id)
  if (!cid) return null
  return db.categories.find((c) => c.id === cid) || null
}

function attachCategory(db, product) {
  const category = categoryById(db, product.category_id)
  return {
    ...product,
    category: category ? { ...category } : null,
  }
}

function compare(a, b, field) {
  if (field === 'name') {
    return String(a.name || '').localeCompare(String(b.name || ''), 'ru')
  }
  if (field === 'created_at') {
    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
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

function filteredProducts(db, params = {}) {
  let rows = db.products.map((product) => attachCategory(db, product))

  const query = String(params.q ?? '').trim().toLowerCase()
  if (query) {
    rows = rows.filter((product) => String(product.name || '').toLowerCase().includes(query))
  }

  if (params.category_id !== undefined && params.category_id !== '') {
    rows = rows.filter((product) => Number(product.category_id) === Number(params.category_id))
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

  if (params.in_stock === true || params.in_stock === 'true' || params.in_stock === 1 || params.in_stock === '1') {
    rows = rows.filter((product) => Number(product.stock) > 0)
  }

  if (params.date) {
    rows = rows.filter((product) => String(product.created_at || '').slice(0, 10) === String(params.date))
  }

  if (params.from) {
    rows = rows.filter((product) => String(product.created_at || '').slice(0, 10) >= String(params.from))
  }

  if (params.to) {
    rows = rows.filter((product) => String(product.created_at || '').slice(0, 10) <= String(params.to))
  }

  const field = SORTABLE_FIELDS.includes(params.sort) ? params.sort : 'created_at'
  const direction = params.direction === 'asc' ? 1 : -1
  rows.sort((a, b) => compare(a, b, field) * direction)

  return rows
}

function productMeta(db) {
  const types = [...new Set(db.products.map((p) => p.type).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru'))
  const mounts = [...new Set(db.products.map((p) => p.mount).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru'))
  const prices = db.products.map((p) => Number(p.price) || 0)

  return {
    types,
    mounts,
    price_min: prices.length ? Math.min(...prices) : 0,
    price_max: prices.length ? Math.max(...prices) : 0,
  }
}

function slugify(text) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  }
  return String(text || '')
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'category'
}

function ensureCategory(db, name) {
  const clean = String(name || '').trim()
  if (!clean) return null
  const existing = db.categories.find((c) => c.name.toLowerCase() === clean.toLowerCase())
  if (existing) return existing
  const category = { id: db.nextCategoryId++, name: clean, slug: slugify(clean) }
  db.categories.push(category)
  return category
}

function validateProductInput(body) {
  const errors = {}
  const name = String(body.name ?? '').trim()
  const price = normalizeNumber(body.price)
  const stock = normalizeInt(body.stock)

  if (!name) errors.name = ['Название обязательно.']
  if (price === null || price < 0) errors.price = ['Цена должна быть числом не меньше 0.']
  if (stock === null) errors.stock = ['Количество должно быть целым числом не меньше 0.']

  return { errors, name, price, stock }
}

async function buildProductPayload(db, body, existing = null) {
  const { errors, name, price, stock } = validateProductInput(body)
  if (Object.keys(errors).length) {
    return { errors }
  }

  const categoryId = normalizeId(body.category_id)
  const category = categoryId ? categoryById(db, categoryId) : null

  let image = existing?.image ?? null
  if (body.remove_image === true || body.remove_image === '1' || body.remove_image === 'true') {
    image = null
  }
  if (body.image instanceof File) {
    image = await readFileAsDataUrl(body.image)
  } else if (typeof body.image === 'string' && body.image.trim()) {
    image = body.image.trim()
  }

  const now = new Date().toISOString()
  const product = {
    ...(existing || {}),
    name,
    category_id: category ? category.id : null,
    type: String(body.type ?? '').trim() || null,
    aperture_mm: normalizeInt(body.aperture_mm),
    focal_mm: normalizeInt(body.focal_mm),
    mount: String(body.mount ?? '').trim() || null,
    max_magnification: normalizeInt(body.max_magnification),
    price,
    stock,
    description: String(body.description ?? '').trim() || null,
    image,
    updated_at: now,
    created_at: existing?.created_at || now,
  }

  if (product.image && String(product.image).startsWith('data:')) {
    product.image_url = product.image
  } else {
    product.image_url = product.image || null
  }

  return { product }
}

async function handleImport(config, body) {
  if (!isAdminRequest(config)) return unauthorized(config)

  const rows = Array.isArray(body.rows) ? body.rows : []
  if (!rows.length) {
    return fail(config, 422, { message: 'Нет строк для импорта.', errors: { rows: ['Добавьте хотя бы одну строку.'] } })
  }

  const db = getDb()
  let created = 0
  let updated = 0
  const now = new Date().toISOString()

  for (const row of rows) {
    const name = String(row?.name ?? '').trim()
    const price = normalizeNumber(row?.price)
    const stock = normalizeInt(row?.stock)
    if (!name || price === null || price < 0 || stock === null) continue

    const category = ensureCategory(db, row?.category)
    const existing = db.products.find((p) => String(p.name).toLowerCase() === name.toLowerCase())

    const payload = {
      category_id: category?.id || existing?.category_id || null,
      type: String(row?.type ?? '').trim() || null,
      aperture_mm: normalizeInt(row?.aperture_mm),
      focal_mm: normalizeInt(row?.focal_mm),
      mount: String(row?.mount ?? '').trim() || null,
      max_magnification: normalizeInt(row?.max_magnification),
      price,
      stock,
      description: String(row?.description ?? '').trim() || null,
      updated_at: now,
    }
    if (row?.image) payload.image = String(row.image).trim()

    if (existing) {
      Object.assign(existing, payload)
      updated += 1
    } else {
      db.products.push({
        id: db.nextProductId++,
        name,
        created_at: now,
        ...payload,
      })
      created += 1
    }
  }

  saveDb(db)
  return ok(config, {
    message: `Импорт завершён: создано ${created}, обновлено ${updated}.`,
    created,
    updated,
  })
}

export async function demoAdapter(config) {
  const method = String(config.method || 'get').toLowerCase()
  const url = String(config.url || '')
  const path = url.split('?')[0]
  const params = config.params || {}
  const body = parseBody(config)

  // --- Auth ---
  if (path === '/auth/login' && method === 'post') {
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    if (email === DEMO_ADMIN.email && password === 'admin12345') {
      return ok(config, { token: DEMO_TOKEN, user: DEMO_ADMIN })
    }
    return fail(config, 422, {
      message: 'Неверный email или пароль.',
      errors: { email: ['Неверный email или пароль.'] },
    })
  }

  if (path === '/auth/me' && method === 'get') {
    if (!isAdminRequest(config)) return unauthorized(config)
    return ok(config, DEMO_ADMIN)
  }

  if (path === '/auth/logout' && method === 'post') {
    return ok(config, { message: 'Logged out.' })
  }

  // --- Public catalog ---
  if (path === '/categories' && method === 'get') {
    const db = getDb()
    const rows = [...db.categories].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    return ok(config, rows)
  }

  if (path === '/products/meta' && method === 'get') {
    return ok(config, productMeta(getDb()))
  }

  if (path === '/products' && method === 'get') {
    const db = getDb()
    return ok(config, paginate(filteredProducts(db, params), params))
  }

  // --- Product CRUD ---
  if (path === '/products' && method === 'post') {
    if (!isAdminRequest(config)) return unauthorized(config)
    const db = getDb()
    const { product, errors } = await buildProductPayload(db, body)
    if (errors) return fail(config, 422, { message: 'Проверьте поля формы.', errors })
    product.id = db.nextProductId++
    db.products.push(product)
    saveDb(db)
    return ok(config, attachCategory(db, product), 201)
  }

  const productMatch = path.match(/^\/products\/(\d+)$/)
  if (productMatch) {
    const id = Number(productMatch[1])
    const db = getDb()
    const index = db.products.findIndex((item) => item.id === id)

    if (method === 'get') {
      if (index === -1) return fail(config, 404, { message: 'Товар не найден.' })
      return ok(config, attachCategory(db, db.products[index]))
    }

    if (method === 'put' || method === 'post') {
      if (!isAdminRequest(config)) return unauthorized(config)
      if (index === -1) return fail(config, 404, { message: 'Товар не найден.' })
      const { product, errors } = await buildProductPayload(db, body, db.products[index])
      if (errors) return fail(config, 422, { message: 'Проверьте поля формы.', errors })
      db.products[index] = { ...db.products[index], ...product, id }
      saveDb(db)
      return ok(config, attachCategory(db, db.products[index]))
    }

    if (method === 'delete') {
      if (!isAdminRequest(config)) return unauthorized(config)
      if (index === -1) return fail(config, 404, { message: 'Товар не найден.' })
      db.products.splice(index, 1)
      saveDb(db)
      return ok(config, null, 204)
    }
  }

  // --- Import ---
  if (path === '/imports' && method === 'post') {
    return handleImport(config, body)
  }

  // --- Fallback ---
  if (method === 'get') {
    return fail(config, 404, { message: 'Раздел недоступен в демо-версии.' })
  }

  return fail(config, 503, {
    message: 'Демо-версия: это действие доступно только в локальной версии с Laravel.',
  })
}