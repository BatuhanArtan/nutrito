// Format date to YYYY-MM-DD
export const formatDate = (date = new Date()) => {
  return date.toISOString().split('T')[0]
}

// Get today's date in YYYY-MM-DD format
export const getToday = () => formatDate(new Date())

// Normalize any date value to YYYY-MM-DD (Supabase/ISO uyumu için)
export const toDateStr = (d) => {
  if (!d) return ''
  if (typeof d === 'string') return d.slice(0, 10)
  if (typeof d.toISOString === 'function') return d.toISOString().slice(0, 10)
  return String(d).slice(0, 10)
}

// Yerel tarih olarak YYYY-MM-DD (timezone kayması olmadan)
export const toLocalDateStr = (date) => {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Parse date string to Date object
export const parseDate = (dateString) => {
  return new Date(dateString + 'T00:00:00')
}

// Format date for display (Turkish locale)
export const formatDisplayDate = (dateString) => {
  const date = parseDate(dateString)
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

// Meal type labels
export const mealTypeLabels = {
  breakfast: 'Kahvaltı',
  lunch: 'Öğle',
  snack: 'Ara Öğün',
  dinner: 'Akşam'
}

// Meal type order for sorting
export const mealTypeOrder = ['breakfast', 'lunch', 'snack', 'dinner']

// Varsayılan birimler (silinemez, sistemde her zaman bulunur)
export const DEFAULT_UNITS = [
  { id: 'unit_bardak', name: 'Bardak', abbreviation: 'brd' },
  { id: 'unit_yk', name: 'Yemek Kaşığı', abbreviation: 'yk' },
  { id: 'unit_tk', name: 'Tatlı Kaşığı', abbreviation: 'tk' },
  { id: 'unit_ck', name: 'Çay Kaşığı', abbreviation: 'çk' },
  { id: 'unit_kase', name: 'Kase', abbreviation: 'kase' },
  { id: 'unit_adet', name: 'Adet', abbreviation: 'adet' },
  { id: 'unit_avuc', name: 'Avuç', abbreviation: 'avuç' },
  { id: 'unit_gram', name: 'Gram', abbreviation: 'g' },
  { id: 'unit_dilim', name: 'Dilim', abbreviation: 'dilim' },
  { id: 'unit_porsiyon', name: 'Porsiyon', abbreviation: 'prs' }
]
export const DEFAULT_UNIT_IDS = new Set(DEFAULT_UNITS.map((u) => u.id))

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Debounce function
export const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Class name helper
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
