import { cn } from '../../lib/utils'

const variants = {
  primary: 'bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white',
  secondary: 'bg-[var(--bg-tertiary)] hover:bg-[#3a3a3a] text-[var(--text-primary)]',
  ghost: 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-[var(--success)] hover:bg-[#6a9a83] text-white'
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5',
  lg: 'px-7 py-3.5 text-lg',
  icon: 'p-2.5'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
