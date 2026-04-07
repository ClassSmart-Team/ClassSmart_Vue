<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore.ts'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const use = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

const logout = () => {
  use.logout()
  router.push('/login')
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
</script>

<template>
  <div class="app-shell">
    <!-- NAVBAR -->
    <header class="navbar">
      <div class="navbar-inner">

        <!-- Logo -->
        <img class="logo" src="@/components/Logo.svg" alt="Logo" />

        <!-- Links visibles en desktop -->
        <nav class="links-desktop">
          <RouterLink to="/admin/home" class="link">Home</RouterLink>
          <RouterLink to="/admin/profile" class="link">Perfil</RouterLink>
          <RouterLink to="/admin/groups" class="link">Grupos</RouterLink>
          <RouterLink to="/admin/tasks" class="link">Tareas</RouterLink>
          <RouterLink to="/admin/announcements" class="link">Anuncios</RouterLink>
          <RouterLink to="/admin/messages" class="link">Mensajes</RouterLink>
          <RouterLink to="/admin/notifications" class="link">Notificaciones</RouterLink>
          <RouterLink to="/settings" class="link">Configuración</RouterLink>
        </nav>

        <!-- Derecha: bienvenida + logout + hamburger -->
        <div class="navbar-right">
          <span class="user-welcome">
            Bienvenido, <strong>{{ use.credentials?.user.name }}</strong>
          </span>
          <button class="link btn-logout" @click="logout">Cerrar Sesión</button>

          <!-- Botón hamburger solo en móvil -->
          <button class="hamburger" @click="toggleMenu" aria-label="Abrir menú">
            <span :class="{ open: menuOpen }"></span>
            <span :class="{ open: menuOpen }"></span>
            <span :class="{ open: menuOpen }"></span>
          </button>
        </div>
      </div>

      <!-- Menú desplegable en móvil -->
      <nav class="links-mobile" :class="{ active: menuOpen }">
        <RouterLink to="/admin/home" class="link" @click="menuOpen = false">Home</RouterLink>
        <RouterLink to="/admin/profile" class="link" @click="menuOpen = false">Perfil</RouterLink>
        <RouterLink to="/admin/groups" class="link" @click="menuOpen = false">Grupos</RouterLink>
        <RouterLink to="/admin/tasks" class="link" @click="menuOpen = false">Tareas</RouterLink>
        <RouterLink to="/admin/announcements" class="link" @click="menuOpen = false">Anuncios</RouterLink>
        <RouterLink to="/admin/messages" class="link" @click="menuOpen = false">Mensajes</RouterLink>
        <RouterLink to="/admin/notifications" class="link" @click="menuOpen = false">Notificaciones</RouterLink>
        <RouterLink to="/settings" class="link" @click="menuOpen = false">Configuración</RouterLink>
        <button class="link btn-logout" @click="logout">Cerrar Sesión</button>
      </nav>
    </header>

    <!-- CONTENIDO DE LA PÁGINA -->
    <main class="page-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
/* Shell que ocupa toda la pantalla */
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-Contenedor);
}

/* Navbar pegada arriba */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(90deg, var(--color-AzulCuatro), var(--color-Complemento));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  width: 100%;
}

/* Fila principal del navbar */
.navbar-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  width: 100%;
  box-sizing: border-box;
}

/* Logo */
.logo {
  height: 44px;
  flex-shrink: 0;
}

/* Links en desktop */
.links-desktop {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

/* Lado derecho del navbar */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* Texto bienvenida */
.user-welcome {
  color: white;
  font-size: 14px;
  white-space: nowrap;
}

/* Links y botones */
.link {
  text-decoration: none;
  color: white;
  font-weight: 500;
  font-size: 13px;
  padding: 7px 11px;
  border-radius: 8px;
  transition: background 0.2s ease;
  cursor: pointer;
  background: none;
  border: none;
  font-family: inherit;
}

.link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.router-link-active {
  background: white;
  color: var(--color-AzulCuatro);
  font-weight: 700;
}

/* Botón cerrar sesión con borde */
.btn-logout {
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* Hamburger — oculto en desktop */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

/* Animación X al abrir */
.hamburger span.open:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.hamburger span.open:nth-child(2) {
  opacity: 0;
}
.hamburger span.open:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Menú móvil — oculto por defecto */
.links-mobile {
  display: none;
  flex-direction: column;
  padding: 0 20px 12px;
  gap: 4px;
}

.links-mobile.active {
  display: flex;
}

/* Contenido debajo del navbar */
.page-content {
  flex: 1;
  padding: 24px 20px;
  box-sizing: border-box;
  width: 100%;
}

/* ── BREAKPOINTS ── */

/* Tablet y móvil: ocultamos links de desktop, mostramos hamburger */
@media (max-width: 900px) {
  .links-desktop {
    display: none;
  }

  /* El logout del desktop se va al menú móvil */
  .navbar-right .btn-logout {
    display: none;
  }

  .hamburger {
    display: flex;
  }
}

/* Móvil pequeño: ocultamos el saludo para no saturar */
@media (max-width: 480px) {
  .user-welcome {
    display: none;
  }
}
</style>