<script setup lang="ts">
import Contenedor from '@/components/Contenedor.vue'
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
          <img class="logo" src="@/components/Logo.svg" />

          <RouterLink to="/student/home" class="link"> Home</RouterLink>
          <RouterLink to="/student/profile" class="link link-perfil">Perfil</RouterLink>
          <RouterLink to="/student/groups" class="link"> Grupos</RouterLink>
          <RouterLink to="/student/tasks" class="link"> Tareas</RouterLink>
          <RouterLink to="/student/announcements" class="link"> Anuncios</RouterLink>
          <RouterLink to="/student/messages" class="link"> Mensajes</RouterLink>
          <RouterLink to="/student/notifications" class="link"> Notificaciones</RouterLink>
          <RouterLink to="/student/settings" class="link"> Configuración</RouterLink>
          <div class="sidebar-divider"></div>
          <button class="link btn-logout" v-on:click="logout">Cerrar Sesión</button>
        </nav>
      </aside>

      <div class="contenido">
        <slot />
      </div>
    </div>
</template>
<style scoped>
.btn-logout:hover {
  background: rgb(35, 12, 149)
}
</style>
