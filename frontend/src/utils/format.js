const PRODUCT_IMAGES = [
  '/img/teleskop_1.png',
  '/img/teleskop_2.png',
  '/img/teleskop_3.png',
  '/img/teleskop_4.png',
]

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

function backendOrigin() {
  try {
    return new URL(API_BASE, window.location.origin).origin
  } catch (error) {
    return window.location.origin
  }
}

export function formatAmount(value) {
  const num = Number(value || 0)

  return num.toLocaleString('ru-RU')
}

export function productImage(productOrId) {
  const product = typeof productOrId === 'object' && productOrId !== null ? productOrId : null
  const id = product ? product.id : productOrId
  const image = product?.image_url || product?.image

  if (typeof image === 'string' && image) {
    if (/^(https?:|data:|blob:)/i.test(image)) {
      return image
    }

    if (image.startsWith('/')) {
      return `${backendOrigin()}${image}`
    }

    return `${backendOrigin()}/${image}`
  }

  const index = ((Number(id) || 1) - 1) % PRODUCT_IMAGES.length

  return PRODUCT_IMAGES[index]
}

export function formatDate(value) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('ru-RU')
}

const MONTHS_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
]

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function formatOrderDate(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const now = new Date()
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86400000)

  if (days === 0) {
    return `сегодня, ${time}`
  }

  if (days === 1) {
    return `вчера, ${time}`
  }

  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}, ${time}`
}
