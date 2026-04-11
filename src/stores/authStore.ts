import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SessionData } from '@/types/types'
import router from '@/router'
import { initEcho, disconnectEcho } from '@/echo'

export const useAuthStore = defineStore('auth', () => {
  const credentials = ref<SessionData | null>(
    JSON.parse(localStorage.getItem('useAuthStore') ?? 'null')
  )

  function setCredentials(data: SessionData) {
    credentials.value = data
    localStorage.setItem('useAuthStore', JSON.stringify(data))
    initEcho()
  }

  function getCredentials() {
    return credentials.value
  }

  function logout() {
    disconnectEcho()
    credentials.value = null
    localStorage.removeItem('useAuthStore')
    router.push('/login')
  }

  return { credentials, setCredentials, logout, getCredentials }
})