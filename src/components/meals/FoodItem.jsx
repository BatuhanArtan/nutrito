import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, ArrowLeftRight, BookOpen } from 'lucide-react'
import useAppStore from '../../stores/appStore'
import Button from '../ui/Button'
import ExchangeModal from './ExchangeModal'

export default function FoodItem({ item }) {
  const [showExchangeModal, setShowExchangeModal] = useState(false)
  const deleteMealItem = useAppStore((state) => state.deleteMealItem)
  const navigate = useNavigate()

  const displayName = item.food?.name || item.recipe?.title || 'Bilinmeyen'
  const unitName = item.unit?.abbreviation || item.unit?.name || ''

  const handleDelete = async () => {
    await deleteMealItem(item.id)
  }

  return (
    <>
      <li
        className="flex items-center justify-between bg-[var(--bg-tertiary)] rounded-lg group"
        style={{ paddingLeft: '1rem', paddingRight: '0.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
      >
        <button
          type="button"
          onClick={() => setShowExchangeModal(true)}
          className="flex items-center gap-2 text-left flex-1 hover:text-[var(--text-primary)] transition-colors min-w-0 overflow-hidden"
          style={{ minWidth: 0 }}
        >
          <span className="text-sm text-[var(--text-primary)] truncate">
            {item.quantity} {unitName} {displayName}
          </span>
          {item.food && (
            <ArrowLeftRight size={14} className="text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          )}
        </button>

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
            className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
            style={{ position: 'relative', zIndex: 1 }}
          >
            <BookOpen size={14} className="text-[var(--accent)]" />
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleDelete()
          }}
          className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Trash2 size={14} className="text-red-400" />
        </Button>
      </li>

      {item.food && (
        <ExchangeModal
          isOpen={showExchangeModal}
          onClose={() => setShowExchangeModal(false)}
          foodId={item.food.id}
          foodName={displayName}
        />
      )}
    </>
  )
}
