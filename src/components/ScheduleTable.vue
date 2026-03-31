<script setup lang="ts">
import { useapi } from '@/assets/composables/useApi'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'

const uas = useAuthStore()

const { data, isFetching, error } = useapi('/schedule', {
})
  .get()
  .json()

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const scheduleData = computed(() => data.value?.data || [])
</script>

<template>
  <div class="schedule-wrapper">
    <div v-if="isFetching" class="status-msg">Cargando horario...</div>

    <div v-else-if="error" class="status-msg error">
      No se pudo cargar el horario. Inténtalo de nuevo.
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Hora</th>
            <th v-for="day in days" :key="day">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="timeBlock in scheduleData" :key="timeBlock.id">
            <td class="hour-col">{{ timeBlock.start_time }} - {{ timeBlock.end_time }}</td>

            <td v-for="day in days" :key="day">
              <div v-if="timeBlock.day === day" class="subject-card">
                <span class="subject-name">{{ timeBlock.subject }}</span>
                <span class="subject-room">{{ timeBlock.room }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.status-msg {
  text-align: center;
  padding: 40px;
  color: var(--color-Texto);
  font-weight: bold;
}

.error {
  color: #e74c3c;
}

.table-container {
  overflow-x: auto;
  border-radius: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th {
  background-color: var(--color-Azul);
  color: white;
  padding: 15px;
  text-transform: uppercase;
  font-size: 0.9rem;
}

td {
  padding: 10px;
  border: 1px solid var(--color-ContenedorClaro);
  height: 80px; /* Altura fija para que parezca rejilla */
  vertical-align: middle;
}

.hour-col {
  background-color: var(--color-ContenedorClaro);
  color: var(--color-AzulTres);
  font-weight: bold;
  width: 120px;
}

.subject-card {
  background: var(--color-AzulCuatro);
  color: white;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subject-name {
  font-weight: bold;
}
.subject-room {
  opacity: 0.8;
  font-size: 0.75rem;
}

tr:hover td {
  background-color: rgba(0, 84, 153, 0.03);
}
</style>
