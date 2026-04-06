<script setup lang="ts">
import Sidebar from '@/components/AdminSideBar.vue'
import { useAuthStore } from '@/stores/authStore.ts'

const ua = useAuthStore()


</script>

<template>
  <div class="bg-page">
    <Sidebar>
      <!-- HEADER AZUL -->
      <div class="ContSmall center">
        <div>
          <!-- <h1>Panel de Administración</h1> -->
          <!-- <p>Bienvenido, administrador</p> -->
        </div>
      </div>
    </Sidebar>
  </div>
</template>

<style scoped>

</style>