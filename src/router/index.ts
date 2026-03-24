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


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      path: '/teacher/groups',
      name: 'groups',
      component: GroupsTeacherView,
    },

   {
      path: '/teacher/tasks',
      name: 'tasks',
      component: TasksTeacherView,
    },
   

   {
      path: '/teacher/announcements',
      name: 'announcements',
      component: AnnouncementTeacherView,
    },
   
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
   
   
  ],
})

export default router