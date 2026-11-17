<script setup>
import { onMounted, ref } from 'vue'
import { clearFiles, getFiles, removeFile } from '@/utils/fileStore'
import AdminShell from '@/components/admin/AdminShell.vue'

const files = ref([])

function load() {
  files.value = getFiles()
}

function formatSize(bytes) {
  if (!bytes) {
    return '0 Б'
  }

  const units = ['Б', 'КБ', 'МБ']
  const index = Math.floor(Math.log(bytes) / Math.log(1024))

  return `${(bytes / 1024 ** index).toFixed(1)} ${units[index]}`
}

function humanDate(value) {
  return new Date(value).toLocaleString('ru-RU')
}

function download(file) {
  const link = document.createElement('a')
  link.href = file.content
  link.download = file.name
  link.click()
}

function remove(id) {
  if (!window.confirm('Удалить файл из хранилища?')) {
    return
  }

  files.value = removeFile(id)
}

function clearAll() {
  if (!window.confirm('Удалить все файлы из хранилища?')) {
    return
  }

  files.value = clearFiles()
}

onMounted(load)
</script>

<template>
  <AdminShell title="Загруженные файлы">
    <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <p class="max-w-2xl text-sm text-gray-400">
        История загрузок из Excel: предпросмотр и удаление файлов.
      </p>
      <button
        v-if="files.length"
        type="button"
        class="inline-flex items-center justify-center rounded-full border border-red-400/30 px-5 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10"
        @click="clearAll"
      >
        Очистить всё
      </button>
    </div>

    <div
      v-if="!files.length"
      class="rounded-panel border border-white/10 bg-white/5 px-6 py-8 text-center text-sm text-gray-400"
    >
      Файлы ещё не загружались. Перейдите в раздел «Импорт Excel».
    </div>

    <div v-else class="overflow-hidden rounded-panel border border-white/10 bg-space-800/65 backdrop-blur-md">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px] text-left text-sm">
          <thead class="border-b border-white/10 text-[11px] uppercase tracking-wider text-gray-400">
            <tr>
              <th class="px-4 py-3 font-semibold">Файл</th>
              <th class="px-4 py-3 font-semibold">Строк</th>
              <th class="px-4 py-3 font-semibold">Размер</th>
              <th class="px-4 py-3 font-semibold">Загружен</th>
              <th class="px-4 py-3 text-right font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr
              v-for="file in files"
              :key="file.id"
              class="transition-colors hover:bg-brand/5"
            >
              <td class="px-4 py-3 font-medium text-white">{{ file.name }}</td>
              <td class="px-4 py-3 text-gray-400">{{ file.rowsCount }}</td>
              <td class="px-4 py-3 text-gray-400">{{ formatSize(file.size) }}</td>
              <td class="px-4 py-3 text-xs text-gray-400">{{ humanDate(file.uploadedAt) }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-right">
                <button
                  type="button"
                  class="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand/30 text-brand transition-colors hover:bg-brand/10"
                  aria-label="Скачать"
                  @click="download(file)"
                >
                  <i class="fa-solid fa-download text-xs"></i>
                </button>
                <button
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/30 text-red-300 transition-colors hover:bg-red-500/10"
                  aria-label="Удалить"
                  @click="remove(file.id)"
                >
                  <i class="fa-solid fa-trash text-xs"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminShell>
</template>
