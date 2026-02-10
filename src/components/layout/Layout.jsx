import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import GeminiButton from './GeminiButton'
import useAppStore from '../../stores/appStore'

export default function Layout() {
  const initializeData = useAppStore((state) => state.initializeData)

  useEffect(() => {
    initializeData()
  }, [initializeData])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content - with left margin for sidebar on desktop */}
      <div
        className="main-content"
        style={{
          minHeight: '100vh',
          paddingBottom: '5rem'
        }}
      >
        <div style={{ padding: '1.5rem', maxWidth: '72rem', margin: '0 auto' }}>
          <Outlet />
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Gemini Button */}
      <GeminiButton />

      <style>{`
        @media (min-width: 768px) {
          .main-content {
            margin-left: 16rem;
            padding-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}
