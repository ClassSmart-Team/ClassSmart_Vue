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
import HomeParentView from '@/views/HomeParentView.vue'
import ProfileParentView from '@/views/ProfileParentView.vue'
import StudentsParentView from '@/views/StudentsParentView.vue'
import GroupsParentView from '@/views/GroupsParentView.vue'
import TasksParentView from '@/views/TasksParentView.vue'
import ForumParentView from '@/views/ForumParentView.vue'
import GradesParentView from '@/views/GradesParentView.vue'
import NotificationParentView from '@/views/NotificationParentView.vue'
import SettingsParentView from '@/views/SettingsParentView.vue'
import ShowGroup from '@/views/ShowGroup.vue'
import TaskDetailView from '@/views/TaskDetailView.vue'
import ForumDetailView from '@/views/ForumDetailView.vue'
import { useAuthStore } from '@/stores/authStore'


//ROLES//
//1-admin
//2-teacher
//3-student
//4-parent

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
      path: '/teacher/messages',
      name: 'messages',
      component: HomeTeacherView, // temporal
      meta: { requiresAuth: true, rol: [1,2] },
    },
    {
      path: '/teacher/notifications',
      name: 'notifications',
      component: HomeTeacherView, // temporal
      meta: { requiresAuth: true, rol: [1,2] },
    },

    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true },
    },


// Parent
    {
      path: '/parent/home',
      name: 'parentHome',
      component: HomeParentView,
      meta: { requiresAuth: true, role: 4 },
    },

    {
      path: '/parent/profile',
      name: 'parentProfile',
      component: ProfileParentView,
      meta: { requiresAuth: true, role: 4 },
    },

    {
      path: '/parent/students',
      name: 'parentStudents',
      component: StudentsParentView,
      meta: { requiresAuth: true, role: 4 },
    },

    {
      path: '/parent/groups',
      name: 'parentGroups',
      component: GroupsParentView,
      meta: { requiresAuth: true, role: 4 },
    },

    {
      path: '/parent/groups/:id',
      name: 'parentGroupDetail',
      component: ShowGroup,
      meta: { requiresAuth: true, role: 4 },
    },

    {
      path: '/parent/tasks',
      name: 'parentTasks',
      component: TasksParentView,
      meta: { requiresAuth: true, role: 4 },
    },

    {
      path: '/parent/tasks/:id',
      name: 'parentTasksDetail',
      component: TaskDetailView,
      meta: { requiresAuth: true, role: 4 },
    },

    {
      path: '/parent/forum',
      name: 'parentForum',
      component: ForumParentView,
      meta: { requiresAuth: true, role: 4 },
    },

    {
      path: '/parent/forum/:id',
      name: 'parentForumDetail',
      component: ForumDetailView,
      props: true,
      meta: { requiresAuth: true, role: 4 },
    },

    {
      path: '/parent/grades',
      name: 'parentGrades',
      component: GradesParentView,
      meta: { requiresAuth: true, role: 4 },
    },

    {
      path: '/parent/notifications',
      name: 'parentNotifications',
      component: NotificationParentView,
      meta: { requiresAuth: true, role: 4 },
    },

    {
      path: '/parent/settings',
      name: 'parentSettings',
      component: SettingsParentView,
      meta: { requiresAuth: true, role: 4 },
    },

    {
      path: '/grupo/:id',
      name: 'group-detail',
      component: ShowGroup,
      props: true, // Esto permite recibir el :id como una prop en la vista de detalle
      meta: { requiresAuth: true, role: 4 },
    },

      ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.matched.some((r) => r.meta.requiresAuth)) {
    if (!authStore.credentials) {
      return next({ name: 'Login' })
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


  if (to.name === 'login' && authStore.credentials) {
    return next({ name: 'home' })
  }

  return next()
})
export default router
