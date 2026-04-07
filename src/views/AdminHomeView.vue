<script setup lang="ts">
import AdminNavBar from '@/components/AdminNavBar.vue'
import { useAuthStore } from '@/stores/authStore.ts'

const ua = useAuthStore()
</script>

<template>
  <AdminNavBar>
    <!-- Aquí metes el contenido del home -->
    <div class="home-wrapper">
      <h1 class="titulo">Panel de Administración</h1>
      <p class="subtitulo">Bienvenido al sistema ClassSmart, <strong>{{ ua.credentials?.user.name }}</strong></p>

      <!-- Agrega aquí tus cards, tablas, estadísticas, etc. -->
    </div>
  </AdminNavBar>
</template>

<style scoped>
.home-wrapper {
  color: var(--color-Texto);
}

.titulo {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-AzulCuatro);
  margin-bottom: 8px;
}

.subtitulo {
  font-size: 1rem;
  color: var(--color-OscuroAzulado);
}
</style>