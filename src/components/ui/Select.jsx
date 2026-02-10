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
        className={cn(
          'bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2',
          'text-[var(--text-primary)] focus:border-[var(--accent)] transition-colors',
          'appearance-none cursor-pointer',
          className
        )}
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
