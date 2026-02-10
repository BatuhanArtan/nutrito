import { useState } from 'react'
import { ChevronLeft, ChevronRight, Copy, Calendar } from 'lucide-react'
import useAppStore from '../stores/appStore'
import { formatDisplayDate, getToday, mealTypeLabels, mealTypeOrder, toLocalDateStr } from '../lib/utils'
import Button from '../components/ui/Button'
import MealCard from '../components/meals/MealCard'
import WaterTracker from '../components/water/WaterTracker'
import WeightInput from '../components/weight/WeightInput'
import WeightChart from '../components/weight/WeightChart'
import Modal from '../components/ui/Modal'

export default function Dashboard() {
  const currentDate = useAppStore((state) => state.currentDate)
  const setCurrentDate = useAppStore((state) => state.setCurrentDate)
  const copyMealsFromDate = useAppStore((state) => state.copyMealsFromDate)

  const [showDateModal, setShowDateModal] = useState(false)
  const [copyFromDate, setCopyFromDate] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [copyLoading, setCopyLoading] = useState(false)

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

  const handleCopyFromPrevious = async () => {
    const prev = getPreviousDay(currentDate)
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyFromPrevious}
          disabled={copyLoading}
          style={{ paddingLeft: '0.875rem', paddingRight: '0.875rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
        >
          <Copy size={16} style={{ marginRight: '0.375rem' }} />
          Önceki günden aktar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={openDateModal}
          disabled={copyLoading}
          style={{ paddingLeft: '0.875rem', paddingRight: '0.875rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
        >
          <Calendar size={16} style={{ marginRight: '0.375rem' }} />
          Tarihten aktar
        </Button>
        {copyStatus && (
          <span className="text-sm text-[var(--text-secondary)]" style={{ marginLeft: '0.25rem' }}>
            {copyStatus}
          </span>
        )}
      </div>

      {/* Meals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }} className="md:grid-cols-2">
        {mealTypeOrder.map((mealType) => (
          <MealCard
            key={mealType}
            date={currentDate}
            mealType={mealType}
            title={mealTypeLabels[mealType]}
          />
        ))}
      </div>

      {/* Water & Weight Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }} className="md:grid-cols-2">
        <WaterTracker date={currentDate} />
        <WeightInput date={currentDate} />
      </div>

      {/* Weight Chart */}
      <WeightChart />

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
      `}</style>
    </div>
  )
}
