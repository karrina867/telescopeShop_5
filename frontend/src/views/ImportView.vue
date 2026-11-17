<script setup>
import { computed, ref } from 'vue'
import http from '@/api/http'
import { addFile } from '@/utils/fileStore'
import { parseWorkbook, toBase64, validateRows } from '@/utils/excel'
import AdminShell from '@/components/admin/AdminShell.vue'

const rows = ref([])
const fileName = ref('')
const loadingFile = ref(false)
const loadingTemplate = ref(false)
const importing = ref(false)
const result = ref(null)
const error = ref('')

const validations = computed(() => validateRows(rows.value))
const validRows = computed(() => validations.value.filter((v) => !v.problems.length).map((v) => v.row))
const invalidCount = computed(() => validations.value.filter((v) => v.problems.length).length)

async function downloadTemplate() {
  if (loadingTemplate.value) {
    return
  }

  loadingTemplate.value = true
  error.value = ''

  try {
    const module = await import('xlsx')
    const XLSX = module.default ?? module
    const example = [
      {
        'Название': 'Орбита Start 70 AZ',
        'Категория': 'Рефракторы',
        'Тип': 'Рефрактор',
        'Апертура (мм)': 70,
        'Фокус (мм)': 700,
        'Монтировка': 'AZ',
        'Увеличение': 140,
        'Цена': 1899,
        'Количество': 5,
        'Описание': 'Отличный выбор для первого телескопа',
      },
    ]
    const sheet = XLSX.utils.json_to_sheet(example)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, 'Товары')
    XLSX.writeFile(workbook, 'orbita-import-template.xlsx')
  } catch (e) {
    error.value = 'Не удалось подготовить шаблон. Обновите страницу и попробуйте снова.'
  } finally {
    loadingTemplate.value = false
  }
}

async function handleFile(event) {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  loadingFile.value = true
  error.value = ''
  result.value = null

  try {
    const buffer = await file.arrayBuffer()
    const parsed = await parseWorkbook(buffer)
    rows.value = parsed
    fileName.value = file.name

    const base64 = await toBase64(file)
    addFile({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
      rowsCount: parsed.length,
      uploadedAt: new Date().toISOString(),
      content: base64,
    })
  } catch (e) {
    error.value = 'Не удалось прочитать файл. Убедитесь, что это корректный .xlsx или .xls.'
  } finally {
    loadingFile.value = false
    event.target.value = ''
  }
}

async function runImport() {
  if (!validRows.value.length) {
    return
  }

  importing.value = true
  error.value = ''
  result.value = null

  try {
    const { data } = await http.post('/imports', {
      file_name: fileName.value,
      rows: validRows.value,
    })
    result.value = data
  } catch (e) {
    if (e.response?.status === 422) {
      error.value = 'Сервер отклонил часть данных. Проверьте таблицу.'
    } else {
      error.value = 'Не удалось выполнить импорт.'
    }
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <AdminShell title="Импорт из Excel">
    <div class="mb-8">
      <p class="max-w-3xl text-sm text-gray-400 sm:text-base">
        Файл обрабатывается в браузере (SheetJS) и сохраняется в локальное хранилище браузера.
        На сервер отправляются уже разобранные строки.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div class="lg:col-span-5">
        <div class="h-full rounded-panel border border-white/10 bg-space-800/65 p-6 backdrop-blur-md">
          <h2 class="text-lg font-bold text-white">1. Выберите файл</h2>
          <p class="mb-4 mt-1 text-xs text-gray-400">Поддерживаются форматы .xlsx и .xls.</p>

          <input
            id="excelFile"
            type="file"
            class="sr-only"
            accept=".xlsx,.xls"
            @change="handleFile"
          />
          <label
            for="excelFile"
            class="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-white/20 bg-space-950/60 px-4 py-3 text-sm text-gray-400 transition-colors hover:border-brand/50 hover:text-white"
          >
            <span class="truncate">{{ fileName || 'Выбрать .xlsx' }}</span>
            <i class="fa-solid fa-folder-open text-brand"></i>
          </label>

          <button
            type="button"
            class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand/40 px-4 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loadingTemplate"
            :aria-busy="loadingTemplate"
            @click="downloadTemplate"
          >
            <i class="fa-solid" :class="loadingTemplate ? 'fa-spinner fa-spin' : 'fa-download'" aria-hidden="true"></i>
            {{ loadingTemplate ? 'Готовим шаблон…' : 'Скачать шаблон' }}
          </button>

          <div v-if="loadingFile" class="mt-4 text-sm text-gray-400">
            <i class="fa-solid fa-spinner fa-spin mr-1"></i> Чтение файла…
          </div>

          <div v-if="rows.length" class="mt-4 text-sm text-gray-400">
            Строк: <strong class="text-white">{{ rows.length }}</strong> ·
            корректных: <strong class="text-emerald-400">{{ validRows.length }}</strong> ·
            с ошибками: <strong class="text-red-400">{{ invalidCount }}</strong>
          </div>
        </div>
      </div>

      <div class="lg:col-span-7">
        <div class="h-full rounded-panel border border-white/10 bg-space-800/65 p-6 backdrop-blur-md">
          <h2 class="text-lg font-bold text-white">2. Проверьте и импортируйте</h2>
          <p class="mb-4 mt-1 text-xs text-gray-400">
            Обязательные поля: «Название», «Цена», «Количество». Категория создаётся автоматически.
          </p>

          <div
            v-if="error"
            class="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {{ error }}
          </div>
          <div
            v-if="result"
            class="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            {{ result.message }}
          </div>

          <button
            type="button"
            :disabled="!validRows.length || importing"
            class="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-space-950 transition-all hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-glow-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            @click="runImport"
          >
            <i v-if="importing" class="fa-solid fa-spinner fa-spin mr-2"></i>
            Импортировать {{ validRows.length }} строк
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="validations.length"
      class="mt-6 overflow-hidden rounded-panel border border-white/10 bg-space-800/65 backdrop-blur-md"
    >
      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px] text-left text-sm">
          <thead class="border-b border-white/10 text-[11px] uppercase tracking-wider text-gray-400">
            <tr>
              <th class="px-4 py-3 font-semibold">#</th>
              <th class="px-4 py-3 font-semibold">Название</th>
              <th class="px-4 py-3 font-semibold">Категория</th>
              <th class="px-4 py-3 font-semibold">Цена</th>
              <th class="px-4 py-3 font-semibold">Кол-во</th>
              <th class="px-4 py-3 font-semibold">Статус</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr
              v-for="item in validations"
              :key="item.index"
              class="transition-colors hover:bg-brand/5"
            >
              <td class="px-4 py-3 text-gray-500">{{ item.index }}</td>
              <td class="px-4 py-3 font-medium text-white">{{ item.row.name || '—' }}</td>
              <td class="px-4 py-3 text-gray-400">{{ item.row.category || '—' }}</td>
              <td class="px-4 py-3 text-gray-300">{{ item.row.price ?? '—' }}</td>
              <td class="px-4 py-3 text-gray-300">{{ item.row.stock ?? '—' }}</td>
              <td class="px-4 py-3">
                <span
                  v-if="!item.problems.length"
                  class="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300"
                >
                  ОК
                </span>
                <span
                  v-else
                  class="inline-flex rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-300"
                >
                  {{ item.problems.join(', ') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminShell>
</template>
