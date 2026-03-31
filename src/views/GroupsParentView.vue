<script setup lang="ts">
import SidebarLayout from '@/components/ParentSidebar.vue'
import GroupCard from '@/components/GroupChildCard.vue'
import { useapi } from '@/assets/composables/useApi'
import { ref } from 'vue'

// Datos estructurados según tus modelos (Hijos -> Grupos)
/* const data = ref([
  {
    childId: 1,
    childName: 'Mateo Pérez',
    // Estos datos provendrían de la relación $child->groups
    enrolledGroups: [
      {
        id: 101,
        name: 'Matemáticas IV',
        teacher: 'Lic. Kevin Flynn', // Relación ownerUser
        description: 'Aula 10 - Edificio A',
        grade: 9.5, // De GradeRecord::calcularPromedio()
      },
      {
        id: 102,
        name: 'Física I',
        teacher: 'Ing. Alan Grant',
        description: 'Laboratorio A',
        grade: 8.0,
      },
    ],
  },
  {
    childId: 2,
    childName: 'Sofía Pérez',
    enrolledGroups: [
      {
        id: 103,
        name: 'Español',
        teacher: 'Mtra. Sarah Connor',
        description: 'Aula 02',
        grade: 9.0,
      },
      {
        id: 104,
        name: 'Ciencias Naturales',
        teacher: 'Dr. Ian Malcolm',
        description: 'Aula 12',
        grade: 6.5,
      },
    ],
  },
]) */

const { data, error, isFetching } = useapi('/groups', {
  method: 'GET',
}).json()
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center">
      <h1>Grupos Inscritos</h1>
    </div>

    <div class="ContBig" style="margin-top: 40px">
      <div v-for="child in data" :key="child.childId" class="child-section">
        <div class="child-header">
          <div class="line"></div>
          <h2>{{ child.childName }}</h2>
          <div class="line"></div>
        </div>

        <div v-if="data && data.data" class="groups-grid">
          <GroupCard
            v-for="group in data.data"
            :key="group.id"
            :group="group"
          />
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<style scoped>
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
  width: 8px;
  display: none;
}
.ContBig::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
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
  margin-bottom: 20px;
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
  background: #eee;
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .subjects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
