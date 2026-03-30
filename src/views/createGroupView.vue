<script setup lang="ts">
import { ref } from 'vue'
import { useFetch } from '@vueuse/core'
import { type GroupData } from '@/types/types.ts'

const groupdata = ref<GroupData>({
  period_id: 0,
  name: '',
  description: '',
})
async function saveGroup() {
  const url = 'https://untabulable-incomparable-lean.ngrok-free.dev/api/groups'
  const { data, onFetchError, onFetchResponse } = useFetch(url, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',

    },
  })
    .post(groupdata)
    .json()
  onFetchResponse(() => {
    data.value.message
  })
  onFetchError(() => {})
}
</script>

<template>
  <div class="student-platform-container">
    <div class="form-card">
      <div class="form-header">
        <h2>Crear Nuevo Grupo</h2>
        <p>Completa la información para registrar el grupo académico.</p>
      </div>

      <div class="form-body">
        <div class="input-group">
          <label>Nombre del Grupo</label>
          <input v-model="name" placeholder="Ej: Programación Avanzada" type="text" />
        </div>

        <div class="input-group">
          <label>Descripción</label>
          <input v-model="description" placeholder="Breve detalle del curso..." type="text" />
        </div>

        <div class="input-row">
          <div class="input-group">
            <label> Propietario (Owner)</label>
            <input v-model.number="owner" />
          </div>

          <div class="input-group">
            <label>ID Periodo</label>
            <input v-model.number="period_id" placeholder="0" type="number" />
          </div>
        </div>
      </div>

      <div class="form-footer">
        <button class="btn-save" @click="saveGroup">
          <span>Guardar Grupo</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor principal con fondo gris suave típico de apps educativas */
.student-platform-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f7f9;
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
  padding: 20px;
}

/* Tarjeta del formulario */
.form-card {
  background: #ffffff;
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Encabezado con color de identidad (Azul académico) */
.form-header {
  background-color: #1a73e8;
  padding: 24px;
  color: white;
  text-align: center;
}

.form-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.form-header p {
  margin: 8px 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Cuerpo del formulario */
.form-body {
  padding: 24px;
}

.input-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 8px;
}

input {
  padding: 12px 16px;
  border: 2px solid #e1e4e8;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

input:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.1);
}

input::placeholder {
  color: #a0aec0;
}

/* Botón de acción */
.form-footer {
  padding: 0 24px 24px;
}

.btn-save {
  width: 100%;
  background-color: #1a73e8;
  color: white;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.3s ease,
    transform 0.1s ease;
}

.btn-save:hover {
  background-color: #1557b0;
}

.btn-save:active {
  transform: scale(0.98);
}

/* Ajuste para móviles */
@media (max-width: 480px) {
  .input-row {
    grid-template-columns: 1fr;
  }
}
</style>
