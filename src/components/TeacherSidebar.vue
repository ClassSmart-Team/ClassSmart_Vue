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
  <Contenedor>
    <div class="layout">
      <aside class="sidebar">
        <nav class="columna">
          <img class="logo" src="@/components/Logo.svg" />

          <RouterLink to="/teacher/home" class="link"> Home</RouterLink>

          <RouterLink to="/teacher/profile" class="link link-perfil">
            <div class="avatar">
              {{ us.credentials?.user.name.charAt(0) }}{{ us.credentials?.user.lastname.charAt(0) }}
            </div>
            Perfil</RouterLink
          >
          <RouterLink to="/teacher/groups" class="link"> Grupos</RouterLink>
          <RouterLink to="/teacher/tasks" class="link"> Tareas</RouterLink>
          <RouterLink to="/teacher/announcements" class="link"> Anuncios</RouterLink>
          <RouterLink to="/teacher/messages" class="link"> Mensajes</RouterLink>
          <RouterLink to="/teacher/notifications" class="link"> Notificaciones</RouterLink>
          <RouterLink to="/settings" class="link"> Configuración</RouterLink>
          <button class="link" v-on:click="logout">Cerrar Sesión</button>
        </nav>
      </aside>

      <div class="contenido">
        <slot />
      </div>
    </div>
  </Contenedor>
</template>
<style scoped>
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e1f5ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #0f6e56;
}
.link-perfil {
  display: flex;
  flex-direction: row; /* los elementos van en fila horizontal */
  align-items: center; /* los centra verticalmente entre sí */
  gap: 8px; /* espacio entre la palabra "Perfil" y el avatar */
}
</style>
