import { useState, useRef, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Copy, Calendar, Camera, Droplets, PlusCircle } from 'lucide-react'
import { toPng } from 'html-to-image'
import useAppStore from '../stores/appStore'
import { formatDisplayDate, getToday, mealTypeLabels, mealTypeOrder, toLocalDateStr, toDateStr } from '../lib/utils'
import Button from '../components/ui/Button'
import MealCard from '../components/meals/MealCard'
import WaterTracker from '../components/water/WaterTracker'
import WeightInput from '../components/weight/WeightInput'
import WeightChart from '../components/weight/WeightChart'
import Modal from '../components/ui/Modal'

// Sabit öğünlerin sort_order değerleri
const FIXED_SORT_ORDERS = { breakfast: 10, lunch: 30, snack: 50, dinner: 70 }

const AFTER_OPTIONS = [
  { value: 'breakfast', label: 'Kahvaltıdan Sonra' },
  { value: 'lunch',     label: 'Öğle Yemeğinden Sonra' },
  { value: 'snack',     label: 'Ara Öğünden Sonra' },
  { value: 'dinner',    label: 'Akşam Yemeğinden Sonra' },
]

export default function Dashboard() {
  const currentDate = useAppStore((state) => state.currentDate)
  const setCurrentDate = useAppStore((state) => state.setCurrentDate)
  const copyMealsFromDate = useAppStore((state) => state.copyMealsFromDate)
  const waterLogs = useAppStore((state) => state.waterLogs)
  const waterTargetDefault = useAppStore((state) => state.waterTargetDefault)
  const waterGlassVolumeMl = useAppStore((state) => state.waterGlassVolumeMl)
  const dailyMeals = useAppStore((state) => state.dailyMeals)
  const addCustomMeal = useAppStore((state) => state.addCustomMeal)
  const deleteCustomMeal = useAppStore((state) => state.deleteCustomMeal)

  const [showDateModal, setShowDateModal] = useState(false)
  const [showAddSnackModal, setShowAddSnackModal] = useState(false)
  const [snackLabel, setSnackLabel] = useState('')
  const [snackAfter, setSnackAfter] = useState('breakfast')
  const [snackLoading, setSnackLoading] = useState(false)
  const [copyFromDate, setCopyFromDate] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [copyLoading, setCopyLoading] = useState(false)
  const [captureStatus, setCaptureStatus] = useState('')
  const captureRef = useRef(null)

  const handleCapture = async () => {
    if (!captureRef.current || captureStatus === 'loading') return
    setCaptureStatus('loading')
    try {
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 2,
        backgroundColor: '#111111'
      })

      // Panoya kopyala
      try {
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      } catch (clipErr) {
        console.warn('Clipboard API failed:', clipErr)
      }

      // İndir
      const link = document.createElement('a')
      link.download = `nutrito-${currentDate}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setCaptureStatus('done')
      setTimeout(() => setCaptureStatus(''), 2500)
    } catch (e) {
      console.error('Capture failed:', e)
      setCaptureStatus('error')
      setTimeout(() => setCaptureStatus(''), 3000)
    }
  }

  const goToPreviousDay = () => {
    const d = new Date(currentDate + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    setCurrentDate(toLocalDateStr(d))
  }

  const goToNextDay = () => {
    const d = new Date(currentDate + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    setCurrentDate(toLocalDateStr(d))
  }

  const goToToday = () => {
    setCurrentDate(getToday())
  }

  const isToday = currentDate === getToday()

  const getPreviousDay = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    return toLocalDateStr(d)
  }

  // Günün öğünlerini sıralı şekilde oluştur (sabit + custom)
  const mealsForDate = useMemo(() => {
    const fixed = mealTypeOrder.map(type => ({
      type,
      label: mealTypeLabels[type],
      sortOrder: FIXED_SORT_ORDERS[type],
      isCustom: false
    }))
    const custom = dailyMeals
      .filter(m => toDateStr(m.date) === toDateStr(currentDate) && m.is_custom)
      .map(m => ({
        type: m.meal_type,
        label: m.label || 'Ara Öğün',
        sortOrder: m.sort_order ?? 99,
        isCustom: true
      }))
    return [...fixed, ...custom].sort((a, b) => a.sortOrder - b.sortOrder)
  }, [dailyMeals, currentDate])

  const handleAddSnack = async () => {
    setSnackLoading(true)
    await addCustomMeal(currentDate, snackLabel.trim() || 'Ara Öğün', snackAfter)
    setSnackLabel('')
    setSnackAfter('breakfast')
    setShowAddSnackModal(false)
    setSnackLoading(false)
  }

  const handleCopyFromPrevious = async () => {
    const prev = getPreviousDay(currentDate)
    if (!confirm(`Önceki günün (${prev}) öğünleri bugüne eklenecek. Devam edilsin mi?`)) return
    setCopyLoading(true)
    setCopyStatus('')
    try {
      const count = await copyMealsFromDate(prev, currentDate)
      setCopyStatus(count > 0 ? `${count} öğün kalemi aktarıldı.` : 'Aktarılacak öğün yoktu.')
      setTimeout(() => setCopyStatus(''), 3000)
    } catch (e) {
      setCopyStatus('Aktarım başarısız.')
      setTimeout(() => setCopyStatus(''), 3000)
    }
    setCopyLoading(false)
  }

  const handleCopyFromDate = async () => {
    if (!copyFromDate) return
    if (!confirm(`${copyFromDate} tarihinin öğünleri bugüne eklenecek. Devam edilsin mi?`)) return
    setCopyLoading(true)
    setCopyStatus('')
    try {
      const count = await copyMealsFromDate(copyFromDate, currentDate)
      setCopyStatus(count > 0 ? `${count} öğün kalemi aktarıldı.` : 'Aktarılacak öğün yoktu.')
      setShowDateModal(false)
      setCopyFromDate('')
      setTimeout(() => setCopyStatus(''), 3000)
    } catch (e) {
      setCopyStatus('Aktarım başarısız.')
      setTimeout(() => setCopyStatus(''), 3000)
    }
    setCopyLoading(false)
  }

  const openDateModal = () => {
    setCopyFromDate(getPreviousDay(currentDate))
    setShowDateModal(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Date Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
          <ChevronLeft size={24} />
        </Button>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            {formatDisplayDate(currentDate)}
          </h1>
          {!isToday && (
            <button
              onClick={goToToday}
              style={{ fontSize: '0.875rem', color: 'var(--accent)', marginTop: '0.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Bugüne Dön
            </button>
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={goToNextDay}>
          <ChevronRight size={24} />
        </Button>
      </div>

      {/* Öğün aktar butonları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }} className="sm:grid-cols-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyFromPrevious}
          disabled={copyLoading}
          style={{ padding: '0.5rem 0.5rem', justifyContent: 'center', textAlign: 'center', whiteSpace: 'normal', lineHeight: '1.2' }}
        >
          <Copy size={15} style={{ marginRight: '0.3rem', flexShrink: 0 }} />
          Önceki Gün
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={openDateModal}
          disabled={copyLoading}
          style={{ padding: '0.5rem 0.5rem', justifyContent: 'center', textAlign: 'center', whiteSpace: 'normal', lineHeight: '1.2' }}
        >
          <Calendar size={15} style={{ marginRight: '0.3rem', flexShrink: 0 }} />
          Tarihten Aktar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddSnackModal(true)}
          style={{ padding: '0.5rem 0.5rem', justifyContent: 'center', textAlign: 'center', whiteSpace: 'normal', lineHeight: '1.2' }}
        >
          <PlusCircle size={15} style={{ marginRight: '0.3rem', flexShrink: 0 }} />
          Ara Öğün Ekle
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCapture}
          disabled={captureStatus === 'loading'}
          style={{ padding: '0.5rem 0.5rem', justifyContent: 'center', textAlign: 'center', whiteSpace: 'normal', lineHeight: '1.2' }}
        >
          <Camera size={15} style={{ marginRight: '0.3rem', flexShrink: 0 }} />
          {captureStatus === 'loading' ? 'Kaydediliyor...' : captureStatus === 'done' ? '✓ İndirildi' : captureStatus === 'error' ? '✗ Hata' : 'Görüntü Al'}
        </Button>
      </div>
      {copyStatus && (
        <span className="text-sm text-[var(--text-secondary)]">{copyStatus}</span>
      )}

      {/* Meals Grid — capture target */}
      <div ref={captureRef} style={{ padding: '1rem', borderRadius: '0.75rem', background: 'var(--bg-secondary)' }}>
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          {formatDisplayDate(currentDate)}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }} className="md:grid-cols-2">
          {mealsForDate.map((meal) => (
            <MealCard
              key={meal.type}
              date={currentDate}
              mealType={meal.type}
              title={meal.label}
              isCustom={meal.isCustom}
              onDelete={meal.isCustom ? () => deleteCustomMeal(currentDate, meal.type) : undefined}
            />
          ))}
        </div>
        {/* Su özeti — yalnızca görüntüde görünür */}
        {(() => {
          const waterLog = waterLogs.find((l) => l.date === currentDate)
          const glasses = waterLog?.glasses ?? 0
          const target = waterTargetDefault ?? 8
          const volumeMl = waterGlassVolumeMl ?? 200
          const totalMl = glasses * volumeMl
          const totalL = totalMl / 1000
          const targetL = (target * volumeMl) / 1000
          const isComplete = glasses >= target
          return (
            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Droplets size={18} style={{ color: isComplete ? 'var(--success)' : '#60a5fa', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                Su Tüketimi:
              </span>
              <span style={{ fontSize: '0.875rem', color: isComplete ? 'var(--success)' : '#60a5fa' }}>
                {glasses} bardak ({totalL.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} L)
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                Hedef: {target} bardak ({targetL.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} L)
              </span>
            </div>
          )
        })()}
      </div>

      {/* Water & Weight Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }} className="md:grid-cols-2">
        <WaterTracker date={currentDate} />
        <WeightInput date={currentDate} />
      </div>

      {/* Weight Chart */}
      <WeightChart />

      <Modal isOpen={showAddSnackModal} onClose={() => { setShowAddSnackModal(false); setSnackLabel(''); setSnackAfter('breakfast') }} title="Ara Öğün Ekle">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="text-sm text-[var(--text-secondary)]">Öğün adı</label>
            <input
              type="text"
              value={snackLabel}
              onChange={(e) => setSnackLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSnack()}
              placeholder="örn. Gece Atıştırması (boş kalırsa ARA ÖĞÜN ismiyle eklenir.)"
              autoFocus
              className="bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent)]"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="text-sm text-[var(--text-secondary)]">Konumu</label>
            <select
              value={snackAfter}
              onChange={(e) => setSnackAfter(e.target.value)}
              className="bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent)]"
            >
              {AFTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              onClick={handleAddSnack}
              disabled={snackLoading}
              style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            >
              {snackLoading ? 'Ekleniyor...' : 'Ekle'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => { setShowAddSnackModal(false); setSnackLabel(''); setSnackAfter('breakfast') }}
              style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            >
              İptal
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDateModal} onClose={() => { setShowDateModal(false); setCopyFromDate('') }} title="Tarihten öğün aktar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="text-sm text-[var(--text-secondary)]">Öğünleri kopyalanacak gün</label>
            <input
              type="date"
              value={copyFromDate}
              onChange={(e) => setCopyFromDate(e.target.value)}
              className="bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent)]"
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              onClick={handleCopyFromDate}
              disabled={!copyFromDate || copyLoading}
              style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            >
              {copyLoading ? 'Aktarılıyor...' : 'Aktar'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => { setShowDateModal(false); setCopyFromDate('') }}
              style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            >
              İptal
            </Button>
          </div>
        </div>
      </Modal>

      <style>{`
        @media (min-width: 768px) {
          .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 767px) {
          .hidden-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
