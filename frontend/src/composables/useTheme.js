import { ref } from 'vue'

const STORAGE_KEY = 'orbita-theme'
const initial =
  typeof document !== 'undefined' && document.documentElement.classList.contains('light')
    ? 'light'
    : 'dark'

const theme = ref(initial)

function applyTheme(value) {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.classList.toggle('dark', value === 'dark')
  root.classList.toggle('light', value === 'light')
}

function setTheme(value) {
  theme.value = value === 'light' ? 'light' : 'dark'
  applyTheme(theme.value)

  try {
    localStorage.setItem(STORAGE_KEY, theme.value)
  } catch (error) {
    /* localStorage может быть недоступен — тема всё равно применится. */
  }
}

function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

export function useTheme() {
  return { theme, setTheme, toggleTheme }
}
