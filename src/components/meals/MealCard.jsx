import { useState, useRef } from 'react'
import { Plus, Coffee, Sun, Cookie, Moon } from 'lucide-react'
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
  const mealItemsForCard = getMealItemsForMeal(date, mealType)

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

  return (
    <>
      <Card
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={isDragOver ? { outline: '2px solid var(--accent)', outlineOffset: '2px' } : undefined}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon size={20} className={mealColors[mealType]} />
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} />
          </Button>
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
