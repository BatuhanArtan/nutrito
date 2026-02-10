import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  initSession: async () => {
    if (!isSupabaseConfigured()) {
      set({ user: null, loading: false })
      return
    }
    set({ loading: true })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ user: session?.user ?? null, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut()
    set({ user: null })
  }
}))

// Supabase auth state listener'ı uygulama başında bir kez kaydetmek için
export const subscribeAuth = (callback) => {
  if (!supabase) return () => {}
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => subscription.unsubscribe()
}
