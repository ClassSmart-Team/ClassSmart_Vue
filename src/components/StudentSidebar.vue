<script setup lang="ts">
import Contenedor from '@/components/Contenedor.vue'
</script>

<template>
  <Contenedor>
    <div class="layout">
      <aside class="sidebar">
        <nav class="columna">
          <img class="logo" src="@/components/Logo.svg" />

          <RouterLink to="/student/home" class="link"> Home</RouterLink>
          <RouterLink to="/student/profile" class="link"> Perfil</RouterLink>
          <RouterLink to="/student/groups" class="link"> Grupos</RouterLink>
          <RouterLink to="/student/tasks" class="link"> Tareas</RouterLink>
          <RouterLink to="/student/forum" class="link"> Foro</RouterLink>
          <RouterLink to="/student/grades" class="link"> Calificaciones</RouterLink>
          <RouterLink to="/student/messages" class="link"> Mensajes</RouterLink>
          <RouterLink to="/student/notifications" class="link"> Notificaciones</RouterLink>
          <RouterLink to="/student/settings" class="link"> Configuración</RouterLink>
          <button>Cerrar Sesión</button>
        </nav>
      </aside>

      <div class="contenido">
        <slot />
      </div>
    </div>
  </Contenedor>
</template>
