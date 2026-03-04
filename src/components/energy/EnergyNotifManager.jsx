import { useEffect, useRef } from 'react'
import useAppStore from '../../stores/appStore'

function isWithinWindow(startStr, endStr) {
  const now = new Date()
  const [sh, sm] = startStr.split(':').map(Number)
  const [eh, em] = endStr.split(':').map(Number)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  return nowMin >= startMin && nowMin <= endMin
}

export default function EnergyNotifManager() {
  const addEnergyLog = useAppStore((state) => state.addEnergyLog)
  const energyNotifEnabled = useAppStore((state) => state.energyNotifEnabled)
  const energyNotifIntervalSec = useAppStore((state) => state.energyNotifIntervalSec)
  const energyNotifStart = useAppStore((state) => state.energyNotifStart)
  const energyNotifEnd = useAppStore((state) => state.energyNotifEnd)
  const intervalRef = useRef(null)

  // BroadcastChannel: SW'den gelen seçimleri dinle (her zaman aktif)
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return
    const channel = new BroadcastChannel('energy-channel')
    channel.addEventListener('message', (event) => {
      if (event.data?.type === 'ENERGY_LEVEL_SELECTED') {
        addEnergyLog(event.data.timestamp, event.data.level)
      }
    })
    return () => channel.close()
  }, [addEnergyLog])

  // Bildirim interval'ı — sadece enabled ise kur
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!energyNotifEnabled) return
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return

    const fireNotif = async () => {
      if (Notification.permission !== 'granted') return
      if (!isWithinWindow(energyNotifStart, energyNotifEnd)) return
      const reg = await navigator.serviceWorker.ready
      reg.active?.postMessage({ type: 'SHOW_ENERGY_NOTIFICATION' })
    }

    intervalRef.current = setInterval(fireNotif, energyNotifIntervalSec * 1000)
    return () => clearInterval(intervalRef.current)
  }, [energyNotifEnabled, energyNotifIntervalSec, energyNotifStart, energyNotifEnd])

  return null
}
