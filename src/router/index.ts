import { createRouter, createWebHistory } from 'vue-router'
import AdminRegistroView from '../views/AdminRegistroView.vue'
import RegistroView from '../views/RegistroView.vue'
import LoginView from '@/views/LoginView.vue'
import HomeTeacherView from '@/views/HomeTeacherView.vue'
import ProfileTeacherView from '@/views/ProfileTeacherView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/teacher/home',
      name: 'home',
      component: HomeTeacherView,
    },
    {
      path: '/teacher/profile',
      name: 'profile',
      component: ProfileTeacherView,
    },
    {
      path: '/adminRegister',
      name: 'AdminRegister',
      component: AdminRegistroView,
    },
    
    {
      path: '/Register',
      name: 'Register',
      component: RegistroView,
    },


   {
      path: '/login',
      name: 'Login',
      component: LoginView,
    
    },
   
  ],
})

export default router