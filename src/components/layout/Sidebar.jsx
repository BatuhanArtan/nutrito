import { NavLink } from 'react-router-dom'
import { Home, ArrowLeftRight, UtensilsCrossed, Scale, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { path: '/', icon: Home, label: 'Ana Sayfa' },
  { path: '/exchanges', icon: ArrowLeftRight, label: 'Değişimler' },
  { path: '/recipes', icon: UtensilsCrossed, label: 'Tarifler' },
  { path: '/units', icon: Scale, label: 'Birimler' },
  { path: '/settings', icon: Settings, label: 'Ayarlar' }
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-[var(--bg-secondary)] border-r border-[var(--bg-tertiary)] fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--bg-tertiary)]">
        <h1 className="text-2xl font-bold text-[var(--accent)]">Nutrito</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Diyet Takip</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center py-3.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                  )
                }
                style={{ paddingLeft: '1.625rem', paddingRight: '1.25rem', gap: '0.75rem' }}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--bg-tertiary)]">
        <p className="text-xs text-[var(--text-secondary)] text-center">
          Nutrito v1.0
        </p>
      </div>
    </aside>
  )
}
