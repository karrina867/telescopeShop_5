import { defineStore } from 'pinia'

const STORAGE_KEY = 'orbita-cart'
const NOTICE_TIMEOUT = 3000

let noticeTimer = null

function normalizeItem(raw) {
  const id = Number(raw?.id)
  const price = Number(raw?.price)
  const stockRaw = Number(raw?.stock)
  const stock = Number.isFinite(stockRaw) ? Math.max(0, Math.floor(stockRaw)) : 0

  if (!Number.isFinite(id) || id <= 0) {
    return null
  }

  if (!Number.isFinite(price) || price < 0) {
    return null
  }

  if (stock < 1) {
    return null
  }

  const quantityRaw = Math.floor(Number(raw?.quantity))
  const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? quantityRaw : 1

  return {
    id,
    name: String(raw?.name || 'Телескоп').slice(0, 160),
    price,
    stock,
    quantity: Math.min(quantity, stock),
    type: raw?.type ? String(raw.type) : '',
    aperture_mm: Number(raw?.aperture_mm) || null,
    focal_mm: Number(raw?.focal_mm) || null,
    mount: raw?.mount ? String(raw.mount) : '',
  }
}

function readStorage() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

    if (!Array.isArray(parsed)) {
      return []
    }

    const items = new Map()

    parsed.forEach((raw) => {
      const item = normalizeItem(raw)

      if (!item) {
        return
      }

      const existing = items.get(item.id)

      if (existing) {
        existing.quantity = Math.min(existing.quantity + item.quantity, existing.stock)
      } else {
        items.set(item.id, item)
      }
    })

    return [...items.values()]
  } catch (error) {
    return []
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: readStorage(),
    notice: '',
  }),

  getters: {
    count: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    isEmpty: (state) => state.items.length === 0,
    quantityOf: (state) => (id) => state.items.find((item) => item.id === Number(id))?.quantity ?? 0,
  },

  actions: {
    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
      } catch (error) {
        // Приватный режим или переполнение хранилища — корзина живёт до перезагрузки.
      }
    },

    notify(message) {
      this.notice = message
      window.clearTimeout(noticeTimer)
      noticeTimer = window.setTimeout(() => {
        this.notice = ''
      }, NOTICE_TIMEOUT)
    },

    add(product, quantity = 1) {
      const item = normalizeItem({ ...product, quantity })

      if (!item) {
        return false
      }

      const existing = this.items.find((entry) => entry.id === item.id)

      if (existing) {
        if (existing.quantity >= existing.stock) {
          this.notify(`«${existing.name}» — уже максимум в корзине`)
          return false
        }

        existing.quantity = Math.min(existing.quantity + item.quantity, existing.stock)
      } else {
        this.items.push(item)
      }

      this.persist()
      this.notify(`«${item.name}» добавлен в корзину`)
      return true
    },

    setQuantity(id, quantity) {
      const item = this.items.find((entry) => entry.id === Number(id))

      if (!item) {
        return
      }

      const next = Math.floor(Number(quantity))

      if (!Number.isFinite(next)) {
        return
      }

      item.quantity = Math.min(Math.max(1, next), item.stock)
      this.persist()
    },

    increase(id) {
      const item = this.items.find((entry) => entry.id === Number(id))

      if (item) {
        this.setQuantity(item.id, item.quantity + 1)
      }
    },

    decrease(id) {
      const item = this.items.find((entry) => entry.id === Number(id))

      if (item) {
        this.setQuantity(item.id, item.quantity - 1)
      }
    },

    remove(id) {
      const item = this.items.find((entry) => entry.id === Number(id))

      if (!item) {
        return
      }

      this.items = this.items.filter((entry) => entry.id !== item.id)
      this.persist()
      this.notify(`«${item.name}» удалён из корзины`)
    },

    clear() {
      this.items = []
      this.persist()
    },
  },
})
