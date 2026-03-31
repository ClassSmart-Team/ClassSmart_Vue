<script setup lang="ts">
import { ref, computed } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import GradeUnitCard from '@/components/GradeRecordCard.vue'

const children = ref([
  {
    id: 1,
    name: 'Mateo',
    lastname: 'Pérez',
    academicHistory: [
      {
        group_id: 101,
        group_name: 'Matemáticas IV',
        teacher: 'Ing. Isaac Newton',
        final_average: 9.1,
        grades: [
          { unit_id: 1, unit_name: 'Álgebra de Funciones', grade: 9.5, order: 1 },
          { unit_id: 2, unit_name: 'Límites y Continuidad', grade: 8.7, order: 2 },
        ],
      },
      {
        group_id: 102,
        group_name: 'Física II',
        teacher: 'Dr. Albert Einstein',
        final_average: 8.5,
        grades: [{ unit_id: 5, unit_name: 'Termodinámica', grade: 8.5, order: 1 }],
      },
    ],
  },
  {
    id: 2,
    name: 'Sofía',
    lastname: 'Pérez',
    academicHistory: [
      {
        group_id: 103,
        group_name: 'Historia',
        teacher: 'Lic. Heródoto',
        final_average: 10,
        grades: [{ unit_id: 8, unit_name: 'Revolución Mexicana', grade: 10, order: 1 }],
      },
    ],
  },
])

const selectedChildId = ref(children.value[0].id)

const currentChild = computed(() => children.value.find((c) => c.id === selectedChildId.value))
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center">
      <h1>Historial de Calificaciones</h1>
    </div>

    <div class="ContBig" style="margin-top: 40px">
      <div class="header-actions">
        <div class="child-selector">
          <label>Alumno:</label>
          <select v-model="selectedChildId" class="custom-select">
            <option v-for="child in children" :key="child.id" :value="child.id">
              {{ child.name }} {{ child.lastname }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="currentChild" class="history-content">
        <div
          v-for="subject in currentChild.academicHistory"
          :key="subject.group_id"
          class="subject-block"
        >
          <div class="subject-header">
            <div class="title-area">
              <h3>{{ subject.group_name }}</h3>
              <span class="teacher-name">Docente: {{ subject.teacher }}</span>
            </div>
            <div class="average-box">
              <label>Promedio</label>
              <span class="score">{{ subject.final_average }}</span>
            </div>
          </div>

          <div class="units-grid">
            <GradeUnitCard v-for="grade in subject.grades" :key="grade.unit_id" :grade="grade" />
          </div>
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
}
.ContBig {
  background: var(--color-Blanco);
  width: 95%;
  max-width: 1000px;
  border-radius: 20px;
  margin: 40px auto;
  padding: 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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

.header-actions {
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-select {
  padding: 8px 15px;
  border-radius: 10px;
  border: 1px solid var(--color-ContenedorClaro);
  font-weight: bold;
  color: var(--color-Azul);
  margin-left: 10px;
}

.subject-block {
  border: 1px solid #eee;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
}

.subject-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.subject-header h3 {
  margin: 0;
  color: var(--color-Azul);
  font-size: 1.2rem;
}
.teacher-name {
  font-size: 0.8rem;
  color: #888;
}

.average-box {
  text-align: center;
  background: #f0f4ff;
  padding: 5px 4px;
  border-radius: 12px;
}

.average-box label {
  display: block;
  font-size: 0.6rem;
  font-weight: bold;
  color: var(--color-AzulTres);
  text-transform: uppercase;
}
.average-box .score {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-Azul);
}

.units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

@media (max-width: 768px) {
  .subject-header {
    flex-direction: column;
    gap: 15px;
  }
  .average-box {
    width: 100%;
  }
  .units-grid {
    grid-template-columns: 1fr;
  }
}
</style>
