import { useState } from 'react'
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

  const getMealItemsForMeal = useAppStore((state) => state.getMealItemsForMeal)
  const mealItems = getMealItemsForMeal(date, mealType)

  const Icon = mealIcons[mealType] || Coffee

  return (
    <>
      <Card>
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
          {mealItems.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-4">
              Henüz besin eklenmemiş
            </p>
          ) : (
            <ul className="space-y-2">
              {mealItems.map((item) => (
                <FoodItem key={item.id} item={item} />
              ))}
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
