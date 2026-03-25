import { createRouter, createWebHistory } from 'vue-router'
import AdminRegistroView from '../views/AdminRegistroView.vue'
import RegistroView from '../views/RegistroView.vue'
import LoginView from '@/views/LoginView.vue'
import HomeTeacherView from '@/views/HomeTeacherView.vue'
import ProfileTeacherView from '@/views/ProfileTeacherView.vue'
import GroupsTeacherView from '@/views/GroupsTeacherView.vue'
import TasksTeacherView from '@/views/TasksTeacherView.vue'
import AnnouncementTeacherView from '@/views/AnnouncementTeacherView.vue'
import SettingsView from '@/views/SettingsView.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/adminRegister',
      name: 'AdminRegister',
      component: AdminRegistroView,
    },

    {
      path: '/register',
      name: 'Register',
      component: RegistroView,
    },

    {
      path: '/login',
      name: 'Login',
      component: LoginView,
    },

  
    {
      path: '/teacher/home',
      name: 'home',
      component: HomeTeacherView,
      meta: { requiresAuth: true, rol: 1 },
    },

    {
      path: '/teacher/profile',
      name: 'profile',
      component: ProfileTeacherView,
      meta: { requiresAuth: true, rol: 1 },
    },

    {
      path: '/teacher/groups',
      name: 'groups',
      component: GroupsTeacherView,
      meta: { requiresAuth: true, rol: 1 },
    },

    {
      path: '/teacher/tasks',
      name: 'tasks',
      component: TasksTeacherView,
      meta: { requiresAuth: true, rol: 1 },
    },

    {
      path: '/teacher/announcements',
      name: 'announcements',
      component: AnnouncementTeacherView,
      meta: { requiresAuth: true, rol: 1 },
    },

    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.matched.some((r) => r.meta.requiresAuth)) {
    if (!authStore.credentials) {
      return next({ name: 'Login' })
    }

    
    if (to.meta.rol) {
      if (authStore.credentials.user.role.id === to.meta.rol) {
        return next()
      } else {
        return next({ name: 'Login' })
      }
    }

    return next()
  }


  if (to.name === 'Login' && authStore.credentials) {
    return next({ name: 'home' })
  }

  next()
})

export default router