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
import GradesParentView from '@/views/GradesParentView.vue'
import NotificationParentView from '@/views/NotificationParentView.vue'
import SettingsParentView from '@/views/SettingsParentView.vue'
import TaskDetailTeacherView from '@/views/TaskDetailTeacherView.vue'
import AdminHomeView from '@/views/AdminHomeView.vue'
import { useAuthStore } from '@/stores/authStore'
import TeacherShowGroupView from "@/views/TeacherShowGroupView.vue";
import HomeStudentView from "@/views/HomeStudentView.vue";
import TaskDetailStudentView from "@/views/TaskDetailStudentView.vue";
import TaskStudentView from "@/views/TaskStudentView.vue";
import AdminUsersView from '@/views/AdminUsersView.vue'
import ProfileStudentView from '@/views/ProfileStudentView.vue'
import AdminRolesView from '@/views/AdminRolesView.vue'
import AdminGroupsView from '@/views/AdminGroupsView.vue'
import AdminAssignmentsView from '@/views/AdminAssignmentsView.vue'
import AdminAnnouncementsView from '@/views/AdminAnnouncementsView.vue'
import studentGroupsView from '@/views/studentGroupsView.vue'
import StudentMessagesView from '@/views/StudentMessagesView.vue'
import NotificationStudentView from '@/views/NotificationStudentView.vue'
import NotificationTeacherView from '@/views/NotificationTeacherView.vue'
import AdminPeriodsView from '@/views/AdminPeriodsView.vue'
import ShowGroupParent from '@/views/ShowGroupParent.vue'
import TaskDetailParentView from '@/views/TaskDetailParentView.vue'
import AnnouncementParentView from '@/views/AnnouncementParentView.vue'
import AnnouncementDetailView from '@/views/AnnouncementDetailView.vue'
import StudentAnnouncementsView from '@/views/StudentAnnouncementsView.vue'
import TeacherMessagesView from '@/views/TeacherMessagesView.vue'

//ROLES//
//1-admin
//2-teacher
//3-student
//4-parent

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    //Auth / Rutas "publicas"
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

    //Admin
    {
      path: '/adminRegister',
      name: 'AdminRegister',
      component: AdminRegistroView,
      meta: { requiresAuth: true, rol: 1 },
    },
    {
      path: '/admin/home',
      name: 'AdminHome',
      component: AdminHomeView,
      meta: { requiresAuth: true, rol: 1 },
    },
    {
      path: '/admin/users',
      name: 'AdminUsers',
      component: AdminUsersView,
      meta: { requiresAuth: true, rol: 1 },
    },
    {
      path: '/admin/roles',
      name: 'AdminRoles',
      component: AdminRolesView,
      meta: { requiresAuth: true, rol: 1 },
    },
    {
      path: '/admin/groups',
      name: 'AdminGroups',
      component: AdminGroupsView,
      meta: { requiresAuth: true, rol: 1 },
    },
    {
      path: '/admin/assignments',
      name: 'AdminAssignments',
      component: AdminAssignmentsView,
      meta: { requiresAuth: true, rol: 1 },
    },
    {
      path: '/admin/announcements',
      name: 'AdminAnnouncements',
      component: AdminAnnouncementsView,
      meta: { requiresAuth: true, rol: 1 },
    },
    {
      path: '/admin/periods',
      name: 'AdminPeriods',
      component: AdminPeriodsView,
      meta: { requiresAuth: true, rol: 1 },
    },

    //TEACHER

    {
      path: '/teacher/home',
      name: 'home',
      component: HomeTeacherView,
      meta: { requiresAuth: true, rol: 2 },
    },

    {
      path: '/teacher/profile',
      name: 'profile',
      component: ProfileTeacherView,
      meta: { requiresAuth: true, rol: 2 },
    },
    {
      path: '/student/announcements',
      name: 'profile',
      component: StudentAnnouncementsView,
      meta: { requiresAuth: true, rol: 3 },
    },

    {
      path: '/teacher/groups',
      name: 'groups',
      component: GroupsTeacherView,
      meta: { requiresAuth: true, rol: 2 },
    },

    {
      path: '/teacher/show/group/:id',
      name: 'teachershowgroup',
      component: TeacherShowGroupView,
      meta: { requiresAuth: true, rol: 2 },
    },

    {
      path: '/teacher/tasks',
      name: 'tasks',
      component: TasksTeacherView,
      meta: { requiresAuth: true, rol: 2 },
    },

    {
      path: '/teacher/tasks/:id',
      name: 'teacherTasksDetail',
      component: TaskDetailTeacherView,
      meta: { requiresAuth: true, rol: [1, 2] },
    },

    {
      path: '/teacher/announcements',
      name: 'announcements',
      component: AnnouncementTeacherView,
      meta: { requiresAuth: true, rol: 2 },
    },

    {
      path: '/teacher/messages',
      name: 'messages',
      component: TeacherMessagesView,
      meta: { requiresAuth: true, rol: 2 },
    },
    {
      path: '/teacher/notifications',
      name: 'teacherNotifications',
      component: NotificationTeacherView,
      meta: { requiresAuth: true, rol: 2 },
    },

    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true },
    },

    //STUDENT
    {
      path: '/student/home',
      name: 'studentHome',
      component: HomeStudentView,
      meta: { requiresAuth: true, rol: 3 },
    },

    {
      path: '/student/profile',
      name: 'studentProfile',
      component: ProfileStudentView,
      meta: { requiresAuth: true, rol: 3 },
    },

    {
      path: '/student/tasks',
      name: 'studentTasks',
      component: TaskStudentView,
      meta: { requiresAuth: true, rol: 3 },
    },

    {
      path: '/student/tasks/:id',
      name: 'studentTasksDetail',
      component: TaskDetailStudentView,
      meta: { requiresAuth: true, rol: 3 },
    },
    {
      path: '/student/groups',
      name: 'studentgroups',
      component: studentGroupsView,
      meta: { requiresAuth: true, rol: 3 },
    },
    {
      path: '/student/messages',
      name: 'studentMessages',
      component: StudentMessagesView,
      meta: { requiresAuth: true, rol: 3 },
    },
    {
      path: '/student/notifications',
      name: 'studentNotifications',
      component: NotificationStudentView,
      meta: { requiresAuth: true, rol: 3 },
    },

    // Parent
    {
      path: '/parent/home',
      name: 'parentHome',
      component: HomeParentView,
      meta: { requiresAuth: true, rol: 4 },
    },

    {
      path: '/parent/profile',
      name: 'parentProfile',
      component: ProfileParentView,
      meta: { requiresAuth: true, rol: 4 },
    },

    {
      path: '/parent/students',
      name: 'parentStudents',
      component: StudentsParentView,
      meta: { requiresAuth: true, rol: 4 },
    },

    {
      path: '/parent/groups',
      name: 'parentGroups',
      component: GroupsParentView,
      meta: { requiresAuth: true, rol: 4 },
    },

    {
      path: '/parent/groups/:id/:childId',
      name: 'parentGroupDetail',
      component: ShowGroupParent,
      meta: { requiresAuth: true, rol: 4 },
    },

    {
      path: '/parent/groups/:id/assignments/:childId',
      name: 'parentGroupAssignmentDetail',
      component: TaskDetailParentView,
      meta: { requiresAuth: true, rol: 4 },
    },

    {
      path: '/parent/assignments/',
      name: 'parentAssignments',
      component: TasksParentView,
      meta: { requiresAuth: true, rol: 4 },
    },

    {
      path: '/parent/assignments/:id/:childId',
      name: 'parentAssignmentsDetail',
      component: TaskDetailParentView,
      meta: { requiresAuth: true, rol: 4 },
    },

    {
      path: '/parent/announcements',
      name: 'parentAnnouncements',
      component: AnnouncementParentView,
      meta: { requiresAuth: true, rol: 4 },
    },

    {
      path: '/parent/announcements/:id',
      name: 'parentAnnouncementDetail',
      component: AnnouncementDetailView,
      props: true,
      meta: { requiresAuth: true, rol: 4 },
    },

    {
      path: '/parent/grades',
      name: 'parentGrades',
      component: GradesParentView,
      meta: { requiresAuth: true, rol: 4 },
    },

    {
      path: '/parent/notifications',
      name: 'parentNotifications',
      component: NotificationParentView,
      meta: { requiresAuth: true, rol: 4 },
    },

    {
      path: '/parent/settings',
      name: 'parentSettings',
      component: SettingsParentView,
      meta: { requiresAuth: true, rol: 4 },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const user = authStore.credentials

  // 🚫 Evitar que usuarios logueados entren a login
  if (to.name === 'Login' && user) {
    const role = user.user.role.id

    switch (role) {
      case 1: return next({ name: 'AdminHome' })
      case 2: return next({ name: 'home' })
      case 3: return next({ name: 'studentHome' })
      case 4: return next({ name: 'parentHome' })
      default: return next()
    }
  }

  // 🔐 Rutas protegidas
  if (to.matched.some(r => r.meta.requiresAuth)) {
    if (!user) {
      return next({ name: 'Login' })
    }

    if (to.meta.rol) {
      const role = user.user.role.id
      const allowedRoles = Array.isArray(to.meta.rol) ? to.meta.rol : [to.meta.rol]

      if (!allowedRoles.includes(role)) {
        return next({ name: 'Login' })
      }
    }
  }

  // 🔁 Redirección desde "/"
  if (to.path === '/') {
    if (!user) {
      return next({ name: 'Login' })
    }

    const role = user.user.role.id

    switch (role) {
      case 1: return next({ name: 'AdminHome' })
      case 2: return next({ name: 'home' })
      case 3: return next({ name: 'studentHome' })
      case 4: return next({ name: 'parentHome' })
      default: return next({ name: 'Login' })
    }
  }

  return next()
})

export default router
