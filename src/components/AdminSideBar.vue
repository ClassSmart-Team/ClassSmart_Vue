<script setup lang="ts">
import Contenedor from '@/components/Contenedor.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useRouter } from 'vue-router'
const use = useAuthStore()
const router = useRouter()

const logout = () => {
  use.logout()
  router.push('/login')
}
</script>

<template>
  <Contenedor>
    <div class="layout-top">
      <header class="navbarLeft">
        <nav class="fila">
          <img class="logo" src="@/components/Logo.svg" alt="Logo" />

          <div class="links-container">
            <RouterLink to="/admin/home" class="link">Home</RouterLink>
            <RouterLink to="/admin/profile" class="link">Perfil</RouterLink>
            <RouterLink to="/admin/groups" class="link">Grupos</RouterLink>
            <RouterLink to="/admin/tasks" class="link">Tareas</RouterLink>
            <RouterLink to="/admin/announcements" class="link">Anuncios</RouterLink>
            <RouterLink to="/admin/messages" class="link">Mensajes</RouterLink>
            <RouterLink to="/admin/notifications" class="link">Notificaciones</RouterLink>
            <RouterLink to="/settings" class="link">Configuración</RouterLink>
          </div>

          <button class="link btn-logout" v-on:click="logout">Cerrar Sesión</button>
        </nav>
      </header>

      <header class="navbarRight">
        <nav class="fila">
          <span class="user-welcome">Bienvenido, <strong>{{ use.credentials?.user.name }}</strong></span>
        </nav>
      </header>

      <main class="contenido">
        <slot />
      </main>
    </div>
  </Contenedor>
</template>

<style scoped>

.layout-top {
  display: flex; /* Aseguramos que sea flex */
  flex-direction: row; /* Los dos headers van en fila */
  flex-wrap: wrap; 
  gap: 6px !important; /* Bien pegaditos */
  justify-content: center;
  padding: 20px;
}

.navbarLeft {
  background: linear-gradient(180deg, var(--color-AzulCuatro), var(--color-Complemento));
  padding: 10px 20px;
  border-radius: 15px 0px 0px 15px;
  box-shadow: 0 8px 15px rgba(0,0,0,0.2);
  flex: 2; /* Toma más espacio */
  display: flex;
  align-items: center;
}

.navbarRight {
  background: linear-gradient(180deg, var(--color-AzulCuatro), var(--color-Complemento));
  padding: 10px 20px;
  border-radius: 0px 15px 15px 0px;
  box-shadow: 0 8px 15px rgba(0,0,0,0.2);
  width: auto; /* IMPORTANTE: Que crezca con el texto */
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap; /* Evita que el nombre se baje a otra línea */
}

.user-welcome {
  color: white;
  font-size: 20px;
}

.fila {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.links-container {
  display: flex;
  gap: 5px;
}

.logo {
  height: 50px; /* Reduje un poco el logo para que la barra no sea tan alta */
  margin-right: 15px;
}

.link {
  text-decoration: none;
  color: white;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 8px;
}

.router-link-active {
  background: white;
  color: var(--color-AzulFuerte);
  font-weight: bold;
}

.contenido {
  width: 100%; /* El slot va abajo de las barras */
  padding: 20px;
}
</style>