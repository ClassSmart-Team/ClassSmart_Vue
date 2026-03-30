<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
import { ref } from 'vue'
import { useapi } from '@/assets/composables/useApi'

// FORM
const title = ref('')
const description = ref('')
const start_date = ref('')
const end_date = ref('')
const status = ref('Activa')
const group_id = ref('')
const unit_id = ref('')
const message = ref('')

// MODAL
const showModal = ref(false)

// DATA
const { data: groupsData, error: groupsError, isFetching: groupsLoading } = useapi("/groups").json()
const { data: unitsData, error: unitsError, isFetching: unitsLoading } = useapi("/units").json()

// CREATE
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
      showModal.value = false

      // reset
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
      <div class="ContSmall header-flex">
        <h1>Registrar Nueva Tarea</h1>

        <button class="btn-add" @click="showModal = true">
          + Nueva tarea
        </button>
      </div>

      <!-- MODAL -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal">

          <h2>Nueva Tarea</h2>

          <p v-if="message" class="alert">{{ message }}</p>

          <div class="field">
            <label>Título</label>
            <input v-model="title" type="text" />
          </div>

          <div class="field">
            <label>Descripción</label>
            <textarea v-model="description"></textarea>
          </div>

          <div class="grid-fields">
            <div class="field">
              <label>Inicio</label>
              <input v-model="start_date" type="datetime-local" />
            </div>

            <div class="field">
              <label>Entrega</label>
              <input v-model="end_date" type="datetime-local" />
            </div>
          </div>

          <div class="grid-fields">
            <div class="field">
              <label>Status</label>
              <select v-model="status">
                <option>Activa</option>
                <option>Cerrada</option>
              </select>
            </div>

            <div class="field">
              <label>Grupo</label>
              <select v-model="group_id">
                <option v-for="g in groupsData?.data ?? []" :key="g.id" :value="g.id">
                  {{ g.name }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Unidad</label>
              <select v-model="unit_id">
                <option v-for="u in unitsData?.data ?? []" :key="u.id" :value="u.id">
                  {{ u.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn cancel" @click="showModal = false">Cancelar</button>
            <button class="btn primary" @click="createAssignment">Guardar</button>
          </div>

        </div>
      </div>

    </SidebarLayout>
  </div>
</template>

<style scoped>

/* HEADER */
.header-flex{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding: 0 20px;
  color: white;
}

/* BOTÓN */
.btn-add{
  background: var(--color-AzulTres);
  color:white;
  border:none;
  padding:10px 15px;
  border-radius:10px;
  cursor:pointer;
  transition:.3s;
}

.btn-add:hover{
  background: var(--color-AzulCuatro);
}

/* MODAL */
.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.6);
  display:flex;
  justify-content:center;
  align-items:center;
}

.modal{
  background: var(--color-Blanco);
  width: 500px;
  padding:25px;
  border-radius:20px;
  box-shadow: 0 10px 30px #00000050;
  animation: fadeIn .3s ease;
}

/* INPUTS */
.field{
  display:flex;
  flex-direction:column;
  margin-bottom:10px;
}

input, textarea, select{
  padding:8px;
  border-radius:8px;
  border:1px solid #ccc;
  outline:none;
  transition:.2s;
}

input:focus, textarea:focus, select:focus{
  border-color: var(--color-AzulDos);
}

/* GRID */
.grid-fields{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}

/* BOTONES MODAL */
.modal-actions{
  display:flex;
  justify-content:flex-end;
  gap:10px;
  margin-top:15px;
}

.btn{
  padding:8px 14px;
  border:none;
  border-radius:8px;
  cursor:pointer;
}

.btn.primary{
  background: var(--color-AzulDos);
  color:white;
}

.btn.cancel{
  background:#ccc;
}

/* ALERT */
.alert{
  color:green;
  margin-bottom:10px;
}

/* BG */
.bg-page {
  position: fixed;
  inset: 0;
  overflow-y: auto;
  background: linear-gradient(180deg,var(--color-OscuroAzulado),var(--color-OscuroDos));
}

/* CONTENEDOR */
.ContSmall{
  background: var(--color-Azul);
  width: 1000px;
  height:60px;
  border-radius: 20px;
  margin:auto;
  margin-top:20px;
}

/* ANIMACIÓN */
@keyframes fadeIn{
  from{ opacity:0; transform:scale(.9);}
  to{ opacity:1; transform:scale(1);}
}

</style>