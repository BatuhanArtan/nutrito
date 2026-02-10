import { useState } from 'react'
import { Database, Trash2, Download, Upload } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import useAppStore from '../stores/appStore'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Settings() {
  const [exportStatus, setExportStatus] = useState('')

  const store = useAppStore()

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
      weightLogs: store.weightLogs
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Ayarlar</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            Veritabanı Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Veri Yönetimi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {exportStatus && (
            <p className="text-sm text-[var(--success)]">{exportStatus}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExport}>
              <Download size={18} />
              Verileri İndir
            </Button>

            <label>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button variant="secondary" as="span" className="cursor-pointer">
                <Upload size={18} />
                Verileri Yükle
              </Button>
            </label>

            <Button variant="danger" onClick={handleClearData}>
              <Trash2 size={18} />
              Tüm Verileri Sil
            </Button>
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
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Versiyon 1.0.0
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
