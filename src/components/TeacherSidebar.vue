<script setup lang="ts">
import Contenedor from '@/components/Contenedor.vue'
</script>

<template>

<Contenedor>
  <div class="layout">

    <aside class="sidebar">
      <nav class="columna">

        <img class="logo" src="@/components/Logo.svg" />

        <RouterLink to="/teacher/home" class="link"> Home</RouterLink>
        <RouterLink to="/teacher/profile" class="link"> Perfil</RouterLink>
        <RouterLink to="/teacher/groups" class="link"> Grupos</RouterLink>
        <RouterLink to="/teacher/tasks" class="link"> Tareas</RouterLink>
        <RouterLink to="/teacher/forum" class="link"> Foro</RouterLink>
        <RouterLink to="/teacher/messages" class="link"> Mensajes</RouterLink>
        <RouterLink to="/teacher/notifications" class="link"> Notificaciones</RouterLink>
        <RouterLink to="/teacher/settings" class="link"> Configuración</RouterLink>
        <button>Cerrar Sesión</button>

      </nav>
    </aside>

   
    <div class="contenido">
      <slot />
    </div>

  </div>
</Contenedor>

</template>