<script setup lang="ts">
import { computed } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import GroupCard from '@/components/GroupChildCard.vue'
import { useapi } from '@/assets/composables/useApi'

const { data, error, isFetching } = useapi('/parent/groups').json()
const childrenGroups = computed(() => {
  if (!data.value) return []
  return data.value.data || data.value || []
})
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center">
      <h1>Grupos Inscritos</h1>
    </div>

    <div v-if="isFetching" class="state-container">
      <div class="loader-dots"></div>
      <p class="state-msg">Consultando grupos y asignaturas...</p>
    </div>

    <div v-else-if="error" class="state-container error">
      <div class="icon-circle">⚠️</div>
      <p class="state-msg">No pudimos obtener la información de los grupos.</p>
      <span class="state-subtitle">Por favor, intenta de nuevo en unos momentos.</span>
    </div>

    <div v-else class="ContBig" style="margin-top: 40px">
      <div v-if="childrenGroups.length === 0" class="state-container empty">
        <div class="icon-circle">📚</div>
        <p class="state-msg">Aún no hay grupos registrados.</p>
        <span class="state-subtitle"
          >Los grupos aparecerán aquí cuando los alumnos sean inscritos.</span
        >
      </div>

      <div v-else v-for="child in childrenGroups" :key="child.childId" class="child-section">
        <div class="child-header">
          <div class="line"></div>
          <h2>{{ child.childName || 'Estudiante' }}</h2>
          <div class="line"></div>
        </div>

        <div class="groups-grid">
          <GroupCard
            v-for="group in child.groups || child.enrolled_groups || []"
            :key="group.id"
            :group="group"
          />
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<style scoped>
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
}

.state-msg {
  font-size: 1.1rem;
  font-weight: 600;
  color: #555;
  margin-top: 15px;
}

.state-subtitle {
  font-size: 0.9rem;
  color: #999;
  margin-top: 5px;
}

.icon-circle {
  width: 70px;
  height: 70px;
  background: #f0f2f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 10px;
}

.error .icon-circle {
  background: #fff1f0;
}
.empty .icon-circle {
  background: #e6f7ff;
}

.loader-dots {
  width: 50px;
  aspect-ratio: 2;
  --_g: no-repeat radial-gradient(circle closest-side, #000 90%, #0000);
  background:
    var(--_g) 0% 50%,
    var(--_g) 50% 50%,
    var(--_g) 100% 50%;
  background-size: calc(100% / 3) 50%;
  animation: l3 1s infinite linear;
  opacity: 0.3;
}
@keyframes l3 {
  20% {
    background-position:
      0% 0%,
      50% 50%,
      100% 50%;
  }
  40% {
    background-position:
      0% 100%,
      50% 0%,
      100% 50%;
  }
  60% {
    background-position:
      0% 50%,
      50% 100%,
      100% 0%;
  }
  80% {
    background-position:
      0% 50%,
      50% 50%,
      100% 100%;
  }
}

/* --- DISEÑO DE LA VISTA --- */
.ContSmall {
  background: var(--color-Azul);
  width: 95%;
  max-width: 1000px;
  height: 60px;
  border-radius: 20px;
  margin: 0 auto;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ContBig {
  background: var(--color-Blanco);
  width: 95%;
  max-width: 1000px;
  min-height: 500px;
  border-radius: 20px;
  margin: 40px auto;
  padding: 30px;
  box-sizing: border-box;
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.ContBig::-webkit-scrollbar {
  display: none;
}

h1 {
  font-size: 1.4rem;
  margin: 0;
}

.child-section {
  margin-bottom: 40px;
}

.child-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.child-header h2 {
  font-size: 1.1rem;
  color: var(--color-AzulTres);
  white-space: nowrap;
  font-weight: bold;
}

.line {
  flex-grow: 1;
  height: 1px;
  background: #f0f0f0;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

@media (max-width: 768px) {
  .groups-grid {
    grid-template-columns: 1fr;
  }
  .ContBig {
    padding: 20px;
  }
}
</style>
