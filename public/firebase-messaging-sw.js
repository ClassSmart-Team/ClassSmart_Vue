importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDukIP1zvxkdD7ZlUWngXGCPZmlhM9uKJU',
  projectId: 'classsmart-15b59',
  messagingSenderId: '1017937281616',
  appId: '1:1017937281616:web:992e1bcc3be22bf07a8755',
})

const messaging = firebase.messaging()

// Este evento captura la notificación cuando la app está en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('Notificación recibida en segundo plano:', payload)

  const data = payload.data

  if (!data) return

  const notificationTitle = data.title || 'ClassSmart'
  const notificationOptions = {
    body: data.body || '',
    icon: '/Logo.svg',
    badge: '/Logo.svg',
    data: {
      url: data.url || '/',
    },
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si ya hay una pestaña abierta, redirigir ahí
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i]

        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }

      if (windowClients.length > 0) {
        return windowClients[0].navigate(urlToOpen).then((client) => client.focus())
      }

      // Si no hay pestañas abiertas, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    }),
  )
})
