import { useState, useRef } from 'react'
import { Plus, Coffee, Sun, Cookie, Moon, CheckCircle2, Circle } from 'lucide-react'
import useAppStore from '../../stores/appStore'
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card'
import Button from '../ui/Button'
import FoodItem from './FoodItem'
import AddFoodModal from './AddFoodModal'

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  snack: Cookie,
  dinner: Moon
}

const mealColors = {
  breakfast: 'text-[var(--warning)]',
  lunch: 'text-[var(--accent-light)]',
  snack: 'text-[var(--success)]',
  dinner: 'text-[var(--accent)]'
}

export default function MealCard({ date, mealType, title }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0)

  useAppStore((state) => state.mealItems)
  const getMealItemsForMeal = useAppStore((state) => state.getMealItemsForMeal)
  const getOrCreateDailyMeal = useAppStore((state) => state.getOrCreateDailyMeal)
  const updateMealItem = useAppStore((state) => state.updateMealItem)
  const mealItems = useAppStore((state) => state.mealItems)
  const completedMeals = useAppStore((state) => state.completedMeals)
  const toggleMealCompleted = useAppStore((state) => state.toggleMealCompleted)
  const mealItemsForCard = getMealItemsForMeal(date, mealType)

  const isCompleted = completedMeals[`${date}_${mealType}`] ?? false

  const Icon = mealIcons[mealType] || Coffee

  const handleDragEnter = (e) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragOver(true)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragLeave = () => {
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragOver(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragOver(false)

    const itemId = e.dataTransfer.getData('text/plain')
    if (!itemId) return

    const draggedItem = mealItems.find((i) => i.id === itemId)
    if (!draggedItem) return

    const targetMeal = await getOrCreateDailyMeal(date, mealType)
    if (draggedItem.daily_meal_id === targetMeal.id) return

    await updateMealItem(itemId, { daily_meal_id: targetMeal.id })
  }

  const cardStyle = {
    ...(isDragOver ? { outline: '2px solid var(--accent)', outlineOffset: '2px' } : {}),
    ...(isCompleted ? { borderLeft: '3px solid #4ade80', opacity: 0.85 } : {})
  }

  return (
    <>
      <Card
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={Object.keys(cardStyle).length ? cardStyle : undefined}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon size={20} className={mealColors[mealType]} />
            {title}
            {isCompleted && (
              <span style={{ fontSize: '0.75rem', color: '#4ade80', opacity: 0.6, fontWeight: 400 }}>
                (Tamamlandı)
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleMealCompleted(date, mealType)}
              title={isCompleted ? 'Tamamlandı olarak işaretli — kaldırmak için tıkla' : 'Tamamlandı olarak işaretle'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '6px', color: isCompleted ? '#4ade80' : 'var(--text-secondary)', transition: 'color 0.2s' }}
            >
              {isCompleted
                ? <CheckCircle2 size={20} />
                : <Circle size={20} />
              }
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={18} />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isDragOver && mealItemsForCard.length === 0 ? (
            <div
              className="text-sm text-[var(--accent)] text-center rounded-lg border-2 border-dashed border-[var(--accent)]"
              style={{ padding: '1rem', opacity: 0.7 }}
            >
              Buraya bırak
            </div>
          ) : mealItemsForCard.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-4">
              Henüz besin eklenmemiş
            </p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0, width: '100%', overflow: 'hidden' }}>
              {mealItemsForCard.map((item) => (
                <FoodItem key={item.id} item={item} />
              ))}
              {isDragOver && (
                <li
                  className="text-sm text-[var(--accent)] text-center rounded-lg border-2 border-dashed border-[var(--accent)]"
                  style={{ padding: '0.5rem', opacity: 0.7 }}
                >
                  Buraya bırak
                </li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>

      <AddFoodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        date={date}
        mealType={mealType}
      />
    </>
  )
}
