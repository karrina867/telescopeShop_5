// Демо-каталог для статической публикации.
//
// На Cloudflare Pages (и любом другом статическом хостинге) нет Laravel и MySQL,
// поэтому витрина не может получить товары из API. В production-сборке эти данные
// подставляются вместо ответов `/api/v1/products`, `/api/v1/categories` и
// `/api/v1/products/meta`. В dev-режиме запросы по-прежнему идут в реальный backend.
//
// Значения совпадают с `backend/database/seeders/DemoProductSeeder.php`.

export const demoCategories = [
  { id: 1, name: 'Рефракторы', slug: 'refraktory' },
  { id: 2, name: 'Рефлекторы', slug: 'reflektory' },
  { id: 3, name: 'Добсонианцы', slug: 'dobsoniantsy' },
]

export const demoProducts = [
  {
    id: 1,
    category_id: 1,
    name: 'Орбита Start 70 AZ',
    type: 'Рефрактор',
    aperture_mm: 70,
    focal_mm: 700,
    mount: 'AZ',
    max_magnification: 140,
    price: 1899,
    stock: 5,
    description: 'Отличный выбор для первого телескопа.',
    created_at: '2026-10-19T20:00:01.000000Z',
    updated_at: '2026-10-19T20:00:01.000000Z',
  },
  {
    id: 2,
    category_id: 1,
    name: 'Орбита Luna 90 EQ',
    type: 'Рефрактор',
    aperture_mm: 90,
    focal_mm: 900,
    mount: 'EQ',
    max_magnification: 180,
    price: 3400,
    stock: 4,
    description: 'Экваториальная монтировка для детальных наблюдений Луны и планет.',
    created_at: '2026-10-19T20:00:02.000000Z',
    updated_at: '2026-10-19T20:00:02.000000Z',
  },
  {
    id: 3,
    category_id: 2,
    name: 'Орбита DeepSky 130',
    type: 'Рефлектор',
    aperture_mm: 130,
    focal_mm: 650,
    mount: 'EQ',
    max_magnification: 260,
    price: 4600,
    stock: 3,
    description: 'Параболическое зеркало для туманностей и галактик.',
    created_at: '2026-10-19T20:00:03.000000Z',
    updated_at: '2026-10-19T20:00:03.000000Z',
  },
  {
    id: 4,
    category_id: 3,
    name: 'Орбита Pro 200 Dob',
    type: 'Добсон',
    aperture_mm: 200,
    focal_mm: 1200,
    mount: 'Dob',
    max_magnification: 400,
    price: 7990,
    stock: 2,
    description: 'Максимум деталей для тёмного загородного неба.',
    created_at: '2026-10-19T20:00:04.000000Z',
    updated_at: '2026-10-19T20:00:04.000000Z',
  },
]
