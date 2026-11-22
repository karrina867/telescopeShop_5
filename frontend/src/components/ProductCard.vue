<script setup>
import { computed } from 'vue'
import { productImage } from '@/utils/format'
import { useCartStore } from '@/stores/cart'
import PriceTag from '@/components/PriceTag.vue'

const props = defineProps({
  product: { type: Object, required: true },
})

const cart = useCartStore()

const image = computed(() => productImage(props.product.id))
const stock = computed(() => Math.max(0, Number(props.product.stock) || 0))
const inStock = computed(() => stock.value > 0)
const inCart = computed(() => cart.quantityOf(props.product.id))
const limitReached = computed(() => inStock.value && inCart.value >= stock.value)
const specLine = computed(() => {
  const parts = []
  if (props.product.type) parts.push(props.product.type)
  if (props.product.aperture_mm && props.product.focal_mm) {
    parts.push(`${props.product.aperture_mm}/${props.product.focal_mm} мм`)
  }
  if (props.product.mount) parts.push(props.product.mount)
  return parts.join(' · ')
})

function addToCart() {
  if (!inStock.value || limitReached.value) {
    return
  }

  cart.add(props.product)
}
</script>

<template>
  <article
    class="group flex h-full flex-col justify-between rounded-panel border border-white/[0.08] bg-space-800/65 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-glow"
  >
    <div>
      <div
        class="relative mb-5 flex h-56 items-center justify-center overflow-hidden rounded-card bg-[#0b1124] p-4"
      >
        <span
          v-if="inStock"
          class="absolute left-3 top-3 z-10 rounded-full border border-brand/30 bg-brand/20 px-2.5 py-1 text-[11px] font-semibold text-brand"
        >
          В наличии
        </span>
        <span
          v-else
          class="absolute left-3 top-3 z-10 rounded-full border border-red-400/30 bg-red-500/20 px-2.5 py-1 text-[11px] font-semibold text-red-300"
        >
          Нет в наличии
        </span>
        <img
          :src="image"
          :alt="product.name"
          class="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <h3 class="mb-1 text-lg font-bold text-white transition-colors group-hover:text-brand">
        {{ product.name }}
      </h3>
      <p class="mb-2 text-xs text-gray-400">{{ specLine || 'Телескоп' }}</p>
      <div
        class="mb-4 flex items-center gap-1.5 text-xs font-medium"
        :class="inStock ? 'text-emerald-400' : 'text-red-400'"
      >
        <span
          class="h-1.5 w-1.5 rounded-full"
          :class="inStock ? 'bg-emerald-400' : 'bg-red-400'"
        ></span>
        {{ inStock ? `В наличии · ${stock} шт.` : 'Нет в наличии' }}
      </div>
    </div>

    <div class="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
      <div class="text-xl text-white">
        <PriceTag :value="product.price" />
      </div>
      <button
        type="button"
        :disabled="!inStock || limitReached"
        :aria-label="
          !inStock
            ? `${product.name}: нет в наличии`
            : limitReached
              ? `${product.name}: максимум в корзине`
              : `Добавить ${product.name} в корзину`
        "
        class="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 text-xs font-semibold text-brand transition-all hover:bg-brand hover:text-space-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-brand/10 disabled:hover:text-brand"
        @click="addToCart"
      >
        <i
          class="fa-solid text-sm"
          :class="limitReached ? 'fa-check' : 'fa-cart-shopping'"
          aria-hidden="true"
        ></i>
        <span class="whitespace-nowrap">
          {{ !inStock ? 'Нет в наличии' : limitReached ? 'В корзине' : inCart ? `В корзине: ${inCart}` : 'В корзину' }}
        </span>
      </button>
    </div>
  </article>
</template>
