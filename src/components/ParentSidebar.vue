<script setup lang="ts">
import Contenedor from '@/components/Contenedor.vue'
import { useAuthStore } from '@/stores/authStore.ts'

const authStore = useAuthStore()

const logout = () => {
  // Opcional: Agregar una confirmación rápida
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    authStore.logout()
  }
}
</script>

<template>
  <Contenedor>
    <div class="layout">
      <aside class="sidebar">
        <nav class="columna">
          <img class="logo" src="@/components/Logo.svg" />

          <RouterLink to="/parent/home" class="link"> Home</RouterLink>
          <RouterLink to="/parent/profile" class="link"> Perfil</RouterLink>
          <RouterLink to="/parent/students" class="link"> Alumnos</RouterLink>
          <RouterLink to="/parent/groups" class="link"> Grupos</RouterLink>
          <RouterLink to="/parent/tasks" class="link"> Tareas</RouterLink>
          <RouterLink to="/parent/forum" class="link"> Foro</RouterLink>
          <RouterLink to="/parent/grades" class="link"> Calificaciones</RouterLink>
          <RouterLink to="/parent/notifications" class="link"> Notificaciones</RouterLink>
          <RouterLink to="/parent/settings" class="link"> Configuración</RouterLink>
          <button @click="logout" class="btn-logout">Cerrar Sesión</button>
        </nav>
      </aside>

      <div class="contenido">
        <slot />
      </div>
    </div>
  </Contenedor>
</template>

<style scoped>
/* BOTÓN CERRAR SESIÓN EN AZULES */
.btn-logout {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 15px;

  /* Usamos tus variables de color */
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);

  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-logout:hover {
  /* Al hacer hover usamos tu azul principal */
  background: var(--color-AzulTres);
  border-color: var(--color-AzulTres);
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}



@media (max-width: 768px) {
  .btn-logout .text {
    display: none; /* En móvil puedes dejar solo el icono si el espacio es poco */
  }
  .btn-logout {
    justify-content: center;
    padding: 10px;
  }
}
</style>
