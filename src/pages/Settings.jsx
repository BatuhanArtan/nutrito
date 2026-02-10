import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Trash2, Download, Upload, Droplets, CloudUpload, LogOut } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import useAppStore from '../stores/appStore'
import { useAuthStore } from '../stores/authStore'
import { isSupabaseConfigured, displayUsername } from '../lib/supabase'

export default function Settings() {
  const navigate = useNavigate()
  const [exportStatus, setExportStatus] = useState('')
  const [pushStatus, setPushStatus] = useState('')
  const [pushLoading, setPushLoading] = useState(false)

  const store = useAppStore()
  const pushLocalDataToSupabase = useAppStore((state) => state.pushLocalDataToSupabase)
  const clearUserData = useAppStore((state) => state.clearUserData)
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const waterTargetDefault = useAppStore((state) => state.waterTargetDefault)
  const setWaterTargetDefault = useAppStore((state) => state.setWaterTargetDefault)
  const waterGlassVolumeMl = useAppStore((state) => state.waterGlassVolumeMl)
  const setWaterGlassVolumeMl = useAppStore((state) => state.setWaterGlassVolumeMl)

  const handleExport = () => {
    const data = {
      units: store.units,
      foods: store.foods,
      exchanges: store.exchanges,
      recipes: store.recipes,
      recipeCategories: store.recipeCategories,
      dailyMeals: store.dailyMeals,
      mealItems: store.mealItems,
      waterLogs: store.waterLogs,
      weightLogs: store.weightLogs,
      waterTargetDefault: store.waterTargetDefault,
      waterGlassVolumeMl: store.waterGlassVolumeMl
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nutrito-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportStatus('Veriler başarıyla indirildi!')
    setTimeout(() => setExportStatus(''), 3000)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result)
        if (data.units) store.setUnits(data.units)
        if (data.foods) store.setFoods(data.foods)
        if (data.exchanges) store.setExchanges(data.exchanges)
        if (data.recipes) store.setRecipes(data.recipes)
        if (data.recipeCategories) store.setRecipeCategories(data.recipeCategories)
        if (data.dailyMeals) store.setDailyMeals(data.dailyMeals)
        if (data.mealItems) store.setMealItems(data.mealItems)
        if (data.waterLogs) store.setWaterLogs(data.waterLogs)
        if (data.weightLogs) store.setWeightLogs(data.weightLogs)
        if (typeof data.waterTargetDefault === 'number') store.setWaterTargetDefault(data.waterTargetDefault)
        if (typeof data.waterGlassVolumeMl === 'number') store.setWaterGlassVolumeMl(data.waterGlassVolumeMl)
        setExportStatus('Veriler başarıyla yüklendi!')
        setTimeout(() => setExportStatus(''), 3000)
      } catch (error) {
        setExportStatus('Dosya okunamadı!')
        setTimeout(() => setExportStatus(''), 3000)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handlePushToSupabase = async () => {
    if (!isSupabaseConfigured()) return
    setPushLoading(true)
    setPushStatus('')
    try {
      await pushLocalDataToSupabase()
      setPushStatus('Yerel veriler Supabase\'e aktarıldı.')
      setTimeout(() => setPushStatus(''), 4000)
    } catch (err) {
      setPushStatus(err?.message || 'Aktarım başarısız.')
      setTimeout(() => setPushStatus(''), 5000)
    }
    setPushLoading(false)
  }

  const handleClearData = () => {
    if (confirm('Tüm veriler silinecek. Emin misiniz?')) {
      store.setUnits([])
      store.setFoods([])
      store.setExchanges([])
      store.setRecipes([])
      store.setRecipeCategories([])
      store.setDailyMeals([])
      store.setMealItems([])
      store.setWaterLogs([])
      store.setWeightLogs([])
      localStorage.removeItem('nutrito-storage')
      setExportStatus('Tüm veriler silindi!')
      setTimeout(() => setExportStatus(''), 3000)
    }
  }

  const handleSignOut = async () => {
    clearUserData()
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Ayarlar</h1>

      {isSupabaseConfigured() && user && (
        <Card>
          <CardHeader>
            <CardTitle>Hesap</CardTitle>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p className="text-sm text-[var(--text-secondary)]">{displayUsername(user.email)}</p>
            <Button
              variant="secondary"
              onClick={handleSignOut}
              style={{ alignSelf: 'flex-start', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            >
              <LogOut size={18} style={{ marginRight: '0.5rem' }} />
              Çıkış Yap
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            Veritabanı Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              className={`w-3 h-3 rounded-full ${
                isSupabaseConfigured() ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'
              }`}
            />
            <span className="text-[var(--text-secondary)]">
              {isSupabaseConfigured()
                ? 'Supabase bağlı'
                : 'Sadece yerel depolama (Supabase yapılandırılmadı)'}
            </span>
          </div>
          {!isSupabaseConfigured() && (
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Supabase bağlantısı için .env dosyasında VITE_SUPABASE_URL ve
              VITE_SUPABASE_ANON_KEY değerlerini tanımlayın.
            </p>
          )}
          {isSupabaseConfigured() && (
            <div style={{ marginTop: '1rem' }}>
              <Button
                variant="secondary"
                onClick={handlePushToSupabase}
                disabled={pushLoading}
                style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
              >
                <CloudUpload size={18} style={{ marginRight: '0.5rem' }} />
                {pushLoading ? 'Aktarılıyor...' : 'Yerel verileri Supabase\'e aktar'}
              </Button>
              {pushStatus && (
                <p className={`text-sm mt-2 ${pushStatus.startsWith('Yerel') ? 'text-[var(--success)]' : 'text-red-400'}`}>
                  {pushStatus}
                </p>
              )}
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                İlk bağlantıda veya yerel verileri buluta taşımak için bir kez tıklayın.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Veri Yönetimi</CardTitle>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {exportStatus && (
            <p className="text-sm text-[var(--success)]">{exportStatus}</p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Button
              onClick={handleExport}
              style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            >
              <Download size={18} />
              Verileri İndir
            </Button>

            <label className="cursor-pointer" style={{ display: 'inline-block' }}>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <span
                className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 bg-[var(--bg-tertiary)] hover:bg-[#3a3a3a] text-[var(--text-primary)] cursor-pointer"
                style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
              >
                <Upload size={18} />
                Verileri Yükle
              </span>
            </label>

            <Button
              variant="danger"
              onClick={handleClearData}
              style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            >
              <Trash2 size={18} />
              Tüm Verileri Sil
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets size={20} className="text-blue-400" />
            Su Takibi Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="text-sm text-[var(--text-secondary)]">Günlük hedef (bardak)</label>
            <input
              type="number"
              min={1}
              max={99}
              value={waterTargetDefault}
              onChange={(e) => setWaterTargetDefault(e.target.value)}
              className="bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent)] transition-colors w-24"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="text-sm text-[var(--text-secondary)]">Bir bardak hacmi (ml)</label>
            <input
              type="number"
              min={50}
              max={500}
              value={waterGlassVolumeMl}
              onChange={(e) => setWaterGlassVolumeMl(e.target.value)}
              className="bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent)] transition-colors w-24"
            />
            <p className="text-xs text-[var(--text-secondary)]">
              Su ekranında bardak ve litre birlikte gösterilir (örn. 8×200ml = 1,6 L).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hakkında</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--text-secondary)]">
            Nutrito - Kişisel diyet ve beslenme takip uygulaması
          </p>
          <p className="text-sm text-[var(--text-secondary)]" style={{ marginTop: '0.5rem' }}>
            Versiyon 1.0.0
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
