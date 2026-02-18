import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

export default function SearchableSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Seçiniz...'
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)
  const searchRef = useRef(null)

  const selected = options.find((o) => o.value === value)

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  const handleSelect = (optValue) => {
    onChange(optValue)
    setOpen(false)
    setSearch('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setSearch('')
  }

  const handleOpen = () => {
    setOpen(true)
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); setSearch('') }
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <div className="flex flex-col gap-1" ref={containerRef} style={{ position: 'relative' }}>
      {label && (
        <label className="text-sm text-[var(--text-secondary)]">{label}</label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center justify-between bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-left transition-colors hover:border-[var(--accent)]"
        style={{ minHeight: '2.5rem' }}
      >
        <span className={selected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-50'}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <span onClick={handleClear} className="hover:text-red-400 text-[var(--text-secondary)] transition-colors p-0.5">
              <X size={13} />
            </span>
          )}
          <ChevronDown size={15} className="text-[var(--text-secondary)]" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 w-full rounded-lg border border-[var(--bg-tertiary)] bg-[var(--bg-secondary)] shadow-lg"
          style={{ top: 'calc(100% + 4px)', left: 0 }}
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-[var(--bg-tertiary)]" style={{ padding: '0.5rem 0.75rem' }}>
            <Search size={14} className="text-[var(--text-secondary)] flex-shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ara..."
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none"
            />
          </div>

          {/* Options */}
          <ul style={{ maxHeight: '14rem', overflowY: 'auto', listStyle: 'none', padding: '0.25rem', margin: 0 }}>
            {filtered.length === 0 ? (
              <li className="text-sm text-[var(--text-secondary)] text-center" style={{ padding: '0.75rem' }}>
                Sonuç yok
              </li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className="w-full text-left rounded-md text-sm transition-colors hover:bg-[var(--bg-tertiary)]"
                    style={{
                      padding: '0.5rem 0.75rem',
                      color: opt.value === value ? 'var(--accent)' : 'var(--text-primary)',
                      fontWeight: opt.value === value ? '600' : '400'
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
