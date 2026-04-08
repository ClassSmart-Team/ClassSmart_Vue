<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore.ts'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const auth = useAuthStore()
const router = useRouter()

const menuOpen = ref(false)
const openDropdown = ref<string | null>(null)

const logout = () => {
  auth.logout()
  router.push('/login')
}

const toggleMobileMenu = () => {
  menuOpen.value = !menuOpen.value
  openDropdown.value = null
}

const toggleDropdown = (menuName: string) => {
  openDropdown.value = openDropdown.value === menuName ? null : menuName
}

const closeAll = () => {
  menuOpen.value = false
  openDropdown.value = null
}

const adminCrudMenus = [
  {
    key: 'users',
    label: 'Usuarios',
    items: [
      { label: 'Lista de usuarios', to: '/admin/users' },
      { label: 'Crear usuario', to: '/admin/users/create' },
      { label: 'Gestionar usuario', to: '/admin/users/manage' },
      { label: 'Desactivar usuario', to: '/admin/users/deactivate' },
      { label: 'Reactivar usuario', to: '/admin/users/reactivate' },
    ],
  },
  {
    key: 'roles',
    label: 'Roles',
    items: [
      { label: 'Lista de roles', to: '/admin/roles' },
      { label: 'Crear rol', to: '/admin/roles/create' },
      { label: 'Gestionar rol', to: '/admin/roles/manage' },
    ],
  },
  {
    key: 'groups',
    label: 'Grupos',
    items: [
      { label: 'Lista de grupos', to: '/admin/groups' },
      { label: 'Crear grupo', to: '/admin/groups/create' },
      { label: 'Gestionar grupo', to: '/admin/groups/manage' },
    ],
  },
  {
    key: 'tasks',
    label: 'Tareas',
    items: [
      { label: 'Lista de tareas', to: '/admin/tasks' },
      { label: 'Crear tarea', to: '/admin/tasks/create' },
      { label: 'Gestionar tarea', to: '/admin/tasks/manage' },
    ],
  },
  {
    key: 'announcements',
    label: 'Anuncios',
    items: [
      { label: 'Lista de anuncios', to: '/admin/announcements' },
      { label: 'Crear anuncio', to: '/admin/announcements/create' },
      { label: 'Gestionar anuncio', to: '/admin/announcements/manage' },
    ],
  },
]
</script>

<template>
  <div class="admin-nav-shell">
    <header class="admin-navbar">
      <div class="admin-navbar-inner">
        <img class="admin-navbar-logo" src="@/components/Logo.svg" alt="Logo" />

        <!-- Desktop -->
        <nav class="admin-navbar-links-desktop">
          <RouterLink to="/admin/home" class="admin-nav-link">
            Home
          </RouterLink>

          <div
            v-for="menu in adminCrudMenus"
            :key="menu.key"
            class="admin-dropdown-wrapper"
          >
            <button
              class="admin-nav-link admin-dropdown-trigger"
              type="button"
              @click="toggleDropdown(menu.key)"
            >
              {{ menu.label }} {{ openDropdown === menu.key ? '▴' : '▾' }}
            </button>

            <div
              class="admin-dropdown-menu"
              :class="{ open: openDropdown === menu.key }"
            >
              <RouterLink
                v-for="item in menu.items"
                :key="item.to"
                :to="item.to"
                class="admin-dropdown-item"
                @click="closeAll"
              >
                {{ item.label }}
              </RouterLink>
            </div>
          </div>
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

        <div
          v-for="menu in adminCrudMenus"
          :key="menu.key"
          class="admin-mobile-section"
        >
          <button
            class="admin-nav-link admin-mobile-section-trigger"
            type="button"
            @click="toggleDropdown(menu.key)"
          >
            {{ menu.label }} {{ openDropdown === menu.key ? '▴' : '▾' }}
          </button>

          <div
            class="admin-mobile-submenu"
            :class="{ open: openDropdown === menu.key }"
          >
            <RouterLink
              v-for="item in menu.items"
              :key="item.to"
              :to="item.to"
              class="admin-nav-link admin-submenu-item"
              @click="closeAll"
            >
              {{ item.label }}
            </RouterLink>
          </div>
        </div>

        <button
          class="admin-nav-link admin-btn-logout"
          type="button"
          @click="logout"
        >
          Cerrar Sesión
        </button>
      </nav>
    </header>

    <div
      v-if="openDropdown"
      class="admin-navbar-backdrop"
      @click="openDropdown = null"
    ></div>

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
  gap: 4px;
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
  padding: 7px 11px;
  border-radius: 8px;
  transition: background 0.2s ease;
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

.admin-navbar :deep(.router-link-active) {
  background: white;
  color: var(--color-AzulCuatro);
  font-weight: 700;
}

.admin-btn-logout {
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.admin-dropdown-wrapper {
  position: relative;
}

.admin-dropdown-trigger {
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.admin-dropdown-menu {
  display: none;
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  z-index: 300;
  overflow: hidden;
  flex-direction: column;
}

.admin-dropdown-menu.open {
  display: flex;
}

.admin-dropdown-item {
  padding: 11px 16px;
  font-size: 13.5px;
  color: var(--color-Texto);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  text-decoration: none;
  transition: background 0.15s ease;
  display: block;
}

.admin-dropdown-item:hover {
  background: var(--color-Contenedor);
}

.admin-navbar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 199;
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
  gap: 4px;
}

.admin-navbar-links-mobile.active {
  display: flex;
}

.admin-mobile-section {
  display: flex;
  flex-direction: column;
}

.admin-mobile-section-trigger {
  text-align: left;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.admin-mobile-submenu {
  display: none;
  flex-direction: column;
  padding-left: 12px;
  border-left: 2px solid rgba(255, 255, 255, 0.3);
  margin-left: 11px;
  gap: 2px;
}

.admin-mobile-submenu.open {
  display: flex;
}

.admin-submenu-item {
  font-size: 13px;
  opacity: 0.92;
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