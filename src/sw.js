import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Energy level labels for notification body
const ENERGY_LABELS = {
  1: '😴 Çok Düşük',
  2: '😟 Düşük',
  3: '😐 Orta',
  4: '🙂 Yüksek',
  5: '⚡ Çok Yüksek'
}

const channel = new BroadcastChannel('energy-channel')

// App'ten gelen mesajları dinle: bildirim göster
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_ENERGY_NOTIFICATION') {
    self.registration.showNotification('Enerji Seviyeni Nasıl?', {
      body: 'Şu anki enerji seviyeni seç',
      icon: '/nutrito/pwa-192x192.png',
      badge: '/nutrito/pwa-192x192.png',
      tag: 'energy-check',
      renotify: true,
      requireInteraction: false,
      actions: [
        { action: '1', title: '😴 1' },
        { action: '2', title: '😟 2' },
        { action: '3', title: '😐 3' },
        { action: '4', title: '🙂 4' },
        { action: '5', title: '⚡ 5' }
      ]
    })
  }
})

// Bildirim action butonuna basıldığında
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const level = parseInt(event.action)

  if (level >= 1 && level <= 5) {
    // BroadcastChannel ile app'e gönder
    channel.postMessage({
      type: 'ENERGY_LEVEL_SELECTED',
      level,
      timestamp: new Date().toISOString()
    })
    return
  }

  // Bildirim gövdesine tıklandı — uygulamayı aç/odakla
  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
      const focused = clients.find((c) => c.focused)
      if (focused) return focused.focus()
      if (clients.length > 0) return clients[0].focus()
      return self.clients.openWindow('/nutrito/')
    })
  )
})
