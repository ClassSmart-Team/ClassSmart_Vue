<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
import GroupTargect from '@/components/GroupTargect.vue'
import { useapi } from '@/assets/composables/useApi'


const { data, error, isFetching } = useapi("/groups", {
  method: 'GET',
}).json()
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>

      <!-- HEADER AZUL -->
      <div class="ContSmall center">
        <div>
          <h1>Explorar Grupos</h1>
          <p v-if="data">
            {{ data.data.length }} grupos académicos
          </p>
        </div>
      </div>

      <!-- CONTENEDOR GRANDE -->
      <div class="ContBig CenterItems">

        <!-- LOADING -->
        <div v-if="isFetching" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando grupos...</p>
        </div>

        <!-- ERROR -->
        <div v-if="error" class="error-banner">
          <span>⚠</span>
          <p>Error al conectar: {{ error }}</p>
        </div>

        <!-- GRID DE CARDS -->
        <div v-if="data && data.data" class="groups-grid">
          <GroupTargect
            v-for="group in data.data"
            :key="group.id"
            :group="group"
          />
        </div>

      </div>

    </SidebarLayout>
  </div>
</template>

<style scoped>
/* FONDO GENERAL */
.bg-page {
  position: fixed;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: linear-gradient(
    180deg,
    var(--color-OscuroAzulado),
    var(--color-OscuroDos)
  );
  z-index: -1;
}

/* HEADER */
.ContSmall {
  background: var(--color-Azul);
  width: 1000px;
  min-height: 70px;
  border-radius: 20px;
  margin: 30px auto 0 auto;
  padding: 15px;
  color: white;
}

.ContSmall h1 {
  margin: 0;
  font-size: 1.5rem;
}

.ContSmall p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* CONTENEDOR PRINCIPAL */
.ContBig {
  background: var(--color-Blanco);
  width: 1000px;
  min-height: 500px;
  border-radius: 20px;
  margin: 30px auto;
  padding: 30px;
  box-shadow: 0 10px 30px #00000030;
}

/* GRID (adaptado a tu estilo) */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

/* LOADING */
.loading-state {
  text-align: center;
  padding: 60px;
  color: var(--color-AzulTres);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid var(--color-AzulTres);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ERROR */
.error-banner {
  background: #ffe5e5;
  color: #b91c1c;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: 600;
}
</style>