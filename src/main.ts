import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initEcho } from './echo'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

if (localStorage.getItem('useAuthStore')) {
  initEcho()
}

app.mount('#app')