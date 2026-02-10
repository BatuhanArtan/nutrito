import { cn } from '../../lib/utils'

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  className,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm text-[var(--text-secondary)]">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2',
          'text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50',
          'focus:border-[var(--accent)] transition-colors',
          className
        )}
        {...props}
      />
    </div>
  )
}
