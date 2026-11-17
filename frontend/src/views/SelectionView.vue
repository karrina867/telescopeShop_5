<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import http from '@/api/http'
import CurrencySign from '@/components/CurrencySign.vue'
import PriceTag from '@/components/PriceTag.vue'
import { formatAmount, productImage } from '@/utils/format'

const steps = [
  { title: 'Цель', icon: 'fa-eye' },
  { title: 'Условия', icon: 'fa-location-dot' },
  { title: 'Опыт', icon: 'fa-graduation-cap' },
  { title: 'Контакты', icon: 'fa-paper-plane' },
]

const goals = [
  { value: 'planets', label: 'Луна и планеты', icon: 'fa-moon', text: 'Кратеры, кольца Сатурна, спутники Юпитера' },
  { value: 'deep', label: 'Туманности и галактики', icon: 'fa-star', text: 'Больше света для далёких объектов' },
  { value: 'travel', label: 'Поездки и балкон', icon: 'fa-suitcase', text: 'Компактный телескоп, который легко увезти' },
  { value: 'solar', label: 'Солнце', icon: 'fa-sun', text: 'Пятна и протуберанцы с солнечным фильтром' },
]

const locations = [
  { value: 'city', label: 'Город и балкон', text: 'Много света, ограниченный обзор' },
  { value: 'country', label: 'Частный дом', text: 'Своя площадка и тёмное небо рядом' },
  { value: 'trips', label: 'Выезды за город', text: 'Готовы возить телескоп на машине' },
]

const experiences = [
  { value: 'first', label: 'Первый телескоп', text: 'Нужны подсказки по настройке' },
  { value: 'some', label: 'Уже наблюдал', text: 'Знаю, что такое юстировка и монтировка' },
]

const priorities = [
  { value: 'light', label: 'Максимум света' },
  { value: 'compact', label: 'Компактность' },
  { value: 'price', label: 'Цена' },
]

const form = reactive({
  goal: '',
  location: '',
  budget: 5000,
  experience: '',
  priority: 'light',
  name: '',
  contact: '',
  consent: false,
})

const step = ref(0)
const touched = reactive({})
const sending = ref(false)
const submitted = ref(false)
const result = ref(null)
const products = ref([])

const errors = computed(() => ({
  goal: form.goal ? '' : 'Выберите цель наблюдений',
  location: form.location ? '' : 'Укажите, где будете наблюдать',
  experience: form.experience ? '' : 'Выберите свой опыт',
  name: form.name.trim().length < 2 ? 'Укажите имя' : '',
  contact: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.contact) || /^\+?[\d\s()-]{7,}$/.test(form.contact)
    ? ''
    : 'Оставьте email или телефон',
  consent: form.consent ? '' : 'Нужно согласие на обработку данных',
}))

const stepValid = computed(() => {
  if (step.value === 0) return !errors.value.goal
  if (step.value === 1) return !errors.value.location
  if (step.value === 2) return !errors.value.experience
  return !errors.value.name && !errors.value.contact && !errors.value.consent
})

const progress = computed(() => Math.round((step.value / (steps.length - 1)) * 100))

const choiceLabel = (list, value) => list.find((item) => item.value === value)?.label || '—'

const summary = computed(() => [
  { label: 'Цель', value: choiceLabel(goals, form.goal) },
  { label: 'Место', value: choiceLabel(locations, form.location) },
  { label: 'Бюджет', value: `до ${formatAmount(form.budget)}`, money: true },
  { label: 'Опыт', value: choiceLabel(experiences, form.experience) },
  { label: 'Приоритет', value: choiceLabel(priorities, form.priority) },
])

function fieldError(name) {
  return touched[name] ? errors.value[name] : ''
}

function markTouched(name) {
  touched[name] = true
}

function goToStep(index) {
  if (index < step.value) {
    step.value = index
  }
}

function nextStep() {
  if (!stepValid.value) {
    Object.keys(errors.value).forEach((key) => {
      touched[key] = true
    })
    return
  }

  if (step.value < steps.length - 1) {
    step.value += 1
  }
}

function prevStep() {
  if (step.value > 0) {
    step.value -= 1
  }
}

const fallbackProducts = [
  { id: 1, name: 'Орбита Start 70 AZ', price: 1899, aperture_mm: 70, focal_mm: 700, mount: 'AZ', type: 'Рефрактор' },
  { id: 2, name: 'Орбита Luna 90 EQ', price: 3400, aperture_mm: 90, focal_mm: 900, mount: 'EQ', type: 'Рефрактор' },
  { id: 3, name: 'Орбита DeepSky 130', price: 4600, aperture_mm: 130, focal_mm: 650, mount: 'EQ', type: 'Рефлектор' },
  { id: 4, name: 'Орбита Pro 200 Dob', price: 7990, aperture_mm: 200, focal_mm: 1200, mount: 'Dobson', type: 'Рефлектор' },
]

function score(product) {
  const aperture = Number(product.aperture_mm) || 0
  const price = Number(product.price) || 0
  let value = 0

  if (form.goal === 'deep') value += aperture / 10
  if (form.goal === 'planets' && aperture >= 90) value += 8
  if (form.goal === 'solar' && /solar/i.test(product.name)) value += 40
  if (form.goal === 'travel') value -= aperture / 25
  if (form.priority === 'light') value += aperture / 40
  if (form.priority === 'compact') value -= aperture / 30
  if (form.priority === 'price') value -= price / 2000
  if (form.experience === 'first' && product.mount === 'AZ') value += 4

  return value
}

function pickProduct() {
  const pool = products.value.length ? products.value : fallbackProducts
  const affordable = pool.filter((product) => Number(product.price) <= form.budget * 1.1)
  const candidates = affordable.length ? affordable : [...pool].sort((a, b) => a.price - b.price).slice(0, 1)

  return [...candidates].sort((a, b) => score(b) - score(a))[0]
}

function submit() {
  if (!stepValid.value) {
    Object.keys(errors.value).forEach((key) => {
      touched[key] = true
    })
    return
  }

  sending.value = true
  window.setTimeout(() => {
    result.value = pickProduct()
    sending.value = false
    submitted.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 900)
}

function reset() {
  submitted.value = false
  result.value = null
  step.value = 0
  Object.assign(form, {
    goal: '',
    location: '',
    budget: 5000,
    experience: '',
    priority: 'light',
    name: '',
    contact: '',
    consent: false,
  })
  Object.keys(touched).forEach((key) => {
    touched[key] = false
  })
}

onMounted(async () => {
  try {
    const { data } = await http.get('/products', { params: { per_page: 100 } })
    products.value = data.data ?? []
  } catch (error) {
    products.value = []
  }
})
</script>

<template>
  <div class="page-shell">
    <!-- Результат подбора -->
    <section v-if="submitted" class="mx-auto max-w-3xl" aria-labelledby="result-title">
      <div class="rounded-panel border border-emerald-400/30 bg-emerald-500/10 p-6 text-center sm:p-8">
        <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/20 text-2xl text-emerald-400">
          <i class="fa-solid fa-check" aria-hidden="true"></i>
        </span>
        <h1 id="result-title" class="mt-4 text-2xl font-extrabold text-white sm:text-3xl">Подбор готов</h1>
        <p class="mt-2 text-sm text-gray-300">
          {{ form.name }}, для вашей задачи подходит эта модель. Гид свяжется с вами по адресу
          «{{ form.contact }}» и поможет с настройкой.
        </p>
      </div>

      <article v-if="result" class="mt-6 overflow-hidden rounded-panel border border-white/10 bg-space-800/65 backdrop-blur-md">
        <div class="grid gap-0 sm:grid-cols-2">
          <div class="flex items-center justify-center bg-space-850 p-6">
            <img
              :src="productImage(result.id)"
              :alt="result.name"
              class="h-56 w-full max-w-xs object-contain"
            />
          </div>
          <div class="flex flex-col justify-center gap-3 p-6">
            <span class="chip w-fit">Рекомендация «Орбиты»</span>
            <h2 class="text-xl font-bold text-white">{{ result.name }}</h2>
            <p class="text-xs text-gray-400">
              {{ result.type || 'Телескоп' }}
              <template v-if="result.aperture_mm && result.focal_mm">
                · {{ result.aperture_mm }}/{{ result.focal_mm }} мм
              </template>
              <template v-if="result.mount"> · {{ result.mount }}</template>
            </p>
            <p class="text-2xl text-white"><PriceTag :value="result.price" /></p>
            <div class="flex flex-wrap gap-2 pt-2">
              <router-link :to="{ name: 'catalog' }" class="btn-primary btn-sm">
                Открыть каталог
              </router-link>
              <router-link :to="{ name: 'support' }" class="btn-secondary btn-sm">
                Задать вопрос
              </router-link>
            </div>
          </div>
        </div>
      </article>

      <div class="mt-6 grid gap-3 sm:grid-cols-2">
        <div class="panel">
          <h3 class="text-sm font-bold text-white">Ваш профиль наблюдений</h3>
          <dl class="mt-3 space-y-2 text-xs">
            <div v-for="item in summary" :key="item.label" class="flex items-center justify-between gap-3">
              <dt class="text-gray-500">{{ item.label }}</dt>
              <dd class="flex items-center text-right font-medium text-gray-200">
                {{ item.value }}<CurrencySign v-if="item.money" class="ml-1" />
              </dd>
            </div>
          </dl>
        </div>
        <div class="panel flex flex-col justify-center">
          <p class="text-sm text-gray-400">
            Рекомендация учитывает бюджет, место наблюдений и приоритет. Окончательный выбор всегда
            за вами — модели можно сравнить в каталоге.
          </p>
          <button type="button" class="btn-secondary btn-sm mt-4 w-fit" @click="reset">
            Пройти подбор заново
          </button>
        </div>
      </div>
    </section>

    <!-- Мастер подбора -->
    <template v-else>
      <header class="mb-8 max-w-2xl">
        <span class="eyebrow">Подбор телескопа</span>
        <h1 class="page-title">Четыре шага до первого света</h1>
        <p class="page-lead">
          Ответьте на несколько вопросов — покажем модель, которая подходит под ваш бюджет и
          условия наблюдений.
        </p>
      </header>

      <div class="grid gap-6 lg:grid-cols-12">
        <div class="lg:col-span-8">
          <!-- Шаги -->
          <ol class="mb-6 grid grid-cols-4 gap-2" aria-label="Этапы подбора">
            <li v-for="(item, index) in steps" :key="item.title">
              <button
                type="button"
                class="flex w-full flex-col items-center gap-2 rounded-xl px-1 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                :class="index < step ? 'cursor-pointer' : 'cursor-default'"
                :disabled="index >= step"
                :aria-current="index === step ? 'step' : undefined"
                @click="goToStep(index)"
              >
                <span
                  class="step-dot"
                  :class="
                    index < step
                      ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-400'
                      : index === step
                        ? 'border-brand bg-brand text-space-950'
                        : 'border-white/15 bg-white/5 text-gray-500'
                  "
                >
                  <i v-if="index < step" class="fa-solid fa-check text-[10px]" aria-hidden="true"></i>
                  <span v-else>{{ index + 1 }}</span>
                </span>
                <span class="text-[10px] font-semibold sm:text-xs" :class="index === step ? 'text-white' : 'text-gray-500'">
                  {{ item.title }}
                </span>
              </button>
            </li>
          </ol>

          <div class="mb-5 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100" :aria-label="`Заполнено ${progress}%`">
            <div class="h-full rounded-full bg-brand transition-all duration-500" :style="{ width: `${progress}%` }"></div>
          </div>

          <form class="panel" novalidate @submit.prevent="step === steps.length - 1 ? submit() : nextStep()">
            <!-- 1. Цель -->
            <div v-if="step === 0" class="space-y-5">
              <div>
                <h2 class="text-lg font-bold text-white">Что хотите увидеть первым?</h2>
                <p class="mt-1 text-xs text-gray-400">От цели зависит светосила и тип монтировки.</p>
              </div>

              <fieldset>
                <legend class="sr-only">Цель наблюдений</legend>
                <div class="grid gap-3 sm:grid-cols-2">
                  <label
                    v-for="option in goals"
                    :key="option.value"
                    class="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all focus-within:ring-2 focus-within:ring-brand"
                    :class="form.goal === option.value ? 'border-brand bg-brand/10' : 'border-white/10 bg-white/5 hover:border-brand/30'"
                  >
                    <input
                      v-model="form.goal"
                      type="radio"
                      name="goal"
                      :value="option.value"
                      class="sr-only"
                      @change="markTouched('goal')"
                    />
                    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <i class="fa-solid" :class="option.icon" aria-hidden="true"></i>
                    </span>
                    <span class="min-w-0">
                      <span class="block text-sm font-semibold text-white">{{ option.label }}</span>
                      <span class="mt-0.5 block text-[11px] leading-relaxed text-gray-400">{{ option.text }}</span>
                    </span>
                  </label>
                </div>
                <p v-if="fieldError('goal')" class="field-error" role="alert">{{ fieldError('goal') }}</p>
              </fieldset>
            </div>

            <!-- 2. Условия -->
            <div v-else-if="step === 1" class="space-y-5">
              <div>
                <h2 class="text-lg font-bold text-white">Где будете наблюдать?</h2>
                <p class="mt-1 text-xs text-gray-400">Засветка и мобильность влияют на выбор модели.</p>
              </div>

              <fieldset>
                <legend class="sr-only">Место наблюдений</legend>
                <div class="space-y-3">
                  <label
                    v-for="option in locations"
                    :key="option.value"
                    class="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all focus-within:ring-2 focus-within:ring-brand"
                    :class="form.location === option.value ? 'border-brand bg-brand/10' : 'border-white/10 bg-white/5 hover:border-brand/30'"
                  >
                    <input
                      v-model="form.location"
                      type="radio"
                      name="location"
                      :value="option.value"
                      class="sr-only"
                      @change="markTouched('location')"
                    />
                    <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-space-950/60 text-xs text-brand">
                      <i class="fa-solid" :class="option.value === 'city' ? 'fa-city' : option.value === 'country' ? 'fa-house' : 'fa-car'" aria-hidden="true"></i>
                    </span>
                    <span class="min-w-0">
                      <span class="block text-sm font-semibold text-white">{{ option.label }}</span>
                      <span class="block text-[11px] text-gray-400">{{ option.text }}</span>
                    </span>
                  </label>
                </div>
                <p v-if="fieldError('location')" class="field-error" role="alert">{{ fieldError('location') }}</p>
              </fieldset>

              <div>
                <div class="mb-2 flex items-center justify-between gap-3">
                  <label for="budget" class="text-xs font-semibold text-gray-300">Бюджет</label>
                  <output for="budget" class="flex items-center text-sm font-bold text-white">
                    до {{ formatAmount(form.budget) }}<CurrencySign class="ml-1" />
                  </output>
                </div>
                <input
                  id="budget"
                  v-model.number="form.budget"
                  type="range"
                  min="1500"
                  max="12000"
                  step="100"
                  class="range-input"
                  aria-describedby="budget-hint"
                />
                <div class="mt-1 flex justify-between text-[10px] text-gray-500" id="budget-hint">
                  <span>1 500</span>
                  <span>12 000</span>
                </div>
              </div>
            </div>

            <!-- 3. Опыт -->
            <div v-else-if="step === 2" class="space-y-5">
              <div>
                <h2 class="text-lg font-bold text-white">Какой у вас опыт?</h2>
                <p class="mt-1 text-xs text-gray-400">Новичкам проще начать с азимутальной монтировки.</p>
              </div>

              <fieldset>
                <legend class="sr-only">Опыт наблюдений</legend>
                <div class="grid gap-3 sm:grid-cols-2">
                  <label
                    v-for="option in experiences"
                    :key="option.value"
                    class="cursor-pointer rounded-xl border p-4 transition-all focus-within:ring-2 focus-within:ring-brand"
                    :class="form.experience === option.value ? 'border-brand bg-brand/10' : 'border-white/10 bg-white/5 hover:border-brand/30'"
                  >
                    <input
                      v-model="form.experience"
                      type="radio"
                      name="experience"
                      :value="option.value"
                      class="sr-only"
                      @change="markTouched('experience')"
                    />
                    <span class="block text-sm font-semibold text-white">{{ option.label }}</span>
                    <span class="mt-0.5 block text-[11px] text-gray-400">{{ option.text }}</span>
                  </label>
                </div>
                <p v-if="fieldError('experience')" class="field-error" role="alert">{{ fieldError('experience') }}</p>
              </fieldset>

              <fieldset>
                <legend class="mb-2 text-xs font-semibold text-gray-300">Что важнее?</legend>
                <div class="flex flex-wrap gap-2">
                  <label
                    v-for="option in priorities"
                    :key="option.value"
                    class="chip cursor-pointer px-4 py-2 transition-colors focus-within:ring-2 focus-within:ring-brand"
                    :class="form.priority === option.value ? 'border-brand/40 bg-brand/10 text-brand' : 'hover:border-brand/30'"
                  >
                    <input v-model="form.priority" type="radio" name="priority" :value="option.value" class="sr-only" />
                    {{ option.label }}
                  </label>
                </div>
              </fieldset>
            </div>

            <!-- 4. Контакты -->
            <div v-else class="space-y-5">
              <div>
                <h2 class="text-lg font-bold text-white">Куда отправить рекомендацию?</h2>
                <p class="mt-1 text-xs text-gray-400">Гид свяжется с вами и поможет с настройкой.</p>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label for="selection-name" class="field-label">Имя</label>
                  <input
                    id="selection-name"
                    v-model="form.name"
                    type="text"
                    autocomplete="name"
                    placeholder="Как к вам обращаться"
                    class="field-input"
                    :class="fieldError('name') ? 'border-red-500' : ''"
                    :aria-invalid="Boolean(fieldError('name'))"
                    aria-describedby="selection-name-error"
                    @blur="markTouched('name')"
                  />
                  <p id="selection-name-error" class="field-error" role="alert">{{ fieldError('name') }}</p>
                </div>
                <div>
                  <label for="selection-contact" class="field-label">Email или телефон</label>
                  <input
                    id="selection-contact"
                    v-model="form.contact"
                    type="text"
                    autocomplete="email"
                    placeholder="you@example.com"
                    class="field-input"
                    :class="fieldError('contact') ? 'border-red-500' : ''"
                    :aria-invalid="Boolean(fieldError('contact'))"
                    aria-describedby="selection-contact-error"
                    @blur="markTouched('contact')"
                  />
                  <p id="selection-contact-error" class="field-error" role="alert">{{ fieldError('contact') }}</p>
                </div>
              </div>

              <div>
                <h3 class="mb-2 text-xs font-semibold text-gray-300">Проверьте ответы</h3>
                <dl class="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-xs sm:grid-cols-2">
                  <div v-for="item in summary" :key="item.label" class="flex items-center justify-between gap-3">
                    <dt class="text-gray-500">{{ item.label }}</dt>
                    <dd class="flex items-center text-right font-medium text-gray-200">
                      {{ item.value }}<CurrencySign v-if="item.money" class="ml-1" />
                    </dd>
                  </div>
                </dl>
              </div>

              <label class="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-gray-400 transition-colors hover:border-brand/30">
                <input
                  v-model="form.consent"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 rounded border-white/20 bg-space-950 text-brand focus:ring-2 focus:ring-brand/30"
                  @change="markTouched('consent')"
                />
                <span>Согласен с обработкой персональных данных и политикой конфиденциальности.</span>
              </label>
              <p v-if="fieldError('consent')" class="field-error" role="alert">{{ fieldError('consent') }}</p>
            </div>

            <div class="mt-6 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                class="btn-secondary w-full sm:w-auto"
                :disabled="step === 0"
                @click="prevStep"
              >
                <i class="fa-solid fa-arrow-left text-xs" aria-hidden="true"></i>
                Назад
              </button>

              <div class="flex w-full items-center gap-3 sm:w-auto">
                <span class="text-[11px] text-gray-500">Шаг {{ step + 1 }} из {{ steps.length }}</span>
                <button
                  type="submit"
                  class="btn-primary flex-1 sm:flex-none"
                  :disabled="sending"
                  :aria-busy="sending"
                >
                  <i v-if="sending" class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                  {{ step === steps.length - 1 ? (sending ? 'Подбираем…' : 'Получить рекомендацию') : 'Далее' }}
                  <i v-if="!sending && step < steps.length - 1" class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Сводка -->
        <aside class="lg:col-span-4" aria-label="Ваш профиль подбора">
          <div class="panel sticky top-24">
            <h2 class="text-sm font-bold text-white">Ваш профиль</h2>
            <p class="mt-1 text-[11px] text-gray-500">Заполняется по ходу подбора</p>
            <dl class="mt-4 space-y-3 text-xs">
              <div v-for="item in summary" :key="item.label" class="flex items-start justify-between gap-3">
                <dt class="shrink-0 text-gray-500">{{ item.label }}</dt>
                <dd class="flex items-center text-right font-medium text-gray-200">
                  {{ item.value }}<CurrencySign v-if="item.money" class="ml-1" />
                </dd>
              </div>
            </dl>
            <div class="mt-5 rounded-xl border border-white/10 bg-white/5 p-3">
              <p class="flex items-center gap-2 text-[11px] font-semibold text-white">
                <i class="fa-solid fa-circle-info text-brand" aria-hidden="true"></i>
                Подбор бесплатный
              </p>
              <p class="mt-1 text-[11px] leading-relaxed text-gray-500">
                Рекомендация не обязывает к покупке. Можно сравнить модели в каталоге.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>
