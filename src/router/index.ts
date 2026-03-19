import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminRegistroView from '../views/AdminRegistroView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
