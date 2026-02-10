import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import useAppStore from '../stores/appStore'
import { useAuthStore } from '../stores/authStore'
import { supabase, isSupabaseConfigured, toAuthIdentifier } from '../lib/supabase'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import NutritoLogo from '../components/NutritoLogo'

export default function Login() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const initializeData = useAppStore((state) => state.initializeData)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isSupabaseConfigured()) {
      setError('Supabase yapılandırılmamış.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const email = toAuthIdentifier(username)
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      setUser(data.user)
      await initializeData()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || 'Giriş başarısız.')
    } finally {
      setLoading(false)
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <Card>
          <CardContent style={{ padding: '2rem', textAlign: 'center' }}>
            <p className="text-[var(--text-secondary)]">Bu uygulama giriş için Supabase gerektirir. Lütfen yapılandırın.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', gap: '2rem' }}>
      <NutritoLogo size="lg" />
      <Card style={{ width: '100%', maxWidth: '24rem' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn size={24} className="text-[var(--accent)]" />
            Giriş Yap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Kullanıcı adı"
              type="text"
              value={username}
              onChange={setUsername}
              placeholder="kullanici_adi"
              autoComplete="username"
              required
            />
            <Input
              label="Şifre"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
