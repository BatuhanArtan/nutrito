import { cn } from '../../lib/utils'

export default function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seçiniz...',
  className,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm text-[var(--text-secondary)]">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('focus:border-[var(--accent)] transition-colors', className)}
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--bg-tertiary)',
          borderRadius: '0.5rem',
          padding: '0.5rem 0.75rem',
          color: 'var(--text-primary)',
          appearance: 'none',
          cursor: 'pointer',
          width: '100%'
        }}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
