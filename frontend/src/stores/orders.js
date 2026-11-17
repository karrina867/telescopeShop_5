import { defineStore } from 'pinia'

export const ORDERS_STORAGE_KEY = 'orbita-orders'

const COLUMNS = ['new', 'confirmed', 'assembly', 'delivery']
const MAX_ORDERS = 80

// Демо-заказы доски: показываются при первом открытии панели.
const demoOrders = [
  { id: '#4832', client: 'Анна Морозова', product: 'Luna 90 EQ', amount: 3400, date: 'сегодня, 11:20', column: 'new', priority: 'Срочно' },
  { id: '#4831', client: 'Клуб «Орион»', product: 'Pro 200 Dob', amount: 7990, date: 'сегодня, 10:05', column: 'new', priority: 'Клуб' },
  { id: '#4830', client: 'Павел Ершов', product: 'Travel 80', amount: 5250, date: 'вчера, 19:40', column: 'new' },
  { id: '#4829', client: 'Илья Савин', product: 'DeepSky 130', amount: 4600, date: 'вчера, 16:10', column: 'confirmed' },
  { id: '#4828', client: 'Марина Волкова', product: 'Start 70 AZ', amount: 1899, date: 'вчера, 14:25', column: 'confirmed' },
  { id: '#4827', client: 'Ольга Пашкевич', product: 'Solar 60', amount: 6100, date: '13 ноя, 12:00', column: 'assembly' },
  { id: '#4826', client: 'Сергей Лебедев', product: 'City 80 AZ', amount: 2790, date: '13 ноя, 09:30', column: 'assembly' },
  { id: '#4825', client: 'Дмитрий Ковач', product: 'Luna 70 EQ', amount: 2290, date: '12 ноя, 18:15', column: 'delivery' },
  { id: '#4824', client: 'Наталья Гринь', product: 'DeepSky 200', amount: 9400, date: '12 ноя, 15:45', column: 'delivery' },
]

function normalizeItems(raw) {
  if (!Array.isArray(raw)) {
    return []
  }

  return raw.map((item) => ({
    id: Number(item?.id) || 0,
    name: String(item?.name || '').slice(0, 160),
    price: Number(item?.price) || 0,
    quantity: Math.max(1, Math.floor(Number(item?.quantity) || 1)),
  }))
}

function normalizeOrder(raw) {
  const id = String(raw?.id || '').trim()
  const client = String(raw?.client || '').trim()
  const amount = Number(raw?.amount)

  if (!id || !client || !Number.isFinite(amount) || amount < 0) {
    return null
  }

  const items = normalizeItems(raw?.items)

  return {
    id: id.slice(0, 24),
    client: client.slice(0, 120),
    phone: raw?.phone ? String(raw.phone).slice(0, 40) : '',
    product: String(raw?.product || items[0]?.name || 'Заказ с сайта').slice(0, 200),
    amount,
    date: raw?.date ? String(raw.date).slice(0, 40) : '',
    createdAt: raw?.createdAt ? String(raw.createdAt) : '',
    column: COLUMNS.includes(raw?.column) ? raw.column : 'new',
    priority: raw?.priority ? String(raw.priority).slice(0, 24) : '',
    delivery: raw?.delivery ? String(raw.delivery).slice(0, 200) : '',
    source: raw?.source === 'site' ? 'site' : 'demo',
    items,
  }
}

function loadOrders() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || 'null')

    if (Array.isArray(parsed)) {
      return parsed.map(normalizeOrder).filter(Boolean)
    }
  } catch (error) {
    // Повреждённые данные не должны ломать панель — показываем демо-заказы.
  }

  return demoOrders.map((order) => normalizeOrder(order)).filter(Boolean)
}

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: loadOrders(),
  }),

  getters: {
    siteOrders: (state) => state.orders.filter((order) => order.source === 'site'),
  },

  actions: {
    persist() {
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(this.orders.slice(0, MAX_ORDERS)))
      } catch (error) {
        // Приватный режим или переполнение — заказы живут до перезагрузки.
      }
    },

    reload() {
      this.orders = loadOrders()
    },

    add(raw) {
      const order = normalizeOrder({
        ...raw,
        id: raw?.id || `ORB-${String(Date.now()).slice(-6)}`,
        column: 'new',
        priority: raw?.priority || 'С сайта',
        source: 'site',
        createdAt: new Date().toISOString(),
      })

      if (!order) {
        return null
      }

      this.orders = [order, ...this.orders].slice(0, MAX_ORDERS)
      this.persist()

      return order
    },

    move(id, column) {
      const order = this.orders.find((item) => item.id === id)

      if (!order || !COLUMNS.includes(column) || order.column === column) {
        return null
      }

      order.column = column
      this.persist()

      return order
    },
  },
})
