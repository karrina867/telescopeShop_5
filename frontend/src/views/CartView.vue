<script setup>
import { computed, reactive, ref } from 'vue'
import PriceTag from '@/components/PriceTag.vue'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import { productImage } from '@/utils/format'

const cart = useCartStore()
const orders = useOrdersStore()

const deliveries = [
  {
    value: 'courier',
    label: 'Курьер по Минску',
    note: 'Сегодня или завтра, бесплатно при заказе от 300',
  },
  {
    value: 'pickup',
    label: 'Самовывоз',
    note: 'Минск, ул. Звёздная, 8 · ежедневно 10:00–20:00',
  },
]

const form = reactive({
  name: '',
  phone: '',
  delivery: 'courier',
  consent: false,
})

const touched = reactive({})
const submitting = ref(false)
const placed = ref(null)

const errors = computed(() => ({
  name: form.name.trim().length < 2 ? 'Укажите имя' : '',
  phone: /^\+?[\d\s()-]{7,}$/.test(form.phone.trim()) ? '' : 'Оставьте телефон для связи',
  consent: form.consent ? '' : 'Нужно согласие на обработку данных',
}))

function fieldError(name) {
  return touched[name] ? errors.value[name] : ''
}

function markTouched(name) {
  touched[name] = true
}

function specLine(item) {
  const parts = []

  if (item.type) {
    parts.push(item.type)
  }

  if (item.aperture_mm && item.focal_mm) {
    parts.push(`${item.aperture_mm}/${item.focal_mm} мм`)
  }

  if (item.mount) {
    parts.push(item.mount)
  }

  return parts.join(' · ')
}

function placeOrder() {
  if (submitting.value || cart.isEmpty) {
    return
  }

  Object.keys(errors.value).forEach((key) => {
    touched[key] = true
  })

  if (Object.values(errors.value).some(Boolean)) {
    return
  }

  submitting.value = true

  const items = cart.items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }))
  const delivery = deliveries.find((option) => option.value === form.delivery)
  const count = cart.count
  const total = cart.subtotal
  const product =
    items.length > 1 ? `${items[0].name} + ещё ${items.length - 1}` : items[0]?.name || 'Заказ с сайта'

  window.setTimeout(() => {
    const created = orders.add({
      client: form.name.trim(),
      phone: form.phone.trim(),
      items,
      amount: total,
      product,
      delivery: `${delivery.label} — ${delivery.note}`,
    })

    placed.value = {
      number: created?.id || '—',
      items,
      count,
      total,
      name: form.name.trim(),
      phone: form.phone.trim(),
      delivery,
    }
    submitting.value = false
    cart.clear()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 700)
}
</script>

<template>
  <div class="page-shell">
    
    <section v-if="placed" class="mx-auto max-w-3xl" aria-labelledby="order-title">
      <div class="rounded-panel border border-emerald-400/30 bg-emerald-500/10 p-6 text-center sm:p-10">
        <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/20 text-2xl text-emerald-400">
          <i class="fa-solid fa-check" aria-hidden="true"></i>
        </span>
        <h1 id="order-title" class="mt-4 text-2xl font-extrabold text-white sm:text-3xl">Заказ оформлен</h1>
        <p class="mt-2 text-sm text-gray-300">
          Номер <span class="font-semibold text-white">{{ placed.number }}</span>. Гид свяжется с вами по номеру
          <span class="whitespace-nowrap font-semibold text-white">{{ placed.phone }}</span> в течение 15 минут
          и подтвердит доставку.
        </p>
      </div>

      <div class="panel mt-5">
        <h2 class="text-sm font-bold text-white">Состав заказа</h2>
        <ul class="mt-3 divide-y divide-white/5">
          <li
            v-for="item in placed.items"
            :key="item.id"
            class="flex items-center justify-between gap-4 py-3 text-xs"
          >
            <span class="min-w-0 text-gray-200">
              {{ item.name }}<span class="text-gray-500"> × {{ item.quantity }}</span>
            </span>
            <span class="shrink-0 text-white"><PriceTag :value="item.price * item.quantity" /></span>
          </li>
        </ul>

        <div class="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
          <span class="font-semibold text-white">Итого</span>
          <span class="text-lg text-white"><PriceTag :value="placed.total" /></span>
        </div>

        <dl class="mt-5 grid gap-3 text-xs sm:grid-cols-2">
          <div>
            <dt class="text-gray-500">Получатель</dt>
            <dd class="mt-0.5 font-medium text-gray-200">{{ placed.name }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Телефон</dt>
            <dd class="mt-0.5 font-medium text-gray-200">{{ placed.phone }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-gray-500">Доставка</dt>
            <dd class="mt-0.5 font-medium text-gray-200">
              {{ placed.delivery.label }} — {{ placed.delivery.note }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="mt-5 flex flex-wrap gap-3">
        <router-link :to="{ name: 'catalog' }" class="btn-primary btn-sm">
          Вернуться в каталог
        </router-link>
        <router-link :to="{ name: 'support' }" class="btn-secondary btn-sm">
          Задать вопрос
        </router-link>
      </div>
    </section>

    <template v-else>
      <header class="mb-8 max-w-2xl">
        <span class="eyebrow">Корзина</span>
        <h1 class="page-title">Проверьте заказ</h1>
        <p class="page-lead">
          Количество можно изменить, а оплата — при получении. Гид перезвонит и поможет с настройкой
          после доставки.
        </p>
      </header>

      <div v-if="cart.isEmpty" class="panel mx-auto max-w-xl py-14 text-center">
        <span class="mx-auto grid h-16 w-16 place-items-center rounded-full border border-brand/20 bg-brand/10 text-2xl text-brand">
          <i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>
        </span>
        <h2 class="mt-5 text-xl font-bold text-white">В корзине пока пусто</h2>
        <p class="mx-auto mt-2 max-w-sm text-sm text-gray-400">
          Выберите телескоп в каталоге или пройдите короткий подбор — покажем модель под вашу задачу.
        </p>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <router-link :to="{ name: 'catalog' }" class="btn-primary btn-sm">
            Перейти в каталог
          </router-link>
          <router-link :to="{ name: 'selection' }" class="btn-secondary btn-sm">
            Подобрать телескоп
          </router-link>
        </div>
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-12">
        <div class="lg:col-span-8">
          <ul class="panel divide-y divide-white/5 p-5 sm:p-6">
            <li
              v-for="item in cart.items"
              :key="item.id"
              class="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
            >
              <div class="flex min-w-0 flex-1 items-center gap-4">
                <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-card bg-[#0b1124] p-2">
                  <img
                    :src="productImage(item)"
                    :alt="item.name"
                    class="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div class="min-w-0">
                  <h2 class="truncate text-sm font-bold text-white">{{ item.name }}</h2>
                  <p class="mt-0.5 truncate text-[11px] text-gray-400">{{ specLine(item) || 'Телескоп' }}</p>
                  <p class="mt-1.5 flex items-center text-xs text-gray-400">
                    <PriceTag :value="item.price" /><span class="ml-1.5">за шт.</span>
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-between gap-4 sm:justify-end">
                <div class="flex items-center rounded-full border border-white/10 bg-white/5">
                  <button
                    type="button"
                    class="grid h-9 w-9 place-items-center rounded-full text-gray-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="item.quantity <= 1"
                    :aria-label="`Уменьшить количество: ${item.name}`"
                    @click="cart.decrease(item.id)"
                  >
                    <i class="fa-solid fa-minus text-[10px]" aria-hidden="true"></i>
                  </button>
                  <label :for="`cart-qty-${item.id}`" class="sr-only">Количество: {{ item.name }}</label>
                  <input
                    :id="`cart-qty-${item.id}`"
                    type="number"
                    inputmode="numeric"
                    min="1"
                    :max="item.stock"
                    :value="item.quantity"
                    class="w-10 appearance-none bg-transparent text-center text-sm font-semibold text-white outline-none [&::-webkit-inner-spin-button]:appearance-none"
                    @change="cart.setQuantity(item.id, $event.target.value)"
                  />
                  <button
                    type="button"
                    class="grid h-9 w-9 place-items-center rounded-full text-gray-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="item.quantity >= item.stock"
                    :aria-label="`Увеличить количество: ${item.name}`"
                    @click="cart.increase(item.id)"
                  >
                    <i class="fa-solid fa-plus text-[10px]" aria-hidden="true"></i>
                  </button>
                </div>

                <div class="w-28 text-right">
                  <p class="text-base text-white"><PriceTag :value="item.price * item.quantity" /></p>
                  <p class="mt-0.5 text-[10px] text-gray-500">в наличии {{ item.stock }} шт.</p>
                  <button
                    type="button"
                    class="mt-1 text-[11px] text-gray-500 transition-colors hover:text-red-400"
                    :aria-label="`Удалить ${item.name} из корзины`"
                    @click="cart.remove(item.id)"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </li>
          </ul>

          <div class="mt-4 flex flex-col justify-between gap-3 text-xs sm:flex-row sm:items-center">
            <router-link
              :to="{ name: 'catalog' }"
              class="inline-flex items-center gap-2 font-semibold text-brand transition-colors hover:text-brand-hover"
            >
              <i class="fa-solid fa-arrow-left text-[10px]" aria-hidden="true"></i>
              Продолжить покупки
            </router-link>
            <button
              type="button"
              class="self-start text-gray-500 transition-colors hover:text-red-400 sm:self-auto"
              @click="cart.clear()"
            >
              Очистить корзину
            </button>
          </div>
        </div>

        <aside class="lg:col-span-4" aria-label="Оформление заказа">
          <form class="panel lg:sticky lg:top-24" novalidate @submit.prevent="placeOrder">
            <h2 class="text-sm font-bold text-white">Оформление</h2>

            <dl class="mt-4 space-y-2 border-b border-white/10 pb-4 text-xs">
              <div class="flex items-center justify-between gap-3">
                <dt class="text-gray-500">Товары ({{ cart.count }})</dt>
                <dd class="text-gray-200"><PriceTag :value="cart.subtotal" /></dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-gray-500">Доставка</dt>
                <dd class="text-emerald-400">Бесплатно</dd>
              </div>
            </dl>

            <fieldset class="mt-4">
              <legend class="field-label">Способ получения</legend>
              <div class="space-y-2">
                <label
                  v-for="option in deliveries"
                  :key="option.value"
                  class="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-brand"
                  :class="form.delivery === option.value ? 'border-brand/40 bg-brand/10' : 'border-white/10 bg-white/5 hover:border-brand/30'"
                >
                  <input
                    v-model="form.delivery"
                    type="radio"
                    name="delivery"
                    :value="option.value"
                    class="sr-only"
                  />
                  <span
                    class="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border"
                    :class="form.delivery === option.value ? 'border-brand bg-brand/20' : 'border-white/20'"
                    aria-hidden="true"
                  >
                    <span v-if="form.delivery === option.value" class="h-2 w-2 rounded-full bg-brand"></span>
                  </span>
                  <span class="min-w-0">
                    <span class="block text-xs font-semibold text-white">{{ option.label }}</span>
                    <span class="mt-0.5 block text-[11px] leading-relaxed text-gray-400">{{ option.note }}</span>
                  </span>
                </label>
              </div>
            </fieldset>

            <div class="mt-4 space-y-3">
              <div>
                <label for="cart-name" class="field-label">Имя</label>
                <input
                  id="cart-name"
                  v-model="form.name"
                  type="text"
                  autocomplete="name"
                  placeholder="Как к вам обращаться"
                  class="field-input"
                  :class="fieldError('name') ? 'border-red-500' : ''"
                  :aria-invalid="Boolean(fieldError('name'))"
                  aria-describedby="cart-name-error"
                  @blur="markTouched('name')"
                />
                <p id="cart-name-error" class="field-error" role="alert">{{ fieldError('name') }}</p>
              </div>

              <div>
                <label for="cart-phone" class="field-label">Телефон</label>
                <input
                  id="cart-phone"
                  v-model="form.phone"
                  type="tel"
                  autocomplete="tel"
                  placeholder="+375 (29) 000-00-00"
                  class="field-input"
                  :class="fieldError('phone') ? 'border-red-500' : ''"
                  :aria-invalid="Boolean(fieldError('phone'))"
                  aria-describedby="cart-phone-error"
                  @blur="markTouched('phone')"
                />
                <p id="cart-phone-error" class="field-error" role="alert">{{ fieldError('phone') }}</p>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span class="text-sm font-semibold text-white">Итого</span>
              <span class="text-xl text-white"><PriceTag :value="cart.subtotal" /></span>
            </div>

            <label class="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-gray-400 transition-colors hover:border-brand/30">
              <input
                v-model="form.consent"
                type="checkbox"
                class="mt-0.5 h-4 w-4 rounded border-white/20 bg-space-950 text-brand focus:ring-2 focus:ring-brand/30"
                @change="markTouched('consent')"
              />
              <span>Согласен с обработкой персональных данных и политикой конфиденциальности.</span>
            </label>
            <p v-if="fieldError('consent')" class="field-error" role="alert">{{ fieldError('consent') }}</p>

            <button
              type="submit"
              class="btn-primary mt-4 w-full"
              :disabled="submitting"
              :aria-busy="submitting"
            >
              <i v-if="submitting" class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
              {{ submitting ? 'Оформляем…' : 'Оформить заказ' }}
            </button>

            <p class="mt-3 text-center text-[11px] leading-relaxed text-gray-500">
              Оплата при получении. Мы не списываем деньги до подтверждения заказа.
            </p>
          </form>
        </aside>
      </div>
    </template>
  </div>
</template>
