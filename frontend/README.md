# Frontend — Орбита

Vue 3 + Vite + Tailwind CSS v4.

```bat
npm.cmd install
npm.cmd run dev      :: http://127.0.0.1:5173
npm.cmd run build    :: production build in dist/
```

Полные инструкции по запуску всего проекта — в [`../README.md`](../README.md).
Сравнение Bootstrap и Tailwind — в [`../docs/TAILWIND_VS_BOOTSTRAP.md`](../docs/TAILWIND_VS_BOOTSTRAP.md).

## CSS и дизайн-система

CSS разделён на два файла:

- `src/style.css` — точка входа:
  - `@import 'tailwindcss'` и `@import './styles/components.css'`;
  - дизайн-токены в `@theme` (цвета `space-*`, `brand`, семантические
    `success`/`warning`/`danger`/`info`, шрифты, радиусы, тени, контейнер);
  - `@custom-variant dark` и `@custom-variant light` — классовая смена темы;
  - переопределение токенов для `html.light`, `@font-face` для шрифта
    `Untitled1`, базовые стили `body`/скроллбара в `@layer base`,
    утилиты `stars-bg` в `@utility`.
- `src/styles/components.css` — компонентный слой `@layer components`:
  `.btn-*`, `.field-input`, `.field-error`, `.chip`, `.panel`, `.page-shell`,
  `.data-table`, `.chat-*`, `.kanban-*`, `.stat-card`, `.skeleton`, `.step-dot`,
  `.faq-*` и другие повторяющиеся наборы классов через `@apply`.

В разметке используются утилиты Tailwind и варианты `sm:`, `md:`, `lg:`,
`xl:`, `hover:`, `focus-visible:`, `active:`, `disabled:`, `group-*`,
`peer-*`, `data-*`, `has-*`, `@container`.

> В Tailwind v4 нет `tailwind.config.js`: токены задаются в `@theme`, а
> классовая тёмная тема — через `@custom-variant dark`, что заменяет
> `darkMode: 'class'` из v3 с тем же поведением.

## Страницы и компоненты

| Маршрут | Основные файлы |
| --- | --- |
| `/` | `views/HomeView.vue`, `components/ProductCard.vue` |
| `/catalog` | `views/CatalogView.vue` |
| `/cart` | `views/CartView.vue`, `stores/cart.js` |
| `/selection` | `views/SelectionView.vue` |
| `/services` | `views/ServicesView.vue` |
| `/about` | `views/AboutView.vue` |
| `/support` | `views/SupportView.vue` |
| `/login`, `/register` | `views/LoginView.vue`, `views/RegisterView.vue` |
| `/admin`, `/admin/orders`, `/admin/products`, `/admin/import`, `/admin/files` | `views/admin/AdminDashboardView.vue`, `views/AdminOrdersView` и др. через `components/admin/AdminShell.vue` |

Общие элементы — `components/AppNavbar.vue` (публичная навигация, меню
пользователя, переключатель темы, мобильное меню), `components/AppFooter.vue`,
`components/CurrencySign.vue` и `components/PriceTag.vue`.

## Темы

`src/composables/useTheme.js` хранит тему в `localStorage` (`orbita-theme`),
ставит класс `dark` или `light` на `<html>` и синхронизирует состояние между
всеми переключателями. Начальная тема применяется inline-скриптом в
`index.html` до загрузки приложения, чтобы не было вспышки светлого фона.

## Валютный знак

Все цены рендерит `PriceTag` → `CurrencySign`: знак набран фирменным шрифтом
`Untitled1` (в `@theme` это `--font-display`), а рядом находится скрытый от
экрана текст «руб.». Поэтому цены нельзя писать вручную строкой — только через
эти компоненты.

## Корзина и заказы

Корзина живёт целиком на фронтенде: Pinia-хранилище `src/stores/cart.js` хранит
позиции в `localStorage` под ключом `orbita-cart`, ограничивает количество
складским остатком и показывает уведомления. Оформление на `/cart` — демо:
заказ получает номер вида `ORB-…`, корзина очищается, данные никуда не
отправляются. Счётчик товаров виден в навбаре и мобильном меню.

Оформленный заказ записывается в `src/stores/orders.js` (`localStorage`,
ключ `orbita-orders`) и появляется в админской доске `/admin/orders`
в колонке «Новые» с пометкой «С сайта». Перемещение карточек между колонками
тоже сохраняется в браузере; демо-заказы показываются при первом открытии.

## Админ-раздел

Маршруты `/admin*` защищены метаданными `requiresAuth` в `src/router/index.js`
и обёрнуты в `AdminShell` с боковым меню. Сайтовый футер на этих страницах
скрыт. Импорт Excel выполняется в браузере через SheetJS, затем разобранные
строки отправляются в API. Библиотека `xlsx` подгружается по требованию
(при выборе файла или скачивании шаблона), поэтому вкладка импорта открывается
сразу; в `vite.config.js` она добавлена в `optimizeDeps.include`, а lazy-чанки
защищены повтором навигации в `router.onError`.
