import { useNavigate } from 'react-router-dom'
import { ArrowRight, ExternalLink, RefreshCw } from 'lucide-react'
import useAppStore from '../../stores/appStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function ExchangeModal({ isOpen, onClose, foodId, foodName, onApplyExchange }) {
  const navigate = useNavigate()
  const getExchangesForFood = useAppStore((state) => state.getExchangesForFood)
  const exchanges = getExchangesForFood(foodId)

  const goToExchanges = () => {
    onClose()
    navigate('/exchanges')
  }

  const handleApply = (exchange) => {
    if (onApplyExchange) {
      onApplyExchange(exchange)
      onClose()
    }
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
            <p className="text-sm text-[var(--text-secondary)]">
              {foodName} ile eşdeğer değişimler — değiştirmek için bir satıra tıkla:
            </p>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {exchanges.map((exchange) => (
                <li key={exchange.id}>
                  <button
                    onClick={() => handleApply(exchange)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem',
                      background: 'var(--bg-tertiary)', border: '1px solid transparent', borderRadius: '0.5rem',
                      padding: '0.75rem 1rem', cursor: 'pointer', textAlign: 'left',
                      transition: 'border-color 0.15s, background 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-secondary)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--bg-tertiary)' }}
                    title="Bu besinle değiştir"
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
                    <RefreshCw size={12} style={{ marginLeft: 'auto', flexShrink: 0, color: 'var(--text-secondary)', opacity: 0.5 }} />
                  </button>
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
