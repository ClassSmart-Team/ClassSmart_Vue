import { createRouter, createWebHistory } from 'vue-router'
import AdminRegistroView from '../views/AdminRegistroView.vue'
import HomeGeneralView from '@/views/HomeGeneralView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeGeneralView,
    },
    {
      path: '/AdminRegister',
      name: 'AdminRegister',
      component: AdminRegistroView,
      meta: { role: 'Administrador' }
    },
  ],
})

router.beforeEach((to, from, next) => {
  const user = {
    role: 'Administrador'
  }

  if (to.meta.role && to.meta.role !== user.role) {
    return next('/login')
  }

  next()
})

export default router
