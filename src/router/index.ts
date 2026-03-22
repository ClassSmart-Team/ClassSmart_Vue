import { createRouter, createWebHistory } from 'vue-router'
import AdminRegistroView from '../views/AdminRegistroView.vue'
import HomeGeneralView from '@/views/HomeGeneralView.vue'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: HomeGeneralView,
    },
    {
      path: '/adminRegister',
      name: 'AdminRegister',
      component: AdminRegistroView,
    },

   {
      path: '/login',
      name: 'Login',
      component: LoginView,
    
    },

  ],
})

export default router