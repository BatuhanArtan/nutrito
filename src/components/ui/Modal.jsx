import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from './Button'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true
}) {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={cn(
          'bg-[var(--bg-secondary)] rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col',
          className
        )}
      >
        {/* Header - inline padding so it always applies */}
        <div
          className="flex items-center justify-between border-b border-[var(--bg-tertiary)] shrink-0"
          style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          {showCloseButton && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          )}
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto flex-1 min-h-0"
          style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1.75rem', paddingBottom: '2.5rem' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
