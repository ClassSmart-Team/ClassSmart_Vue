<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore.ts'
import { useRouter } from 'vue-router'

const us = useAuthStore()
const router = useRouter()

const logout = () => {
  us.logout()
  router.push('/login')
}
</script>

<template>
  <div class="layout">

    <aside class="sidebar">
      <nav class="columna">
        <img class="logo" src="@/components/Logo.svg" alt="Logo" />

        <RouterLink to="/teacher/home" class="link">Home</RouterLink>
        <RouterLink to="/teacher/profile" class="link">Perfil</RouterLink>
        <RouterLink to="/teacher/groups" class="link">Grupos</RouterLink>
        <RouterLink to="/teacher/tasks" class="link">Tareas</RouterLink>
        <RouterLink to="/teacher/announcements" class="link">Anuncios</RouterLink>
        <RouterLink to="/teacher/messages" class="link">Mensajes</RouterLink>
        <RouterLink to="/teacher/notifications" class="link">Notificaciones</RouterLink>
        <RouterLink to="/teacher/settings" class="link">Configuración</RouterLink>

        <div class="sidebar-divider"></div>

        <button class="link btn-logout" @click="logout">Cerrar Sesión</button>
      </nav>
    </aside>

    <div class="contenido">
      <slot />
    </div>

  </div>
</template>

<style scoped>
/* Solo lo específico de este componente */
.btn-logout:hover {
  background: rgb(35, 12, 149)
}
</style>
