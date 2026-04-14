<script setup lang="ts">
import { useapi } from '@/assets/composables/useApi'
import { computed } from 'vue'
import type { ScheduleItem } from '@/types/types.ts'

const props = defineProps<{
  childId: number | string
}>()


const { data, isFetching, error } = useapi(`/children/${props.childId}/schedule`).json()

const scheduleData = computed<ScheduleItem[]>(() => data.value?.data || [])

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const timeSlots = [
  { start: '07:00:00', end: '07:50:00' },
  { start: '07:50:00', end: '08:40:00' },
  { start: '08:40:00', end: '09:30:00' },
  { start: '09:30:00', end: '09:50:00' }, // Descanso o cambio
  { start: '09:50:00', end: '10:40:00' },
  { start: '10:40:00', end: '11:30:00' },
  { start: '11:30:00', end: '12:20:00' },
  { start: '12:20:00', end: '13:10:00' },
  { start: '13:10:00', end: '14:00:00' },
]

const getSubjectForSlot = (day: string, slotStart: string, slotEnd: string) => {
  return scheduleData.value.find((item) => {
    const normalize = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()

    const itemStart = item.start_time
    const itemEnd = item.end_time
    const itemDay = normalize(item.day)
    const currentDay = normalize(day)

    return itemDay === currentDay && slotStart >= itemStart && slotEnd <= itemEnd
  })
}

const formatTime = (time: string) => {
  if (!time) return '--:--'
  return time.slice(0, 5)
}
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
          <tr
            v-for="(slot, index) in timeSlots"
            :key="index"
            :class="{ 'break-row': slot.start === '09:30:00' }"
          >
            <td class="hour-col">{{ formatTime(slot.start) }} - {{ formatTime(slot.end) }}</td>

            <td v-for="day in days" :key="day">
              <div v-if="slot.start === '09:30:00'" class="break-text">RECESO</div>

              <div v-else-if="getSubjectForSlot(day, slot.start, slot.end)" class="subject-card">
                <span class="subject-name">
                  {{ getSubjectForSlot(day, slot.start, slot.end)!.subject_name }}
                </span>
                <span class="subject-room">
                  {{ getSubjectForSlot(day, slot.start, slot.end)!.teacher_name }}
                </span>
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
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;
}

.table-container::-webkit-scrollbar {
  display: none;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-Blanco);
}

th {
  background-color: var(--color-Azul);
  color: white;
  padding: 8px;
  text-transform: uppercase;
  font-size: 0.75rem;
}

td {
  padding: 4px;
  border: 1px solid var(--color-ContenedorClaro);
  height: 35px; /* Altura fija para que parezca rejilla */
  vertical-align: middle;
}

.hour-col {
  background-color: var(--color-ContenedorClaro);
  color: var(--color-AzulTres);
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
  font-size: 0.65rem;
  width: 80px;
  text-align: center;
}

.break-row td {
  height: 25px !important;
  background-color: var(--color-Fondo);
  padding: 0;
}

.break-text {
  font-size: 0.5rem;
  font-weight: bold;
  color: #94a3b8;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.break-row .hour-col {
  font-size: 0.55rem;
  color: #64748b;
}

.subject-card {
  font-family: 'Roboto', sans-serif; /* Aplicamos Roboto */
  padding: 4px; /* Un poco menos de padding para ahorrar espacio */
  display: flex;
  flex-direction: column;
  gap: 1px; /* Gap mínimo */
  font-size: 0.6rem;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  line-height: 1.1;
  color: var(--color-Texto);
}

.subject-name {
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 5px;
  font-size: 0.55rem;
  justify-items: center;
}

.subject-room {
  opacity: 0.9;
  font-weight: 500;
  font-size: 0.5rem;
  text-align: right;
  margin-top: 2px;
  font-style: italic;
}

tr:hover td {
  background-color: rgba(0, 84, 153, 0.03);
}
</style>
