<script setup lang="ts">
import Contenedor from '@/components/Contenedor.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { ref } from 'vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const authStore = useAuthStore()

const logout = () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    authStore.logout()
  }
}
</script>

<template>
  <Contenedor>
    <div class="layout">
      <button class="mobile-hamburger" @click="toggleMenu" aria-label="Abrir menú">
        <div class="bar" :class="{ 'open-top': isMenuOpen }"></div>
        <div class="bar" :class="{ 'open-mid': isMenuOpen }"></div>
        <div class="bar" :class="{ 'open-bot': isMenuOpen }"></div>
      </button>

      <Transition name="fade">
        <div v-if="isMenuOpen" class="sidebar-overlay" @click="toggleMenu"></div>
      </Transition>

      <aside class="sidebar" :class="{ 'sidebar-active': isMenuOpen }">
        <nav class="columna">
          <img class="logo" src="@/components/Logo.svg" />

          <div class="menu-links" @click="isMenuOpen = false">
            <RouterLink to="/parent/home" class="link"> Home</RouterLink>
            <RouterLink to="/parent/profile" class="link link-perfil"> Perfil</RouterLink>
            <RouterLink to="/parent/students" class="link"> Alumnos</RouterLink>
            <RouterLink to="/parent/groups" class="link"> Grupos</RouterLink>
            <RouterLink to="/parent/assignments" class="link"> Tareas</RouterLink>
            <RouterLink to="/parent/announcements" class="link"> Anuncios</RouterLink>
            <RouterLink to="/parent/grades" class="link"> Calificaciones</RouterLink>
            <RouterLink to="/parent/notifications" class="link"> Notificaciones</RouterLink>
            <RouterLink to="/parent/settings" class="link"> Configuración</RouterLink>
          </div>

          <div class="sidebar-footer">
            <div class="sidebar-divider"></div>
            <button class="link btn-logout" @click="logout">Cerrar Sesión</button>
          </div>
        </nav>
      </aside>

      <div class="contenido">
        <slot />
      </div>
    </div>
  </Contenedor>
</template>

<style scoped>
.btn-logout:hover {
  background: rgb(35, 12, 149);
}

.layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.sidebar {
  width: 260px;
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-Azul), var(--color-AzulTres));
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  transition: all 0.4s ease;
}

.columna {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.logo-container {
  padding: 20px 0;
  text-align: center;
}

.logo {
  width: 140px;
}

.menu-links {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ESTILO DE LINKS */

.link:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
}

/* CORRECCIÓN PARTE BLANCA: Estilo del link activo */
.router-link-active {
  background: rgba(255, 255, 255, 0.25) !important;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 15px 0;
}

.btn-logout {
  color: #ffcfcf;
}

.btn-logout:hover {
  background: rgba(220, 53, 69, 0.2);
}

.contenido {
  flex: 1;
  margin-left: 260px;
  padding: 20px;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .sidebar {
    left: -260px;
    width: 260px;
  }

  .sidebar-active {
    left: 0;
  }

  .contenido {
    margin-left: 0;
    padding-top: 10px;
  }

  .mobile-hamburger {
    display: flex;
    position: absolute;
    top: 65px;
    left: 10px;
    z-index: 2000;
    background: var(--color-Azul);
    border: none;
    width: 45px;
    height: 45px;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    margin: 0;
  }

  .layout {
    display: flex;
    flex-direction: column; /* Apilamos pero controlamos el header */
  }

  .bar {
    width: 22px;
    height: 3px;
    background: white;
    border-radius: 2px;
    transition: 0.3s;
  }
  .open-top {
    transform: translateY(8px) rotate(45deg);
  }
  .open-mid {
    opacity: 0;
  }
  .open-bot {
    transform: translateY(-8px) rotate(-45deg);
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    z-index: 998;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
