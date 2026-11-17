function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return value
  }

  const normalized = String(value).replace(/\s/g, '').replace(',', '.')
  const parsed = Number(normalized)

  return Number.isNaN(parsed) ? null : parsed
}

function toInt(value) {
  const num = toNumber(value)

  return num === null ? null : Math.round(num)
}

function pick(raw, keys) {
  const map = {}

  for (const key of Object.keys(raw)) {
    map[key.trim().toLowerCase()] = raw[key]
  }

  for (const key of keys) {
    const value = map[key.toLowerCase()]

    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return null
}

export function mapRow(raw) {
  const name = pick(raw, ['Название', 'name', 'Наименование'])

  return {
    name: name === null ? '' : String(name).trim(),
    category: pick(raw, ['Категория', 'category']),
    type: pick(raw, ['Тип', 'type']),
    aperture_mm: toInt(pick(raw, ['Апертура (мм)', 'Апертура', 'aperture_mm', 'aperture'])),
    focal_mm: toInt(pick(raw, ['Фокус (мм)', 'Фокус', 'focal_mm', 'focal'])),
    mount: pick(raw, ['Монтировка', 'mount']),
    max_magnification: toInt(pick(raw, ['Увеличение', 'Максимальное увеличение', 'max_magnification'])),
    price: toNumber(pick(raw, ['Цена', 'price'])),
    stock: toInt(pick(raw, ['Количество', 'stock'])),
    description: pick(raw, ['Описание', 'description']),
  }
}

export async function parseWorkbook(arrayBuffer) {
  const module = await import('xlsx')
  const XLSX = module.default ?? module
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true })

  return raw.map(mapRow)
}

export function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function validateRows(rows) {
  return rows.map((row, index) => {
    const problems = []

    if (!row.name) {
      problems.push('нет названия')
    }

    if (row.price === null) {
      problems.push('нет цены')
    }

    if (row.stock === null) {
      problems.push('нет количества')
    }

    return { index: index + 1, row, problems }
  })
}
