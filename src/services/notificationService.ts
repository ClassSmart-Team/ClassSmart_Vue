import { getToken } from 'firebase/messaging'
import { messaging } from '@/firebaseConfig'
import { useapi } from '@/assets/composables/useApi'

export const requestForToken = async () => {
  try {
    // Solicitar permiso al navegador
    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      console.warn('El usuario bloqueó las notificaciones.')
      return
    }

    // Obtener el token de Firebase
    const currentToken = await getToken(messaging, {
      vapidKey:
        'BJkmDK1oGI-rcVM1Y5GHXtpAwNE7TW4k0KSK62aSWFhoCyiGN-pk3TanfursphCGo537ClBo6-4fl6l_ifghNcU',
    })

    if (currentToken) {
      console.log('Token obtenido:', currentToken)

      // El interceptor de useapi pondrá automáticamente el Bearer Token
      const { error } = await useapi('/save-token')
        .post({
          fcm_token: currentToken,
        })
        .json()

      if (error.value) {
        console.error('Error al guardar en Laravel:', error.value)
      } else {
        console.log('Token sincronizado con el servidor.')
      }
    } else {
      console.warn('No se pudo generar el token. Revisa la configuración de Firebase.')
    }
  } catch (err) {
    console.error('Error en el servicio de notificaciones:', err)
  }
}
