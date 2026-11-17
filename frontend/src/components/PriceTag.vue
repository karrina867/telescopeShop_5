<script setup>
import { computed } from 'vue'
import { formatAmount } from '@/utils/format'
import CurrencySign from '@/components/CurrencySign.vue'

const props = defineProps({
  value: { type: [Number, String], default: 0 },
})

const amount = computed(() => formatAmount(props.value))
</script>

<template>
  <span class="whitespace-nowrap font-extrabold tracking-tight"
    >{{ amount }}<CurrencySign class="ml-1" /></span
  >
</template>
