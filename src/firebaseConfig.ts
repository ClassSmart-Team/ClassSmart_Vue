import { initializeApp } from 'firebase/app'
import { getMessaging, onMessage } from 'firebase/messaging'
import { useNotificationStore } from '@/stores/notificationStore.ts'

const firebaseConfig = {
  apiKey: 'AIzaSyDukIP1zvxkdD7ZlUWngXGCPZmlhM9uKJU',
  authDomain: 'classsmart-15b59.firebaseapp.com',
  projectId: 'classsmart-15b59',
  storageBucket: 'classsmart-15b59.firebasestorage.app',
  messagingSenderId: '1017937281616',
  appId: '1:1017937281616:web:992e1bcc3be22bf07a8755',
}

const app = initializeApp(firebaseConfig)
export const messaging = getMessaging(app)

onMessage(messaging, (payload) => {
  console.log('Mensaje recibido en primer plano:', payload)

  if (payload.data) {
    const notificationStore = useNotificationStore()
    notificationStore.show(payload)

    console.log('Estado del store tras recibir:', notificationStore.showModal)
  } else {
    console.warn(
      'Se recibió un evento de mensaje, pero no contiene el objeto "notification". Revisa el formato del envío en el servidor.',
    )
  }
})
