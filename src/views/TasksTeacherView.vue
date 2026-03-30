
<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
import { ref } from 'vue'
import { useapi } from '@/assets/composables/useApi'

// Datos del formulario
const title = ref('')
const description = ref('')
const start_date = ref('')
const end_date = ref('')
const status = ref('Activa')
const group_id = ref('')
const unit_id = ref('')

const message = ref('')

// Cargar grupos para select
const { data: groupsData, error: groupsError, isFetching: groupsLoading } = useapi("/groups").json()

// Cargar unidades para select (suponiendo que hay un endpoint similar)
const { data: unitsData, error: unitsError, isFetching: unitsLoading } = useapi("/units").json()

// Crear tarea
const createAssignment = async () => {
  try {
    const res = await fetch("https://api.sutando-user.me/api/teacher/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.value,
        description: description.value,
        start_date: start_date.value,
        end_date: end_date.value,
        status: status.value,
        group_id: group_id.value,
        unit_id: unit_id.value
      })
    })

    if (res.ok) {
      message.value = "Tarea creada correctamente"
      title.value = ''
      description.value = ''
      start_date.value = ''
      end_date.value = ''
      group_id.value = ''
      unit_id.value = ''
    } else {
      message.value = "Error al crear la tarea"
    }
  } catch (e) {
    message.value = "Error al crear la tarea"
    console.error(e)
  }
}
</script>


<template>
  <div class="bg-page">
    <SidebarLayout>

      <!-- HEADER -->
      <div class="ContSmall center">
        <h1>Registrar Nueva Tarea</h1>
      </div>

      <!-- FORMULARIO -->
      <div class="ContBig center-items" style="margin-top: 40px;">
        <div class="form-wrapper-page">

          <h3>- Nueva Tarea -</h3>

          <!-- Mensaje -->
          <p v-if="message" class="alert">{{ message }}</p>

          <!-- Título -->
          <div class="field">
            <label>Título</label>
            <input v-model="title" type="text" placeholder="Escribe el título..." />
          </div>

          <!-- Descripción -->
          <div class="field">
            <label>Descripción</label>
            <textarea v-model="description" rows="3" placeholder="Detalles de la misión..."></textarea>
          </div>

          <!-- Fechas -->
          <div class="grid-fields">
            <div class="field">
              <label>Fecha inicio</label>
              <input v-model="start_date" type="datetime-local" />
            </div>

            <div class="field">
              <label>Fecha entrega</label>
              <input v-model="end_date" type="datetime-local" />
            </div>
          </div>

          <!-- Status y Selects -->
          <div class="grid-fields">
            <div class="field">
              <label>Status</label>
              <select v-model="status">
                <option value="Activa">Activa</option>
                <option value="Cerrada">Cerrada</option>
              </select>
            </div>

            <div class="field">
              <label>Grupo</label>
              <select v-model="group_id" :disabled="groupsLoading">
                <option value="" disabled>Seleccione un grupo</option>
                <option
                  v-for="group in groupsData?.data ?? []"
                  :key="group.id"
                  :value="group.id"
                >
                  {{ group.name }}
                </option>
              </select>
              <p v-if="groupsError" class="error-text">Error cargando grupos</p>
            </div>

            <div class="field">
              <label>Unidad</label>
              <select v-model="unit_id" :disabled="unitsLoading">
                <option value="" disabled>Seleccione una unidad</option>
                <option
                  v-for="unit in unitsData?.data ?? []"
                  :key="unit.id"
                  :value="unit.id"
                >
                  {{ unit.name }}
                </option>
              </select>
              <p v-if="unitsError" class="error-text">Error cargando unidades</p>
            </div>
          </div>

          <!-- Botón -->
          <button @click="createAssignment" class="submit-btn">
            Registrar en Bitácora
          </button>
        </div>
      </div>

    </SidebarLayout>
  </div>
</template>

<style scoped>

.CenterItems {
  align-items: center;
  padding-left: 50px;
}


.bg-page {
  position: fixed;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: linear-gradient(180deg,var(--color-OscuroAzulado),var(--color-OscuroDos));
  z-index: -1;
}


.ContSmall{
  background: var(--color-Azul);
  width: 1000px;
  height:60px;
  border-radius: 20px;
}

.ContBig{
  background: var(--color-Blanco);
  width: 800px;
  height:400px;
  border-radius: 20px;
}


</style>
