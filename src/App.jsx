import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Exchanges from './pages/Exchanges'
import Recipes from './pages/Recipes'
import Units from './pages/Units'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { useAuthStore, subscribeAuth } from './stores/authStore'
import useAppStore from './stores/appStore'
import { isSupabaseConfigured } from './lib/supabase'

function App() {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const initSession = useAuthStore((state) => state.initSession)
  const initializeData = useAppStore((state) => state.initializeData)

  useEffect(() => {
    initSession()
  }, [initSession])

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    return subscribeAuth((u) => {
      useAuthStore.getState().setUser(u)
      if (u) initializeData()
    })
  }, [initializeData])

  const requireAuth = isSupabaseConfigured()
  const isAuthenticated = !requireAuth || !!user

  if (loading && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text-secondary)]">
        Yükleniyor...
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="exchanges" element={<Exchanges />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="units" element={<Units />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
