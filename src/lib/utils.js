// Format date to YYYY-MM-DD
export const formatDate = (date = new Date()) => {
  return date.toISOString().split('T')[0]
}

// Get today's date in YYYY-MM-DD format
export const getToday = () => formatDate(new Date())

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
