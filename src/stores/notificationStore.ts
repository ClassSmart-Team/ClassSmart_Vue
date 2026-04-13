import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    showModal: false,
    title: '',
    body: '',
    url: '',
  }),
  actions: {
    show(payload: any) {
      const data = payload.data

      this.title = data.title || 'Nueva Notificación'
      this.body = data.body || ''

      const rawUrl = data.url || '/'

      try {
        // Si rawUrl es "https://sutando-user.me/parent/assignments",
        // new URL(rawUrl).pathname dará solo "/parent/assignments"
        const urlPath = new URL(rawUrl).pathname
        this.url = urlPath
      } catch (e) {
        // Si no es una URL válida (ya es un path), se usa tal cual
        this.url = rawUrl
      }
      this.showModal = true
    },
  },
})
