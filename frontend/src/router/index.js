import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/catalog', name: 'catalog', component: () => import('@/views/CatalogView.vue') },
  { path: '/cart', name: 'cart', component: () => import('@/views/CartView.vue') },
  { path: '/selection', name: 'selection', component: () => import('@/views/SelectionView.vue') },
  { path: '/services', name: 'services', component: () => import('@/views/ServicesView.vue') },
  { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
  { path: '/support', name: 'support', component: () => import('@/views/SupportView.vue') },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/ForgotPasswordView.vue'),
  },
  {
    path: '/password-reset/:token',
    name: 'password-reset',
    component: () => import('@/views/ResetPasswordView.vue'),
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('@/views/admin/AdminOrdersView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('@/views/ProductsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/import',
    name: 'admin-import',
    component: () => import('@/views/ImportView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/files',
    name: 'admin-files',
    component: () => import('@/views/FilesView.vue'),
    meta: { requiresAuth: true },
  },

  // Старые адреса: сохраняем внешние ссылки, но ведём на живые страницы.
  { path: '/lab', redirect: { name: 'home' } },
  { path: '/lab/level-1', redirect: { name: 'about' } },
  { path: '/lab/level-2', redirect: { name: 'services' } },
  { path: '/lab/level-3', redirect: { name: 'support' } },
  { path: '/lab/level-4', redirect: { name: 'selection' } },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 88 }
    }

    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && token) {
    return { name: 'home' }
  }

  return true
})

const titles = {
  home: 'Орбита — телескопы и оптика',
  catalog: 'Каталог телескопов — Орбита',
  cart: 'Корзина — Орбита',
  selection: 'Подбор телескопа — Орбита',
  services: 'Услуги, доставка и гарантия — Орбита',
  about: 'О магазине — Орбита',
  support: 'Поддержка — Орбита',
  login: 'Вход — Орбита',
  register: 'Регистрация — Орбита',
  'forgot-password': 'Восстановление пароля — Орбита',
  'password-reset': 'Новый пароль — Орбита',
  admin: 'Обзор магазина — Орбита',
  'admin-orders': 'Заказы — Орбита',
  'admin-products': 'Товары — Орбита',
  'admin-import': 'Импорт из Excel — Орбита',
  'admin-files': 'Файлы — Орбита',
  'not-found': 'Страница не найдена — Орбита',
}

router.afterEach((to) => {
  document.title = titles[to.name] ?? 'Орбита — телескопы и оптика'
})

// Если dev-сервер перезапустился между кликом и загрузкой lazy-чанка,
// один раз автоматически перезагружаем маршрут вместо пустого экрана.
const CHUNK_RETRY_KEY = 'orbita-chunk-retry'

router.onError((error, to) => {
  const message = String(error?.message || '')

  if (!message.includes('Failed to fetch dynamically imported module')) {
    return
  }

  const lastRetry = Number(sessionStorage.getItem(CHUNK_RETRY_KEY) || 0)

  if (Date.now() - lastRetry < 10000) {
    return
  }

  sessionStorage.setItem(CHUNK_RETRY_KEY, String(Date.now()))
  window.location.assign(to?.fullPath || window.location.pathname)
})

export default router
