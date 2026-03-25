import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
export const usePiniaStore = defineStore('pinia', () => {
  const name = ref<string>('pedro')
  function updateName(newName:string) {
    name.value = newName
  }
const getname = computed(() => name.value)
  return { name,updateName,getname}
})
