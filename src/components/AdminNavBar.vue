<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore.ts'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const auth = useAuthStore()
const router = useRouter()

const menuOpen = ref(false)

const logout = () => {
  auth.logout()
  router.push('/login')
}

const toggleMobileMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeAll = () => {
  menuOpen.value = false
}

const adminModules = [
  { key: 'users', label: 'Usuarios', to: '/admin/users' },
  { key: 'roles', label: 'Roles', to: '/admin/roles' },
  { key: 'groups', label: 'Grupos', to: '/admin/groups' },
  { key: 'tasks', label: 'Tareas', to: '/admin/assignments' },
  { key: 'announcements', label: 'Anuncios', to: '/admin/announcements' },
  { key: 'periods', label: 'Periodos', to: '/admin/periods' },
]
</script>

<template>
  <div class="admin-nav-shell">
    <header class="admin-navbar">
      <div class="admin-navbar-inner">
        <img class="admin-navbar-logo" src="@/components/Logo.svg" alt="Logo" />

        <!-- Desktop -->
        <nav class="admin-navbar-links-desktop">
          <RouterLink to="/admin/home" class="admin-nav-link" @click="closeAll">
            Home
          </RouterLink>

          <RouterLink
            v-for="module in adminModules"
            :key="module.key"
            :to="module.to"
            class="admin-nav-link admin-module-link"
            @click="closeAll"
          >
            {{ module.label }}
          </RouterLink>
        </nav>

        <div class="admin-navbar-right">
          <span class="admin-user-welcome">
            Bienvenido, <strong>{{ auth.credentials?.user.name }}</strong>
          </span>

          <button
            class="admin-nav-link admin-btn-logout"
            type="button"
            @click="logout"
          >
            Cerrar Sesión
          </button>

          <button
            class="admin-hamburger"
            type="button"
            @click="toggleMobileMenu"
            aria-label="Menú"
          >
            <span :class="{ open: menuOpen }"></span>
            <span :class="{ open: menuOpen }"></span>
            <span :class="{ open: menuOpen }"></span>
          </button>
        </div>
      </div>

      <!-- Mobile -->
      <nav class="admin-navbar-links-mobile" :class="{ active: menuOpen }">
        <RouterLink to="/admin/home" class="admin-nav-link" @click="closeAll">
          Home
        </RouterLink>

        <RouterLink
          v-for="module in adminModules"
          :key="module.key"
          :to="module.to"
          class="admin-nav-link admin-mobile-link"
          @click="closeAll"
        >
          {{ module.label }}
        </RouterLink>

        <button
          class="admin-nav-link admin-btn-logout"
          type="button"
          @click="logout"
        >
          Cerrar Sesión
        </button>
      </nav>
    </header>

    <main class="admin-page-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-nav-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-Contenedor);
}

.admin-navbar {
  position: sticky;
  top: 0;
  z-index: 200;
  background: linear-gradient(90deg, var(--color-AzulCuatro), var(--color-Complemento));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  width: 100%;
}

.admin-navbar-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  box-sizing: border-box;
}

.admin-navbar-logo {
  height: 44px;
  flex-shrink: 0;
}

.admin-navbar-links-desktop {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  align-items: center;
  min-width: 0;
}

.admin-navbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.admin-user-welcome {
  color: white;
  font-size: 14px;
  white-space: nowrap;
}

.admin-nav-link {
  text-decoration: none;
  color: white;
  font-weight: 500;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s ease, color 0.2s ease;
  cursor: pointer;
  background: none;
  border: none;
  font-family: inherit;
  display: block;
  line-height: 1.2;
}

.admin-nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.admin-module-link {
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.admin-mobile-link {
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.admin-navbar :deep(.router-link-active) {
  background: white;
  color: var(--color-AzulCuatro);
  font-weight: 700;
}

.admin-btn-logout {
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.admin-hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.admin-hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.admin-hamburger span.open:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.admin-hamburger span.open:nth-child(2) {
  opacity: 0;
}

.admin-hamburger span.open:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.admin-navbar-links-mobile {
  display: none;
  flex-direction: column;
  padding: 0 20px 12px;
  gap: 6px;
}

.admin-navbar-links-mobile.active {
  display: flex;
}

.admin-page-content {
  flex: 1;
  padding: 24px 20px;
  box-sizing: border-box;
}

@media (max-width: 900px) {
  .admin-navbar-links-desktop {
    display: none;
  }

  .admin-navbar-right .admin-btn-logout {
    display: none;
  }

  .admin-hamburger {
    display: flex;
  }
}

@media (max-width: 480px) {
  .admin-user-welcome {
    display: none;
  }

  .admin-navbar-inner {
    padding: 10px 14px;
  }

  .admin-page-content {
    padding: 20px 14px;
  }
}
</style>