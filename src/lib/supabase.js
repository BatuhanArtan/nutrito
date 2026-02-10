import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Only create client if configured
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper: Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase)
}

// Kullanıcı adı → Supabase Auth identifier (e-posta formatı gerekli; gerçek mail gönderilmez)
// .local geçersiz sayılıyor, geçerli TLD kullanıyoruz (mail gönderilmez)
const AUTH_DOMAIN = 'nutrito.app'
export const toAuthIdentifier = (input) => {
  const s = (input || '').trim()
  return s.includes('@') ? s : `${s}@${AUTH_DOMAIN}`
}
export const displayUsername = (email) => {
  if (!email) return ''
  return email.endsWith(`@${AUTH_DOMAIN}`) ? email.slice(0, -AUTH_DOMAIN.length - 1) : email
}
