import { cn } from '../../lib/utils'

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn('rounded-xl', className)}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '1rem',
        overflow: 'hidden',
        minWidth: 0
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div
      className={cn('flex items-center justify-between', className)}
      style={{ marginBottom: '0.75rem' }}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3
      className={cn('text-lg font-semibold', className)}
      style={{ color: 'var(--text-primary)' }}
    >
      {children}
    </h3>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}
