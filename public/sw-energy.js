// Energy notification handler — workbox tarafından generated SW'ye importScripts ile dahil edilir

const energyChannel = new BroadcastChannel('energy-channel')

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

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const level = parseInt(event.action)
  if (level >= 1 && level <= 5) {
    energyChannel.postMessage({
      type: 'ENERGY_LEVEL_SELECTED',
      level,
      timestamp: new Date().toISOString()
    })
    return
  }

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
      const focused = clients.find((c) => c.focused)
      if (focused) return focused.focus()
      if (clients.length > 0) return clients[0].focus()
      return self.clients.openWindow('/nutrito/')
    })
  )
})
