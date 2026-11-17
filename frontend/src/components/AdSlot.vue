<script setup>
import { computed } from 'vue'

// Плейсхолдер рекламного блока. По требованию задания — светлая поверхность
// с пунктирной рамкой; в тёмной теме блок намеренно контрастирует с фоном,
// чтобы место под рекламу было хорошо заметно.
const props = defineProps({
  // Готовые размеры: широкий баннер, боковая колонка, встроенный блок.
  size: {
    type: String,
    default: 'banner',
    validator: (value) => ['banner', 'sidebar', 'inline'].includes(value),
  },
  label: { type: String, default: 'Рекламное место' },
  hint: { type: String, default: 'Здесь может быть ваша реклама' },
  // Ручное переопределение размера (число — пиксели, строка — любое CSS-значение).
  width: { type: [Number, String], default: null },
  height: { type: [Number, String], default: null },
})

const PRESETS = {
  banner: {
    box: 'min-h-24 px-6 py-6 sm:min-h-28',
    dimensions: '970 × 90',
  },
  sidebar: {
    box: 'min-h-60 px-5 py-6',
    dimensions: '300 × 250',
  },
  inline: {
    box: 'min-h-28 px-5 py-6',
    dimensions: '728 × 90',
  },
}

const preset = computed(() => PRESETS[props.size] ?? PRESETS.banner)

function cssSize(value) {
  return typeof value === 'number' ? `${value}px` : value
}

const dimensions = computed(() => {
  if (props.width && props.height) {
    return `${props.width} × ${props.height}`
  }

  if (props.width) {
    return `ширина ${props.width}px`
  }

  if (props.height) {
    return `высота ${props.height}px`
  }

  return preset.value.dimensions
})

const customSize = computed(() => {
  const style = {}

  if (props.width) {
    style.width = cssSize(props.width)
    style.maxWidth = '100%'
  }

  if (props.height) {
    style.height = cssSize(props.height)
    style.minHeight = cssSize(props.height)
  }

  return style
})
</script>

<template>
  <div
    class="ad-slot flex w-full max-w-full flex-col items-center justify-center gap-1.5 rounded-card border-2 border-dashed border-slate-400/70 bg-slate-100/95 text-center"
    :class="preset.box"
    :style="customSize"
    role="note"
    :aria-label="label"
  >
    <span class="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Реклама</span>
    <span class="text-sm font-semibold text-slate-600">{{ label }}</span>
    <span class="text-[11px] font-medium text-slate-400">{{ dimensions }}</span>
    <span class="text-[11px] text-slate-400">{{ hint }}</span>
  </div>
</template>
