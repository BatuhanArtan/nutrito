import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, ArrowLeftRight, BookOpen, Copy, Pencil } from 'lucide-react'
import useAppStore from '../../stores/appStore'
import Button from '../ui/Button'
import ExchangeModal from './ExchangeModal'
import EditMealItemModal from './EditMealItemModal'

export default function FoodItem({ item }) {
  const [showExchangeModal, setShowExchangeModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const deleteMealItem = useAppStore((state) => state.deleteMealItem)
  const addMealItem = useAppStore((state) => state.addMealItem)
  const updateMealItem = useAppStore((state) => state.updateMealItem)
  const navigate = useNavigate()

  const displayName = item.food?.name || item.recipe?.title || 'Bilinmeyen'
  const unitName = item.unit?.abbreviation || item.unit?.name || ''

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteMealItem(item.id)
  }

  const handleDuplicate = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    await addMealItem({
      daily_meal_id: item.daily_meal_id,
      food_id: item.food_id || null,
      recipe_id: item.recipe_id || null,
      quantity: item.quantity,
      unit_id: item.unit_id || null
    })
  }

  const handleApplyExchange = async (exchange) => {
    const rightItems = exchange.rightItems || []
    if (rightItems.length === 0) return

    const first = rightItems[0]
    await updateMealItem(item.id, {
      food_id: first.food?.id || null,
      recipe_id: null,
      quantity: first.quantity,
      unit_id: first.unit?.id || null
    })

    for (let i = 1; i < rightItems.length; i++) {
      const ri = rightItems[i]
      await addMealItem({
        daily_meal_id: item.daily_meal_id,
        food_id: ri.food?.id || null,
        recipe_id: null,
        quantity: ri.quantity,
        unit_id: ri.unit?.id || null
      })
    }
  }

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', item.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <>
      <li
        draggable
        onDragStart={handleDragStart}
        className="flex items-center justify-between bg-[var(--bg-tertiary)] rounded-lg group"
        style={{ paddingLeft: '1rem', paddingRight: '0.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', cursor: 'grab', overflow: 'hidden', minWidth: 0 }}
      >
        {/* Tıklanabilir alan — edit modal açar */}
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 text-left flex-1 hover:text-[var(--text-primary)] transition-colors min-w-0 overflow-hidden"
          style={{ minWidth: 0 }}
        >
          <span className="text-sm text-[var(--text-primary)] truncate">
            {item.quantity} {unitName} {displayName}
          </span>
          <Pencil size={12} className="text-[var(--text-secondary)] opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
        </button>

        <div className="flex items-center flex-shrink-0" style={{ gap: '0.25rem' }}>
          {/* Exchange — sadece food olan item'larda */}
          {item.food && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowExchangeModal(true) }}
              title="Değişim uygula"
              className="opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity hidden-mobile"
            >
              <ArrowLeftRight size={14} className="text-[var(--text-secondary)]" />
            </Button>
          )}

          {item.food?.recipe_id && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigate(`/recipes?id=${item.food.recipe_id}`)
              }}
              title="Tarife git"
              className="opacity-70 group-hover:opacity-100 transition-opacity"
            >
              <BookOpen size={14} className="text-[var(--accent)]" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDuplicate}
            title="Kopyala"
            className="opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity hidden-mobile"
          >
            <Copy size={14} className="text-[var(--text-secondary)]" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="opacity-70 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={14} className="text-red-400" />
          </Button>
        </div>
      </li>

      <EditMealItemModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        item={item}
      />

      {item.food && (
        <ExchangeModal
          isOpen={showExchangeModal}
          onClose={() => setShowExchangeModal(false)}
          foodId={item.food.id}
          foodName={displayName}
          onApplyExchange={handleApplyExchange}
        />
      )}
    </>
  )
}
