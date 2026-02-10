import { NavLink } from 'react-router-dom'
import { Home, ArrowLeftRight, UtensilsCrossed, Scale, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { path: '/', icon: Home, label: 'Ana Sayfa' },
  { path: '/exchanges', icon: ArrowLeftRight, label: 'Değişim' },
  { path: '/recipes', icon: UtensilsCrossed, label: 'Tarifler' },
  { path: '/units', icon: Scale, label: 'Birim' },
  { path: '/settings', icon: Settings, label: 'Ayarlar' }
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--bg-tertiary)] z-40">
      <ul className="flex items-center justify-around py-2.5">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-secondary)]'
                )
              }
            >
              <item.icon size={22} />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
