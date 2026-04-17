import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const isOpen = ref(false)
  const message = ref('')
  const type = ref<'success' | 'error' | 'info'>('success')

  function notify(m: string, iconType: 'success' | 'error' | 'info' = 'success') {
    message.value = m
    type.value = iconType
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, message, type, notify, close }
})
