import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import type { SessionData } from '@/types/types'

declare global {
  interface Window {
    Echo: Echo<any>
    Pusher: typeof Pusher
  }
}

window.Pusher = Pusher

function getStoredSession(): SessionData | null {
  try {
    const raw = localStorage.getItem('useAuthStore')
    if (!raw) return null
    return JSON.parse(raw) as SessionData
  } catch (error) {
    console.error('No se pudo leer la sesión guardada:', error)
    return null
  }
}

export function initEcho() {
  const session = getStoredSession()
  const token = session?.token ?? ''

  if (window.Echo) {
    try {
      window.Echo.disconnect()
    } catch (error) {
      console.error('No se pudo desconectar Echo anterior:', error)
    }
  }

  window.Echo = new Echo({
    broadcaster: 'reverb',
    key: 'classsmart_key',
    wsHost: 'api.sutando-user.me',
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: 'https://api.sutando-user.me/api/broadcasting/auth',
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/json',
      },
    },
  })

  return window.Echo
}

export function disconnectEcho() {
  if (window.Echo) {
    window.Echo.disconnect()
  }
}