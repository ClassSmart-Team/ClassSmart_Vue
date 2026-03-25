import { createFetch } from '@vueuse/core'
import { useAuthStore } from '@/stores/authStore.ts'
import router from '@/router'

export const useapi = createFetch({
  baseUrl: 'https://sutando-user.me/api',
  options: {
    // Interceptor: Se ejecuta justo antes de cada petición
    async beforeFetch({ options, cancel }) {
      const authStore = useAuthStore()
      if (!authStore.credentials) {
        cancel()
      }
      if (authStore.credentials) {
        // Garantizamos que headers sea un objeto y añadimos el Bearer
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authStore.credentials.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }
      }

      return { options }
    },
    // Interceptor: Manejo de errores global (ej. Token expirado)
    onFetchError(ctx) {
      const authStore = useAuthStore()

      if (ctx.response?.status === 401) {
        authStore.logout()
        router.push('/login')
        // Opcional: redirigir al login con
      }

      return ctx
    },
  },
  // Opciones de fetch nativo (opcional)
  fetchOptions: {
    mode: 'cors',
  },
})
