import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Zap } from 'lucide-react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import GeminiButton from './GeminiButton'
import EnergyNotifManager from '../energy/EnergyNotifManager'
import EnergyModal from '../energy/EnergyModal'
import useAppStore from '../../stores/appStore'

export default function Layout() {
  const initializeData = useAppStore((state) => state.initializeData)
  const [showEnergyModal, setShowEnergyModal] = useState(false)
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

  useEffect(() => {
    initializeData()
  }, [initializeData])

  const handleEnergyClick = async () => {
    // Bildirim izni henüz alınmadıysa iste
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const result = await Notification.requestPermission()
      setNotifPermission(result)
    }
    setShowEnergyModal(true)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar />

      <div
        className="main-content"
        style={{ minHeight: '100vh', paddingBottom: '5rem' }}
      >
        <div style={{ padding: '1.5rem', maxWidth: '72rem', margin: '0 auto', overflowX: 'hidden' }}>
          <Outlet />
        </div>
      </div>

      <BottomNav />
      <GeminiButton />

      {/* Energy Button */}
      <button
        type="button"
        onClick={handleEnergyClick}
        className="fixed z-50 bg-gradient-to-r from-green-500 to-emerald-500
                   hover:from-green-600 hover:to-emerald-600
                   text-white p-4 rounded-full shadow-lg
                   transition-all duration-300 hover:scale-110
                   flex items-center justify-center border-0 cursor-pointer"
        style={{ bottom: '6rem', right: '5rem' }}
        title="Enerji Takibi"
      >
        <Zap size={24} />
      </button>

      <EnergyNotifManager />
      <EnergyModal isOpen={showEnergyModal} onClose={() => setShowEnergyModal(false)} />

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
