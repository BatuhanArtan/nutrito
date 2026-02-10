import { ChevronLeft, ChevronRight } from 'lucide-react'
import useAppStore from '../stores/appStore'
import { formatDisplayDate, getToday, mealTypeLabels, mealTypeOrder } from '../lib/utils'
import Button from '../components/ui/Button'
import MealCard from '../components/meals/MealCard'
import WaterTracker from '../components/water/WaterTracker'
import WeightInput from '../components/weight/WeightInput'
import WeightChart from '../components/weight/WeightChart'

export default function Dashboard() {
  const currentDate = useAppStore((state) => state.currentDate)
  const setCurrentDate = useAppStore((state) => state.setCurrentDate)

  const goToPreviousDay = () => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - 1)
    setCurrentDate(date.toISOString().split('T')[0])
  }

  const goToNextDay = () => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + 1)
    setCurrentDate(date.toISOString().split('T')[0])
  }

  const goToToday = () => {
    setCurrentDate(getToday())
  }

  const isToday = currentDate === getToday()

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
