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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {exchanges.length === 0 ? (
          <div className="text-center" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
            <p className="text-[var(--text-secondary)]" style={{ marginBottom: '1.25rem' }}>
              Bu besin için tanımlanmış değişim bulunmuyor.
            </p>
            <Button onClick={goToExchanges} variant="secondary" style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
              <ExternalLink size={16} />
              Değişimler Sayfasına Git
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--text-secondary)]" style={{ marginBottom: '0' }}>
              {foodName} ile eşdeğer değişimler:
            </p>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {exchanges.map((exchange) => (
                <li
                  key={exchange.id}
                  className="flex items-center flex-wrap bg-[var(--bg-tertiary)] rounded-lg gap-1"
                  style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                >
                  <ArrowRight size={14} className="text-[var(--accent)] flex-shrink-0" />
                  <span className="text-[var(--text-primary)]">
                    {exchange.leftQuantity} {exchange.leftUnit?.abbreviation || exchange.leftUnit?.name || 'porsiyon'} {exchange.leftFood?.name}
                  </span>
                  <span className="text-[var(--text-secondary)]">=</span>
                  {(exchange.rightItems || []).map((item, idx) => (
                    <span key={idx} className="text-[var(--text-primary)]">
                      {idx > 0 && <span className="text-[var(--accent)] mx-1">+ </span>}
                      {item.quantity} {item.unit?.abbreviation || item.unit?.name || 'porsiyon'} {item.food?.name}
                    </span>
                  ))}
                </li>
              ))}
            </ul>

            <Button
              onClick={goToExchanges}
              variant="ghost"
              className="w-full"
              style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', marginTop: '0.25rem' }}
            >
              <ExternalLink size={16} />
              Tüm Değişimleri Düzenle
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}
