import { useState } from 'react'
import { Trash2, ArrowLeftRight } from 'lucide-react'
import useAppStore from '../../stores/appStore'
import Button from '../ui/Button'
import ExchangeModal from './ExchangeModal'

export default function FoodItem({ item }) {
  const [showExchangeModal, setShowExchangeModal] = useState(false)
  const deleteMealItem = useAppStore((state) => state.deleteMealItem)

  const displayName = item.food?.name || item.recipe?.title || 'Bilinmeyen'
  const unitName = item.unit?.abbreviation || item.unit?.name || ''

  const handleDelete = async () => {
    await deleteMealItem(item.id)
  }

  return (
    <>
      <li className="flex items-center justify-between bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 group">
        <button
          onClick={() => setShowExchangeModal(true)}
          className="flex items-center gap-2 text-left flex-1 hover:text-[var(--accent)] transition-colors"
        >
          <span className="text-sm text-[var(--text-primary)]">
            {item.quantity} {unitName} {displayName}
          </span>
          {item.food && (
            <ArrowLeftRight size={14} className="text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
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
