<script setup>
import { onUnmounted, reactive, ref } from 'vue'
import http from '@/api/http'

const props = defineProps({
  product: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'saved'])

const form = reactive({
  name: props.product?.name || '',
  category_id: props.product?.category_id || '',
  type: props.product?.type || '',
  aperture_mm: props.product?.aperture_mm ?? '',
  focal_mm: props.product?.focal_mm ?? '',
  mount: props.product?.mount || '',
  max_magnification: props.product?.max_magnification ?? '',
  price: props.product?.price ?? '',
  stock: props.product?.stock ?? 0,
  description: props.product?.description || '',
})

const errors = ref({})
const message = ref('')
const saving = ref(false)
const imageFile = ref(null)
const imagePreview = ref(props.product?.image_url || props.product?.image || '')
const removeImage = ref(false)
const fileInput = ref(null)

const inputClass =
  'w-full rounded-xl border border-white/15 bg-space-950/80 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20'

function normalize(value) {
  return value === '' ? null : value
}

function revokePreview() {
  if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreview.value)
  }
}

function handleImageChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  revokePreview()
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  removeImage.value = false
  errors.value.image = undefined
}

function clearImage() {
  revokePreview()
  imageFile.value = null
  imagePreview.value = ''
  removeImage.value = Boolean(props.product?.image_url || props.product?.image)
  if (fileInput.value) fileInput.value.value = ''
}

async function submit() {
  saving.value = true
  errors.value = {}
  message.value = ''

  const payload = new FormData()
  payload.append('name', form.name)
  payload.append('category_id', normalize(form.category_id) ?? '')
  payload.append('type', normalize(form.type) ?? '')
  payload.append('aperture_mm', normalize(form.aperture_mm) ?? '')
  payload.append('focal_mm', normalize(form.focal_mm) ?? '')
  payload.append('mount', normalize(form.mount) ?? '')
  payload.append('max_magnification', normalize(form.max_magnification) ?? '')
  payload.append('price', form.price ?? '')
  payload.append('stock', form.stock ?? 0)
  payload.append('description', normalize(form.description) ?? '')

  if (imageFile.value) {
    payload.append('image', imageFile.value)
  }

  if (removeImage.value) {
    payload.append('remove_image', '1')
  }

  try {
    if (props.product) {
      payload.append('_method', 'PUT')
      await http.post(`/products/${props.product.id}`, payload)
    } else {
      await http.post('/products', payload)
    }

    emit('saved')
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || {}
      message.value = error.response.data.message || 'Проверьте поля формы.'
    } else {
      message.value = 'Не удалось сохранить товар.'
    }
  } finally {
    saving.value = false
  }
}

onUnmounted(revokePreview)
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[1050] flex items-start justify-center overflow-y-auto bg-space-950/75 p-4 pt-10 backdrop-blur-sm sm:pt-16"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-3xl rounded-panel border border-white/10 bg-space-850 shadow-2xl">
        <div class="p-5 sm:p-7">
          <div class="mb-5 flex items-center justify-between gap-4">
            <h2 class="text-xl font-bold text-white">
              {{ product ? 'Редактировать товар' : 'Новый товар' }}
            </h2>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-xl text-gray-300 transition-colors hover:border-red-400/40 hover:text-red-300"
              aria-label="Закрыть"
              @click="emit('close')"
            >
              &times;
            </button>
          </div>

          <div
            v-if="message"
            class="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {{ message }}
          </div>

          <form class="space-y-4" @submit.prevent="submit">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div class="sm:col-span-2">
                <label for="product-name" class="mb-1.5 block text-xs font-medium text-gray-400">Название *</label>
                <input id="product-name" v-model="form.name" :class="inputClass" required />
                <p v-if="errors.name" class="mt-1 text-xs text-red-400">{{ errors.name[0] }}</p>
              </div>
              <div>
                <label for="product-category" class="mb-1.5 block text-xs font-medium text-gray-400">Категория</label>
                <select id="product-category" v-model="form.category_id" :class="inputClass">
                  <option value="">Без категории</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label for="product-type" class="mb-1.5 block text-xs font-medium text-gray-400">Тип</label>
                <input id="product-type" v-model="form.type" :class="inputClass" placeholder="Рефрактор" />
              </div>
              <div>
                <label for="product-aperture" class="mb-1.5 block text-xs font-medium text-gray-400">Апертура, мм</label>
                <input
                  id="product-aperture"
                  v-model.number="form.aperture_mm"
                  type="number"
                  min="0"
                  :class="inputClass"
                />
                <p v-if="errors.aperture_mm" class="mt-1 text-xs text-red-400">
                  {{ errors.aperture_mm[0] }}
                </p>
              </div>
              <div>
                <label for="product-focal" class="mb-1.5 block text-xs font-medium text-gray-400">Фокус, мм</label>
                <input id="product-focal" v-model.number="form.focal_mm" type="number" min="0" :class="inputClass" />
              </div>
              <div>
                <label for="product-mount" class="mb-1.5 block text-xs font-medium text-gray-400">Монтировка</label>
                <input id="product-mount" v-model="form.mount" :class="inputClass" placeholder="AZ" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label for="product-magnification" class="mb-1.5 block text-xs font-medium text-gray-400">Макс. увеличение</label>
                <input
                  id="product-magnification"
                  v-model.number="form.max_magnification"
                  type="number"
                  min="0"
                  :class="inputClass"
                />
              </div>
              <div>
                <label for="product-price" class="mb-1.5 block text-xs font-medium text-gray-400">Цена *</label>
                <input
                  id="product-price"
                  v-model.number="form.price"
                  type="number"
                  step="0.01"
                  min="0"
                  :class="inputClass"
                  required
                />
                <p v-if="errors.price" class="mt-1 text-xs text-red-400">{{ errors.price[0] }}</p>
              </div>
              <div>
                <label for="product-stock" class="mb-1.5 block text-xs font-medium text-gray-400">Кол-во *</label>
                <input
                  id="product-stock"
                  v-model.number="form.stock"
                  type="number"
                  min="0"
                  :class="inputClass"
                  required
                />
                <p v-if="errors.stock" class="mt-1 text-xs text-red-400">{{ errors.stock[0] }}</p>
              </div>
            </div>

            <div>
              <label for="product-description" class="mb-1.5 block text-xs font-medium text-gray-400">Описание</label>
              <textarea id="product-description" v-model="form.description" rows="3" :class="inputClass"></textarea>
            </div>

            <div>
              <label for="product-image" class="mb-1.5 block text-xs font-medium text-gray-400">Фото товара</label>
              <div class="flex flex-col gap-4 rounded-xl border border-white/10 bg-space-950/40 p-4 sm:flex-row sm:items-center">
                <div class="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0b1124]">
                  <img
                    v-if="imagePreview"
                    :src="imagePreview"
                    alt="Предпросмотр фото товара"
                    class="h-full w-full object-contain"
                  />
                  <span v-else class="text-xs text-gray-500">Нет фото</span>
                </div>
                <div class="min-w-0 flex-1">
                  <input
                    id="product-image"
                    ref="fileInput"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    class="block w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-brand/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand hover:file:bg-brand/25"
                    @change="handleImageChange"
                  />
                  <p class="mt-2 text-xs text-gray-500">JPG, PNG или WebP, до 5 МБ. В демо-режиме фото сохраняется локально в браузере.</p>
                  <button
                    v-if="imagePreview"
                    type="button"
                    class="mt-2 text-xs text-red-300 transition-colors hover:text-red-200"
                    @click="clearImage"
                  >
                    Убрать фото
                  </button>
                  <p v-if="errors.image" class="mt-2 text-xs text-red-400">{{ errors.image[0] }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                class="rounded-xl px-4 py-2.5 text-sm text-gray-400 transition-colors hover:text-white"
                @click="emit('close')"
              >
                Отмена
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-space-950 transition-all hover:bg-brand-hover hover:shadow-glow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i v-if="saving" class="fa-solid fa-spinner fa-spin mr-2"></i>
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>
