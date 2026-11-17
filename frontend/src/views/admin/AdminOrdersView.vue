<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import PriceTag from '@/components/PriceTag.vue'
import { useOrdersStore, ORDERS_STORAGE_KEY } from '@/stores/orders'
import { formatOrderDate } from '@/utils/format'

const columns = [
  { key: 'new', title: 'Новые', hint: 'Ждут подтверждения', dot: 'bg-info' },
  { key: 'confirmed', title: 'Подтверждены', hint: 'Оплата получена', dot: 'bg-brand' },
  { key: 'assembly', title: 'Сборка и юстировка', hint: 'Проверяем оптику', dot: 'bg-warning' },
  { key: 'delivery', title: 'Доставка', hint: 'Передано курьеру', dot: 'bg-success' },
]

const orderStore = useOrdersStore()

const query = ref('')
const draggingId = ref(null)
const dragOverColumn = ref(null)
const liveMessage = ref('')

const visibleOrders = computed(() => {
  const text = query.value.trim().toLowerCase()
  if (!text) {
    return orderStore.orders
  }

  return orderStore.orders.filter(
    (order) =>
      order.client.toLowerCase().includes(text) ||
      order.product.toLowerCase().includes(text) ||
      order.id.toLowerCase().includes(text),
  )
})

function ordersIn(columnKey) {
  return visibleOrders.value.filter((order) => order.column === columnKey)
}

function total(columnKey) {
  return orderStore.orders.filter((order) => order.column === columnKey).length
}

function moveTo(id, columnKey) {
  const order = orderStore.move(id, columnKey)
  if (!order) {
    return
  }

  const target = columns.find((column) => column.key === columnKey)
  liveMessage.value = `Заказ ${order.id} перемещён в колонку «${target.title}».`
}

function shift(order, delta) {
  const index = columns.findIndex((column) => column.key === order.column)
  const next = columns[index + delta]
  if (next) {
    moveTo(order.id, next.key)
  }
}

function orderDate(order) {
  return order.createdAt ? formatOrderDate(order.createdAt) : order.date
}

function onStorage(event) {
  if (event.key === ORDERS_STORAGE_KEY) {
    orderStore.reload()
  }
}

onMounted(() => window.addEventListener('storage', onStorage))
onUnmounted(() => window.removeEventListener('storage', onStorage))

function onDragStart(event, order) {
  draggingId.value = order.id
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', order.id)
}

function onDragEnd() {
  draggingId.value = null
  dragOverColumn.value = null
}

function onDrop(columnKey) {
  if (draggingId.value) {
    moveTo(draggingId.value, columnKey)
  }

  draggingId.value = null
  dragOverColumn.value = null
}

function columnIndex(order) {
  return columns.findIndex((column) => column.key === order.column)
}

const shippedCount = computed(() => total('delivery'))
const openCount = computed(() => total('new') + total('confirmed') + total('assembly'))
</script>

<template>
  <AdminShell title="Доска заказов">
    <div class="space-y-5">
      <div class="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <h2 class="text-lg font-bold text-white">Заказы в работе</h2>
          <p class="mt-1 text-xs text-gray-400">
            Перетаскивайте карточки между колонками или используйте кнопки перемещения — они работают с клавиатуры.
          </p>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div class="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
            <span class="chip"><span class="h-1.5 w-1.5 rounded-full bg-info"></span>{{ openCount }} в работе</span>
            <span class="chip"><span class="h-1.5 w-1.5 rounded-full bg-success"></span>{{ shippedCount }} в доставке</span>
          </div>
          <div class="relative sm:w-56">
            <label for="orders-search" class="sr-only">Поиск по заказам</label>
            <i
              class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
              aria-hidden="true"
            ></i>
            <input
              id="orders-search"
              v-model="query"
              type="search"
              placeholder="Клиент или товар…"
              class="field-input py-2 pl-9 text-xs"
            />
          </div>
        </div>
      </div>

      <p class="sr-only" role="status" aria-live="polite">{{ liveMessage }}</p>

      <div class="flex snap-x gap-4 overflow-x-auto pb-2 scrollbar-thin lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0 2xl:grid-cols-4">
        <section
          v-for="column in columns"
          :key="column.key"
          class="kanban-column transition-colors duration-200"
          :class="dragOverColumn === column.key ? 'border-brand/50 bg-brand/5' : ''"
          :aria-labelledby="`column-${column.key}`"
          @dragover.prevent="dragOverColumn = column.key"
          @dragleave="dragOverColumn = null"
          @drop="onDrop(column.key)"
        >
          <header class="mb-3 flex items-start justify-between gap-2 px-1">
            <div class="min-w-0">
              <h3 :id="`column-${column.key}`" class="flex items-center gap-2 text-sm font-bold text-white">
                <span class="h-2 w-2 shrink-0 rounded-full" :class="column.dot"></span>
                {{ column.title }}
              </h3>
              <p class="mt-0.5 text-[11px] text-gray-500">{{ column.hint }}</p>
            </div>
            <span class="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-gray-300">
              {{ ordersIn(column.key).length }}<span class="sr-only"> заказов</span>
            </span>
          </header>

          <ul class="flex-1 space-y-3">
            <li
              v-for="order in ordersIn(column.key)"
              :key="order.id"
              draggable="true"
              class="kanban-card group"
              :class="[
                draggingId === order.id ? 'opacity-50' : '',
                order.source === 'site' ? 'ring-1 ring-brand/30' : '',
              ]"
              @dragstart="onDragStart($event, order)"
              @dragend="onDragEnd"
            >
              <div class="flex items-start justify-between gap-2">
                <span class="text-xs font-bold text-white">{{ order.id }}</span>
                <span
                  v-if="order.priority"
                  class="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning"
                >
                  {{ order.priority }}
                </span>
              </div>
              <p class="mt-2 text-sm font-semibold text-white">{{ order.client }}</p>
              <p class="text-xs text-gray-400">{{ order.product }}</p>
              <p v-if="order.phone" class="mt-0.5 text-[11px] text-gray-500">{{ order.phone }}</p>
              <div class="mt-2 flex items-center justify-between gap-2 text-xs">
                <span class="text-white"><PriceTag :value="order.amount" /></span>
                <span class="text-[10px] text-gray-500">{{ orderDate(order) }}</span>
              </div>

              <div class="mt-3 flex items-center justify-between gap-1 border-t border-white/10 pt-2">
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-brand disabled:pointer-events-none disabled:opacity-30"
                  :disabled="columnIndex(order) === 0"
                  :aria-label="`Переместить заказ ${order.id} назад`"
                  @click="shift(order, -1)"
                >
                  <i class="fa-solid fa-arrow-left text-[11px]" aria-hidden="true"></i>
                </button>
                <span class="text-[10px] text-gray-600 group-hover:text-gray-400">
                  <i class="fa-solid fa-grip-vertical mr-1" aria-hidden="true"></i>перетащите
                </span>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-brand disabled:pointer-events-none disabled:opacity-30"
                  :disabled="columnIndex(order) === columns.length - 1"
                  :aria-label="`Переместить заказ ${order.id} вперёд`"
                  @click="shift(order, 1)"
                >
                  <i class="fa-solid fa-arrow-right text-[11px]" aria-hidden="true"></i>
                </button>
              </div>
            </li>

            <li
              v-if="!ordersIn(column.key).length"
              class="rounded-xl border border-dashed border-white/10 px-3 py-8 text-center text-[11px] text-gray-500"
            >
              Перетащите сюда заказ
            </li>
          </ul>
        </section>
      </div>
    </div>
  </AdminShell>
</template>
