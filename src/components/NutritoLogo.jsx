/**
 * Nutrito marka logosu: beslenme/diyet temalı ikon + isim
 */
export default function NutritoLogo({ size = 'md', className = '' }) {
  const isLarge = size === 'lg'
  const iconSize = isLarge ? 56 : 40
  const textClass = isLarge ? 'text-2xl font-bold' : 'text-xl font-semibold'

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: iconSize + 16,
          height: iconSize + 16,
          background: 'var(--accent)',
          color: 'var(--bg-primary)'
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 48 48"
          fill="currentColor"
          aria-hidden
        >
          {/* Yaprak: beslenme / sağlıklı yaşam */}
          <path d="M24 4C14 12 8 22 8 30c0 6 3.5 10 8 12 4.5-2 8-6 8-12 0-8-6-18-16-26z" />
        </svg>
      </div>
      <span className={`text-[var(--text-primary)] ${textClass}`}>Nutrito</span>
    </div>
  )
}
