<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import GradeUnitCard from '@/components/GradeRecordCard.vue'
import type { GradeRecord } from '@/types/types.ts'
import { useapi } from '@/assets/composables/useApi.ts'
import { useAuthStore } from '@/stores/authStore.ts'

const ua = useAuthStore()
const { data, isFetching, error } = useapi('/grade-records').get().json()

const selectedChildId = ref<number | null>(null)
const formattedChildren = ref<any[]>([])

watch(data, (newData) => {
  if (newData && newData.data) {
    const rawRecords: GradeRecord[] = newData.data
    const tempChildren: any[] = []

    rawRecords.forEach((record) => {
      let child = tempChildren.find((c) => c.id === record.student.id)

      if (!child) {
        child = {
          id: record.student.id,
          name: record.student.name,
          lastname: record.student.lastname,
          academicHistory: [],
        }
        tempChildren.push(child)
      }

      let subject = child.academicHistory.find((h: any) => h.group_id === record.group.id)

      if (!subject) {
        subject = {
          group_id: record.group.id,
          group_name: record.group.name,
          teacher: record.group.teacher || 'Docente no asignado',
          grades: [],
        }
        child.academicHistory.push(subject)
      }

      subject.grades.push({
        unit_id: record.unit.id,
        unit_name: record.unit.name,
        grade: record.grade,
        order: record.unit.order,
      })
    })

    // --- CÁLCULO DE PROMEDIOS ---
    tempChildren.forEach((child) => {
      child.academicHistory.forEach((subject: any) => {
        // Calcular promedio final
        const sum = subject.grades.reduce((acc: number, curr: any) => acc + curr.grade, 0)
        subject.final_average =
          subject.grades.length > 0 ? (sum / subject.grades.length).toFixed(1) : '0.0'
      })
    })

    formattedChildren.value = tempChildren

    if (tempChildren.length > 0 && !selectedChildId.value) {
      selectedChildId.value = tempChildren[0].id
    }
  }
})

const currentChild = computed(() =>
  formattedChildren.value.find((c) => c.id === selectedChildId.value),
)
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <div class="ContSmall">
        <div class="left">
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <div>
            <h1>Historial de calificaciones</h1>
          </div>
        </div>
        <div class="right">
          <span class="welcome-text">{{ ua.credentials?.user.name }}</span>
        </div>
      </div>

      <div class="main-box" style="margin-top: 30px">
        <div v-if="isFetching" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando información...</p>
        </div>

        <div v-if="error" class="error-banner">
          <span><img src="@/components/advertencia-triangulo.png" alt="error" /></span>
          <p>Hubo un problema al cargar la información.</p>
        </div>

        <template v-else>
          <template v-if="formattedChildren.length > 0">
            <div class="header-actions">
              <div class="child-selector" v-if="formattedChildren.length > 0">
                <label for="child-select">Alumno:</label>
                <select id="child-select" v-model="selectedChildId">
                  <option v-for="child in formattedChildren" :key="child.id" :value="child.id">
                    {{ child.name }}
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
                  <GradeUnitCard
                    v-for="grade in subject.grades"
                    :key="grade.unit_id"
                    :grade="grade"
                  />
                </div>
              </div>
            </div>
          </template>

          <div v-else-if="!isFetching" class="empty-state-container">
            <p>Aún no se hay registros de evaluación para tus hijos en el sistema.</p>
          </div>
        </template>
      </div>
    </SidebarLayout>
  </div>
</template>

<style scoped>
.bg-page {
  min-height: 100vh;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: -1;
}

.ContSmall {
  background: var(--color-Azul);
  width: 1000px;
  min-height: 40px;
  border-radius: 20px;
  margin: 0 auto;
  padding: 20px 25px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ContSmall h1 {
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: -0.5px;
}

.ContSmall p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.welcome-text {
  font-weight: 600;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 15px;
  border-radius: 10px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #94a3b8;
}
.spinner {
  width: 45px;
  height: 45px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid var(--color-Azul);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-banner {
  background: #fee2e2;
  color: #dc2626;
  padding: 18px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
}

@media (max-width: 1050px) {
  .ContSmall,
  .ContBig {
    width: 95%;
  }
}

.header-actions {
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.child-selector {
  margin-bottom: 25px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.child-selector label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.child-selector select {
  background: var(--color-Blanco);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23005499'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='C19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 15px;
  padding: 8px 35px 8px 15px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  color: var(--color-Azul);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  min-width: 180px;
}

.child-selector select:hover {
  border-color: var(--color-Azul);
  background-color: var(--color-Blanco);
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
  background: var(--color-Blanco);
  border: 1px solid var(--color-Bordes);
  padding: 5px 4px;
  border-radius: 12px;
}

.average-box label {
  display: block;
  font-size: 0.6rem;
  font-weight: bold;
  color: var(--color-Azul);
  text-transform: uppercase;
}
.average-box .score {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-Texto);
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

.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  border: 2px dashed #e2e8f0;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-emoji {
  font-size: 2.5rem;
}

.empty-state-container h2 {
  color: var(--color-Azul);
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.empty-state-container p {
  color: #64748b;
  max-width: 300px;
  margin: 0;
  line-height: 1.5;
  font-weight: 500;
}
</style>
