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
import createGroupView from '@/views/createGroupView.vue'

//ROLES//
//1-admin
//2-teacher

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
      meta: { requiresAuth: true, rol: [1,2] },
    },

    {
      path: '/teacher/profile',
      name: 'profile',
      component: ProfileTeacherView,
      meta: { requiresAuth: true, rol: [1,2] },
    },

    {
      path: '/teacher/groups',
      name: 'groups',
      component: GroupsTeacherView,
      meta: { requiresAuth: true, rol: [1, 2] },
    },

    {
      path: '/teacher/tasks',
      name: 'tasks',
      component: TasksTeacherView,
      meta: { requiresAuth: true, rol: [1,2] },
    },

    {
      path: '/teacher/announcements',
      name: 'announcements',
      component: AnnouncementTeacherView,
      meta: { requiresAuth: true, rol: [1,2] },
    },

    {
      path: '/teacher/creategroup',
      name: 'creategrup',
      component: createGroupView,
     // meta: { requiresAuth: true, rol: 1 },
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
      return next({ name: 'login' })
    }

    if (to.matched.some((record) => record.meta.rol)) {
      const userRole = authStore.credentials.user.role.id
      const rolMeta = to.meta.rol

      if ((Array.isArray(rolMeta) && rolMeta.indexOf(userRole) !== -1) || userRole === rolMeta) {
        return next()  // ← agregué return
      } else {
        return next({ name: 'Login' })  // ← agregué return
      }
    }

    return next() // ← este se ejecuta solo si no hay meta.rol
  }

  if (to.name === 'Login' && authStore.credentials) {
    return next({ name: 'home' })
  }

  return next()
})
export default router
