import { useNavigate } from 'react-router-dom'
import { ArrowRight, ExternalLink } from 'lucide-react'
import useAppStore from '../../stores/appStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function ExchangeModal({ isOpen, onClose, foodId, foodName }) {
  const navigate = useNavigate()
  const getExchangesForFood = useAppStore((state) => state.getExchangesForFood)
  const exchanges = getExchangesForFood(foodId)

  const goToExchanges = () => {
    onClose()
    navigate('/exchanges')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${foodName} Değişimleri`}>
      <div className="space-y-4">
        {exchanges.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-[var(--text-secondary)] mb-4">
              Bu besin için tanımlanmış değişim bulunmuyor.
            </p>
            <Button onClick={goToExchanges} variant="secondary">
              <ExternalLink size={16} />
              Değişimler Sayfasına Git
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--text-secondary)]">
              1 porsiyon {foodName} yerine şunları kullanabilirsiniz:
            </p>

            <ul className="space-y-2">
              {exchanges.map((exchange) => (
                <li
                  key={exchange.id}
                  className="flex items-center gap-2 bg-[var(--bg-tertiary)] rounded-lg px-3 py-2"
                >
                  <ArrowRight size={14} className="text-[var(--accent)] flex-shrink-0" />
                  <span className="text-[var(--text-primary)]">
                    {exchange.quantity} {exchange.unit?.abbreviation || exchange.unit?.name} {exchange.equivalentFood?.name}
                  </span>
                </li>
              ))}
            </ul>

            <Button onClick={goToExchanges} variant="ghost" className="w-full">
              <ExternalLink size={16} />
              Tüm Değişimleri Düzenle
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}
