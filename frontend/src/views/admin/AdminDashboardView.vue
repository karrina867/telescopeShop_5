<script setup>
import { computed, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import CurrencySign from '@/components/CurrencySign.vue'
import PriceTag from '@/components/PriceTag.vue'
import { formatAmount } from '@/utils/format'

const period = ref('30d')
const query = ref('')
const status = ref('all')

const periods = [
  { key: '7d', label: '7 дней' },
  { key: '30d', label: '30 дней' },
  { key: '90d', label: '90 дней' },
]

/* Демонстрационные показатели витрины: цифры меняются вместе с периодом. */
const periodData = {
  '7d': { revenue: 318000, orders: 86, avg: 3698, conversion: 4.2, trend: '+6%' },
  '30d': { revenue: 1240000, orders: 342, avg: 3620, conversion: 4.8, trend: '+12%' },
  '90d': { revenue: 3560000, orders: 1012, avg: 3518, conversion: 4.5, trend: '+18%' },
}

const current = computed(() => periodData[period.value])

function compact(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2).replace('.', ',')} млн`
  }

  return formatAmount(value)
}

const stats = computed(() => [
  {
    label: 'Выручка',
    value: compact(current.value.revenue),
    money: true,
    trend: current.value.trend,
    up: true,
    icon: 'fa-chart-line',
    hint: 'к прошлому периоду',
  },
  {
    label: 'Заказы',
    value: formatAmount(current.value.orders),
    money: false,
    trend: '+8%',
    up: true,
    icon: 'fa-box',
    hint: 'оформлено за период',
  },
  {
    label: 'Средний чек',
    value: formatAmount(current.value.avg),
    money: true,
    trend: '-3%',
    up: false,
    icon: 'fa-receipt',
    hint: 'к прошлому периоду',
  },
  {
    label: 'Конверсия',
    value: `${String(current.value.conversion).replace('.', ',')}%`,
    money: false,
    trend: '+1,2%',
    up: true,
    icon: 'fa-bullseye',
    hint: 'из просмотра в заказ',
  },
])

const charts = {
  '7d': {
    title: 'Заказы за неделю',
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    values: [12, 15, 9, 18, 21, 16, 24],
  },
  '30d': {
    title: 'Заказы по неделям',
    labels: ['1–7', '8–14', '15–21', '22–30'],
    values: [86, 92, 78, 86],
  },
  '90d': {
    title: 'Заказы по месяцам',
    labels: ['Сен', 'Окт', 'Ноя'],
    values: [312, 298, 342],
  },
}

const chart = computed(() => charts[period.value])
const chartMax = computed(() => Math.max(...chart.value.values))

const channels = [
  { label: 'Каталог сайта', share: 46, color: 'bg-brand' },
  { label: 'Подбор телескопа', share: 27, color: 'bg-info' },
  { label: 'Повторные покупки', share: 17, color: 'bg-success' },
  { label: 'Поддержка и чат', share: 10, color: 'bg-warning' },
]

const statusMeta = {
  paid: { label: 'Оплачен', class: 'border-success/30 bg-success/10 text-success' },
  processing: { label: 'Сборка', class: 'border-warning/30 bg-warning/10 text-warning' },
  shipped: { label: 'Доставка', class: 'border-info/30 bg-info/10 text-info' },
  cancelled: { label: 'Отменён', class: 'border-danger/30 bg-danger/10 text-danger' },
}

const orders = [
  { id: '#4821', client: 'Анна Морозова', product: 'Luna 90 EQ', amount: 3400, status: 'paid', date: '15 ноя' },
  { id: '#4820', client: 'Илья Савин', product: 'DeepSky 130', amount: 4600, status: 'processing', date: '15 ноя' },
  { id: '#4819', client: 'Марина Волкова', product: 'Start 70 AZ', amount: 1899, status: 'shipped', date: '14 ноя' },
  { id: '#4818', client: 'Клуб «Орион»', product: 'Pro 200 Dob', amount: 7990, status: 'paid', date: '14 ноя' },
  { id: '#4817', client: 'Сергей Лебедев', product: 'Travel 80', amount: 5250, status: 'cancelled', date: '13 ноя' },
  { id: '#4816', client: 'Ольга Пашкевич', product: 'Solar 60', amount: 6100, status: 'processing', date: '13 ноя' },
]

const filteredOrders = computed(() => {
  const text = query.value.trim().toLowerCase()

  return orders.filter((row) => {
    const matchesQuery =
      !text ||
      row.client.toLowerCase().includes(text) ||
      row.product.toLowerCase().includes(text) ||
      row.id.includes(text)
    const matchesStatus = status.value === 'all' || row.status === status.value

    return matchesQuery && matchesStatus
  })
})

const filterChips = [
  { key: 'all', label: 'Все' },
  { key: 'paid', label: 'Оплачены' },
  { key: 'processing', label: 'В сборке' },
  { key: 'shipped', label: 'В доставке' },
  { key: 'cancelled', label: 'Отменены' },
]
</script>

<template>
  <AdminShell title="Обзор магазина">
    <div class="space-y-5">
      <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 class="text-lg font-bold text-white">Показатели витрины</h2>
          <p class="mt-1 text-xs text-gray-400">Сводка по заказам, выручке и поведению покупателей.</p>
        </div>
        <div class="flex items-center gap-1 rounded-xl bg-white/5 p-1" role="group" aria-label="Период отчёта">
          <button
            v-for="item in periods"
            :key="item.key"
            type="button"
            class="rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            :class="period === item.key ? 'bg-brand text-space-950' : 'text-gray-400 hover:text-white'"
            :aria-pressed="period === item.key"
            @click="period = item.key"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="stat in stats" :key="stat.label" class="stat-card group">
          <div class="flex items-start justify-between gap-2">
            <p class="truncate text-xs text-gray-400">{{ stat.label }}</p>
            <i
              class="fa-solid text-sm text-gray-500 transition-colors group-hover:text-brand"
              :class="stat.icon"
              aria-hidden="true"
            ></i>
          </div>
          <p class="mt-2 flex items-baseline truncate text-2xl font-extrabold text-white">
            {{ stat.value }}<CurrencySign v-if="stat.money" class="ml-1 text-lg" />
          </p>
          <div class="mt-1.5 flex items-center gap-2">
            <span
              class="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              :class="stat.up ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'"
            >
              <i
                class="fa-solid text-[8px]"
                :class="stat.up ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'"
                aria-hidden="true"
              ></i>
              {{ stat.trend }}
            </span>
            <span class="truncate text-[10px] text-gray-500">{{ stat.hint }}</span>
          </div>
        </article>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <article class="min-w-0 rounded-card border border-white/10 bg-space-800/70 p-4 lg:col-span-8">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h3 class="truncate text-sm font-bold text-white">{{ chart.title }}</h3>
              <p class="truncate text-[11px] text-gray-500">Период: {{ periods.find((p) => p.key === period).label }}</p>
            </div>
            <span class="ds-badge-success shrink-0">+18% год к году</span>
          </div>

          <div
            class="mt-6 grid h-44 items-end gap-2"
            :style="{ gridTemplateColumns: `repeat(${chart.labels.length}, minmax(0, 1fr))` }"
            role="img"
            :aria-label="`Столбчатая диаграмма: ${chart.title}. Максимум ${chartMax} заказов.`"
          >
            <div v-for="(value, index) in chart.values" :key="index" class="flex h-full flex-col-reverse gap-1.5">
              <div
                class="chart-cell w-full bg-gradient-to-t from-brand/25 to-brand/70 transition-all duration-700 hover:from-brand/40 hover:to-brand"
                :style="{ height: `${Math.max(6, Math.round((value / chartMax) * 100))}%` }"
              ></div>
              <span class="text-center text-[10px] text-gray-500">{{ chart.labels[index] }}</span>
            </div>
          </div>
        </article>

        <article class="min-w-0 rounded-card border border-white/10 bg-space-800/70 p-4 lg:col-span-4">
          <h3 class="text-sm font-bold text-white">Источники заказов</h3>
          <p class="mt-1 text-[11px] text-gray-500">Доля оформленных заказов</p>
          <ul class="mt-4 space-y-4">
            <li v-for="channel in channels" :key="channel.label">
              <div class="flex items-center justify-between gap-2 text-xs">
                <span class="truncate text-gray-300">{{ channel.label }}</span>
                <span class="font-semibold text-white">{{ channel.share }}%</span>
              </div>
              <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div class="h-full rounded-full" :class="channel.color" :style="{ width: `${channel.share}%` }"></div>
              </div>
            </li>
          </ul>
          <router-link :to="{ name: 'admin-orders' }" class="btn-secondary btn-sm mt-5 w-full">
            Открыть доску заказов
            <i class="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
          </router-link>
        </article>
      </div>

      <section class="rounded-card border border-white/10 bg-space-800/70" aria-labelledby="last-orders-title">
        <div class="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center">
          <div class="min-w-0">
            <h3 id="last-orders-title" class="text-sm font-bold text-white">Последние заказы</h3>
            <p class="mt-1 text-[11px] text-gray-500">Поиск по клиенту, товару или номеру заказа.</p>
          </div>

          <div class="relative sm:ml-auto sm:w-64">
            <label for="admin-search" class="sr-only">Поиск по заказам</label>
            <i
              class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
              aria-hidden="true"
            ></i>
            <input
              id="admin-search"
              v-model="query"
              type="search"
              placeholder="Клиент, товар или №…"
              class="field-input py-2 pl-9 text-xs"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5 border-b border-white/10 p-3">
          <button
            v-for="chip in filterChips"
            :key="chip.key"
            type="button"
            class="chip transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            :class="status === chip.key ? 'border-brand/40 bg-brand/10 text-brand' : 'hover:border-brand/30'"
            :aria-pressed="status === chip.key"
            @click="status = chip.key"
          >
            {{ chip.label }}
          </button>
        </div>

        <div class="overflow-x-auto scrollbar-thin">
          <table class="data-table">
            <thead class="border-b border-white/10">
              <tr>
                <th scope="col">Заказ</th>
                <th scope="col">Клиент</th>
                <th scope="col">Товар</th>
                <th scope="col" class="text-right">Сумма</th>
                <th scope="col">Статус</th>
                <th scope="col" class="text-right">Дата</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr
                v-for="row in filteredOrders"
                :key="row.id"
                class="transition-colors hover:bg-white/[0.03]"
              >
                <td class="font-semibold text-white">{{ row.id }}</td>
                <td>{{ row.client }}</td>
                <td class="text-gray-400">{{ row.product }}</td>
                <td class="text-right text-white"><PriceTag :value="row.amount" /></td>
                <td>
                  <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold" :class="statusMeta[row.status].class">
                    {{ statusMeta[row.status].label }}
                  </span>
                </td>
                <td class="text-right text-gray-500">{{ row.date }}</td>
              </tr>
            </tbody>
          </table>

          <p v-if="!filteredOrders.length" class="px-4 py-10 text-center text-sm text-gray-500">
            По этому фильтру заказов нет.
          </p>
        </div>
      </section>
    </div>
  </AdminShell>
</template>
