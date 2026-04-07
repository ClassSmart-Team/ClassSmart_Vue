<script setup lang="ts">
import { ref } from 'vue'
import { useapi } from '@/assets/composables/useApi.ts'
import { useRoute, useRouter } from 'vue-router'
import { h } from 'vue'
import type { User } from '@/types/types.ts'
import type { UnitRequest } from '@/types/types.ts'
import type{Unit}from '@/types/types.ts'
const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)
const ur = ref<UnitRequest>({
  group_id: id,
  name: '',
  order: 1,
  start_date: '',
  end_date: '',
})

function submitAddUnit() {
  const { data: dat, onFetchResponse: onaddsubmitresposne } = useapi('units', {
    method: 'POST',
  })

    .post(ur.value)
    .json()
  onaddsubmitresposne(() => {
    alert(dat.value.message)
    closeAddUnitModal()
    reloadGroup()
    ur.value = {
      group_id: id,
      name: '',
      order: (data.value?.data?.units?.length || 0) + 1,
      start_date: '',
      end_date: '',
    }
  })
}

const { data, isFetching, error, execute: reloadGroup } = useapi(`/groups/${id}`).json()


const IconBack = () =>
  h(
    'svg',
    {
      width: '20',
      height: '20',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [
      h('line', { x1: '19', y1: '12', x2: '5', y2: '12' }),
      h('polyline', { points: '12 19 5 12 12 5' }),
    ],
  )

const IconUser = () =>
  h(
    'svg',
    {
      width: '18',
      height: '18',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [
      h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: '12', cy: '7', r: '4' }),
    ],
  )

const IconCalendar = () =>
  h(
    'svg',
    {
      width: '18',
      height: '18',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [
      h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }),
      h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
      h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
      h('line', { x1: '3', y1: '10', x2: '21', y2: '10' }),
    ],
  )

const IconPlus = () =>
  h(
    'svg',
    {
      width: '18',
      height: '18',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [
      h('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
      h('line', { x1: '5', y1: '12', x2: '19', y2: '12' }),
    ],
  )

const IconX = () =>
  h(
    'svg',
    {
      width: '20',
      height: '20',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [
      h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
      h('line', { x1: '6', y1: '6', x2: '18', y2: '18' }),
    ],
  )

const getInitials = (name: string, lastname: string) => {
  return `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
}

const goBack = () => {
  router.push('/teacher/groups')
}
const showDeleteConfirmModal = ref(false)

const openDeleteConfirm = () => {
  showDeleteConfirmModal.value = true
}

const closeDeleteConfirm = () => {
  showDeleteConfirmModal.value = false
}

const executeDelete = async () => {
  if (!selectedUnit.value) return

  const { data: res, error: err } = await useapi(`/units/${selectedUnit.value.id}`, {
    method: 'DELETE'
  }).json()

  if (!err.value) {
    alert(res.value.message || 'Unidad eliminada')
    showDeleteConfirmModal.value = false
    showManageUnitModal.value = false
    reloadGroup()
  } else {
    alert('Error al eliminar')
  }
}
// Estado para controlar el modal de edición
const showEditUnitModal = ref(false)

// Objeto para los datos que se están editando
const editUnitForm = ref<UnitRequest>({
  group_id: id,
  name: '',
  order: 0,
  start_date: '',
  end_date: '',
})

// Función para abrir el modal de edición y cargar los datos
const openEditUnitModal = () => {
  if (selectedUnit.value) {
    // Copiamos los datos de la unidad seleccionada al formulario
    editUnitForm.value = {
      group_id: id,
      name: selectedUnit.value.name,
      order: selectedUnit.value.order,
      start_date: selectedUnit.value.start_date,
      end_date: selectedUnit.value.end_date,
    }
    showEditUnitModal.value = true
  }
}

// Función para enviar la actualización a la API
const submitEditUnit = async () => {
  if (!selectedUnit.value) return

  const { data: res, error: err } = await useapi(`/units/${selectedUnit.value.id}`, {
    method: 'PUT', // O 'PATCH' dependiendo de tu backend
  })
    .put(editUnitForm.value)
    .json()

  if (!err.value) {
    alert(res.value.message || 'Unidad actualizada correctamente')
    showEditUnitModal.value = false
    showManageUnitModal.value = false // Cerramos también el menú de gestión
    reloadGroup() // Refrescamos la lista principal
  } else {
    alert('Error al actualizar la unidad')
  }
}

const showManageUnitModal = ref(false)
const selectedUnit = ref<Unit>()

const openManageUnitModal = (unit:Unit) => {
  selectedUnit.value = unit
  showManageUnitModal.value = true
}

const closeManageUnitModal = () => {
  showManageUnitModal.value = false
  selectedUnit.value = undefined
}

const showAddStudentModal = ref(false)
const showAddUnitModal = ref(false)
const showStudentDetailModal = ref(false)
const selectedStudent = ref<User | null>(null)

const selectedStudentId = ref<number | null>(null)
const newUnitForm = ref({
  name: '',
  start_date: '',
  end_date: '',
})

const { data: studentsData, execute: loadStudents } = useapi(`/groups/available-students/${id}`, {
  method: 'GET',
}).json()

const openAddStudentModal = () => {
  showAddStudentModal.value = true
  loadStudents()
}

const openStudentDetailModal = (student: User) => {
  selectedStudent.value = student
  showStudentDetailModal.value = true
}

const closeStudentDetailModal = () => {
  showStudentDetailModal.value = false
  selectedStudent.value = null
}

const closeAddStudentModal = () => {
  showAddStudentModal.value = false
  selectedStudentId.value = null
}

const openAddUnitModal = () => {
  showAddUnitModal.value = true
}

const closeAddUnitModal = () => {
  showAddUnitModal.value = false
  newUnitForm.value = { name: '', start_date: '', end_date: '' }
}

const submitAddStudent = async () => {
  if (!selectedStudentId.value) return

  const { data: dd, error: err } = await useapi(`/groups/${id}/students`, {
    method: 'POST',
    body: JSON.stringify({ student_id: selectedStudentId.value }),
  }).json()

  if (err.value) {
    alert('Error al inscribir estudiante')
    return
  }

  alert(dd.value.message)
  reloadGroup()
  loadStudents()
  closeAddStudentModal()
}
</script>

<template>
  <div class="dashboard-container">
    <div v-if="isFetching" class="state-msg">Cargando detalles del grupo...</div>
    <div v-else-if="error" class="state-msg error">Hubo un error al cargar los datos.</div>

    <div v-else-if="data?.data" class="main-layout">
      <aside class="sidebar-info">
        <button @click="goBack" class="btn-back-soft">
          <div class="back-icon-box">
            <IconBack />
          </div>
          <div class="back-text">
            <small>Panel</small>
            <span>Mis Grupos</span>
          </div>
        </button>

        <div class="soft-card group-card">
          <div class="card-header-top">
            <span class="group-id">ID: #00{{ data.data.id }}</span>
            <span class="status-badge" :class="{ active: data.data.active }">
              {{ data.data.active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <h1 class="title">{{ data.data.name }}</h1>
          <p class="description">{{ data.data.description }}</p>

          <div class="meta-list">
            <div class="meta-item">
              <div class="meta-icon-wrapper"><IconCalendar /></div>
              <div>
                <label>Periodo Académico</label>
                <span>{{ data.data.period.name }} {{ data.data.period.year }}</span>
              </div>
            </div>
            <div class="meta-item">
              <div class="meta-icon-wrapper"><IconUser /></div>
              <div>
                <label>Docente Titular</label>
                <span>{{ data.data.owner.name }} {{ data.data.owner.lastname }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="soft-card students-card">
          <div class="card-header-flex">
            <h3>Estudiantes Inscritos</h3>
            <span class="count-pill">{{ data.data.students_count }}</span>
          </div>

          <button @click="openAddStudentModal" class="btn-inscribe-student">
            <IconPlus /> Inscribir Estudiante
          </button>

          <div class="students-scroll">
            <div v-for="student in data.data.students" :key="student.id" class="student-item">
              <div class="avatar">{{ getInitials(student.name, student.lastname) }}</div>
              <div class="student-detail">
                <p class="name" @click="openStudentDetailModal(student)" style="cursor: pointer">
                  {{ student.name }} {{ student.lastname }}
                </p>
                <p class="email">{{ student.email }}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main class="content-area">
        <section class="top-stats">
          <div class="stat-box box-solid-blue">
            <div class="stat-icon-wrapper stat-icon-primary">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div class="stat-text">
              <span class="number">{{ data.data.units.length }}</span>
              <span class="label">Unidades</span>
            </div>
          </div>
          <div class="stat-box box-soft-blue">
            <div class="stat-icon-wrapper stat-icon-secondary">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div class="stat-text">
              <span class="number">{{ data.data.assignments_count }}</span>
              <span class="label">Actividades</span>
            </div>
          </div>
        </section>

        <section class="units-timeline">
          <div class="section-header">
            <h2>Estructura del Programa</h2>
            <button @click="openAddUnitModal" class="btn-primary-add">
              <IconPlus /> Agregar Unidad
            </button>
          </div>

          <div class="timeline">
            <div v-for="(unit, index) in data.data.units" :key="unit.id" class="unit-card-soft">
              <div class="unit-index-badge">{{ index + 1 }}</div>
              <div class="unit-body">
                <div class="unit-main">
                  <h3>{{ unit.name }}</h3>
                  <div class="date-row">
                    <div class="date-tag start"><strong>INICIO</strong> {{ unit.start_date }}</div>
                    <div class="date-tag end"><strong>TÉRMINO</strong> {{ unit.end_date }}</div>
                  </div>
                </div>
                <button @click="openManageUnitModal(unit)" class="btn-manage-unit">Gestionar</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- MODAL: GESTIONAR UNIDAD -->
    <Teleport to="body">
      <div v-if="showManageUnitModal && selectedUnit" class="modal-overlay" @click.self="closeManageUnitModal">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <small style="color: #1d65d8; font-weight: 800; text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.5px;">Opciones de Unidad</small>
              <h2 style="margin: 0; font-size: 1.3rem; color: #1e3a5f;">{{ selectedUnit.name }}</h2>
            </div>
            <button class="btn-close-modal" @click="closeManageUnitModal">
              <IconX />
            </button>
          </div>

          <div class="modal-body">
            <div class="manage-menu">
              <button class="menu-item" @click="openEditUnitModal">
                <div class="menu-icon edit-bg"><IconCalendar /></div>
                <div class="menu-text">
                  <span class="menu-title">Editar Detalles</span>
                  <p>Cambiar nombre o fechas de entrega.</p>
                </div>
              </button>

              <button class="menu-item">
                <div class="menu-icon activity-bg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div class="menu-text">
                  <span class="menu-title">Ver Actividades</span>
                  <p>Gestionar tareas asignadas a esta unidad.</p>
                </div>
              </button>

              <button class="menu-item danger-item" @click="openDeleteConfirm">
                <div class="menu-icon delete-bg">
                  <IconX />
                </div>
                <div class="menu-text">
                  <span class="menu-title">Eliminar Unidad</span>
                  <p>Borrar definitivamente esta unidad.</p>
                </div>
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeManageUnitModal" class="btn-cancel">Cancelar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: AGREGAR ESTUDIANTE -->
    <Teleport to="body">
      <div v-if="showAddStudentModal" class="modal-overlay" @click.self="closeAddStudentModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Inscribir Estudiante</h2>
            <button class="btn-close-modal" @click="closeAddStudentModal">
              <IconX />
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label for="student-select">Seleccionar Estudiante</label>
              <select v-model="selectedStudentId">
                <option value="">-- Selecciona un estudiante --</option>
                <option v-for="student in studentsData?.data" :key="student.id" :value="student.id">
                  {{ student.name }} {{ student.lastname }}
                </option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeAddStudentModal" class="btn-cancel">Cancelar</button>
            <button @click="submitAddStudent" class="btn-confirm">Inscribir</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: DETALLES DEL ESTUDIANTE -->
    <Teleport to="body">
      <div v-if="showStudentDetailModal && selectedStudent" class="modal-overlay" @click.self="closeStudentDetailModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Información del Estudiante</h2>
            <button class="btn-close-modal" @click="closeStudentDetailModal">
              <IconX />
            </button>
          </div>

          <div class="modal-body">
            <div class="student-avatar-large">
              {{ getInitials(selectedStudent.name, selectedStudent.lastname) }}
            </div>

            <div class="student-info-section">
              <h3>{{ selectedStudent.name }} {{ selectedStudent.lastname }}</h3>
            </div>

            <div class="info-item">
              <div class="info-icon email-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div class="info-content">
                <label>Correo Electrónico</label>
                <p>{{ selectedStudent.email }}</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon phone-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div class="info-content">
                <label>Teléfono</label>
                <a :href="`tel:${selectedStudent.cellphone}`" class="phone-link">{{ selectedStudent.cellphone }}</a>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon id-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor">ID</text>
                </svg>
              </div>
              <div class="info-content">
                <label>ID del Estudiante</label>
                <p>#{{ String(selectedStudent.id).padStart(4, '0') }}</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon status-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div class="info-content">
                <label>Estado</label>
                <p>{{ selectedStudent.active ? 'Activo' : 'Inactivo' }}</p>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeStudentDetailModal" class="btn-cancel">Cerrar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: AGREGAR UNIDAD -->
    <Teleport to="body">
      <div v-if="showAddUnitModal" class="modal-overlay" @click.self="closeAddUnitModal">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h2>Agregar Unidad Temática</h2>
            <button class="btn-close-modal" @click="closeAddUnitModal">
              <IconX />
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label for="unit-name">Nombre de la Unidad</label>
              <input id="unit-name" v-model="ur.name" type="text" class="form-input" placeholder="Ej: Introducción a los Conceptos Básicos" />
              <label for="unit-order">Orden de la Unidad</label>
              <input id="unit-order" v-model="ur.order" type="number" class="form-input" placeholder="un numero entero" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="unit-start">Fecha de Inicio</label>
                <input id="unit-start" v-model="ur.start_date" type="date" class="form-input" />
              </div>
              <div class="form-group">
                <label for="unit-end">Fecha de Término</label>
                <input id="unit-end" v-model="ur.end_date" type="date" class="form-input" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeAddUnitModal" class="btn-cancel">Cancelar</button>
            <button @click="submitAddUnit" class="btn-confirm">Crear Unidad</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>

  <!-- MODAL: CONFIRMAR ELIMINACIÓN -->
  <Teleport to="body">
    <div v-if="showDeleteConfirmModal" class="modal-overlay delete-confirm-overlay" @click.self="closeDeleteConfirm">
      <div class="modal-content modal-alert">
        <div class="modal-body text-center" style="padding: 40px 30px;">
          <div class="warning-icon-circle">!</div>
          <h2 style="color: #c53030; margin-bottom: 10px;">¿Confirmar eliminación?</h2>
          <p style="color: #4b7ba7; line-height: 1.5;">
            Estás a punto de eliminar la unidad <strong>"{{ selectedUnit?.name }}"</strong>.
            Esta acción borrará todas las actividades asociadas y no se puede deshacer.
          </p>
          <div class="confirm-actions">
            <button @click="closeDeleteConfirm" class="btn-cancel">No, cancelar</button>
            <button @click="executeDelete" class="btn-danger">Sí, eliminar unidad</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
  <Teleport to="body">
    <div v-if="showEditUnitModal" class="modal-overlay" @click.self="showEditUnitModal = false">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>Editar Unidad: {{ selectedUnit?.name }}</h2>
          <button class="btn-close-modal" @click="showEditUnitModal = false">
            <IconX />
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="edit-unit-name">Nombre de la Unidad</label>
            <input id="edit-unit-name" v-model="editUnitForm.name" type="text" class="form-input" />

            </div>


          </div>

        <div class="modal-footer" style="padding: 20px; display: flex; justify-content: flex-end; gap: 10px;">
          <button @click="showEditUnitModal = false" class="btn-cancel">Cancelar</button>
          <button @click="submitEditUnit" class="btn-confirm">Guardar Cambios</button>
        </div>
      </div>
    </div>

  </Teleport>
</template>

<style scoped>
/* =============================================
   PALETA DE COLORES (tomada de la card)
   - Fondo página:       #d0e4f7
   - Fondo cards:        blanco / rgba(255,255,255,0.6)
   - Header gradiente:   #1d65d8 → #c5c1c1
   - Texto principal:    #1e3a5f
   - Texto secundario:   #4b7ba7
   - Acento azul:        #3b82f6
   - Verde activo:       rgba(120,251,166,0.79)
   ============================================= */


.dashboard-container {
  font-family: 'Plus Jakarta Sans', Inter, sans-serif;
  font-size: 15px;
  padding: 30px;
  min-height: 100vh;
  background: linear-gradient(180deg,var(--color-AzulDos),var(--color-ComplementoDos));
}

.main-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 30px;
  max-width: 1600px;
  margin: 0 auto;
}

/* --- TARJETAS --- */
.soft-card {
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(29, 101, 216, 0.12);
  backdrop-filter: blur(8px);
}

/* --- BOTÓN REGRESAR --- */
.btn-back-soft {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(29, 101, 216, 0.15);
  padding: 12px 20px;
  border-radius: 18px;
  cursor: pointer;
  margin-bottom: 25px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: fit-content;
  backdrop-filter: blur(8px);
}

.back-icon-box {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #1d65d8 0%, #c5c1c1 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: 0.3s;
}

.back-text small {
  color: #4b7ba7;
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 1px;
  display: block;
}

.back-text span {
  color: #1e3a5f;
  font-weight: 800;
  font-size: 1rem;
}

.btn-back-soft:hover {
  background-color: rgba(29, 101, 216, 0.08);
  transform: translateX(-5px);
  border-color: rgba(29, 101, 216, 0.3);
}

/* --- SIDEBAR --- */
.sidebar-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.group-id {
  font-size: 11px;
  font-weight: 900;
  background: linear-gradient(135deg, #1d65d8 0%, #c5c1c1 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(29, 101, 216, 0.3);
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  color: #1e3a5f;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.status-badge.active {
  background: rgba(120, 251, 166, 0.79);
  border-color: rgba(6, 255, 102, 0.76);
  color: #166534;
}

.title {
  font-size: 1.8rem;
  color: #1e3a5f;
  font-weight: 800;
  margin: 0 0 10px;
  line-height: 1.2;
}

.description {
  color: #4b7ba7;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 25px;
  font-weight: 500;
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  border-top: 2px solid rgba(29, 101, 216, 0.2);
  padding-top: 20px;
}

.meta-item {
  display: flex;
  gap: 15px;
  align-items: center;
}

.meta-icon-wrapper {
  color: white;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #1d65d8 0%, #3b82f6 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(29, 101, 216, 0.25);
}

.meta-item label {
  display: block;
  font-size: 11px;
  color: #4b7ba7;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-item span {
  font-weight: 700;
  color: #1e3a5f;
  font-size: 0.95rem;
}

/* --- ESTUDIANTES --- */
.students-card {
  max-height: 650px;
  display: flex;
  flex-direction: column;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header-flex h3 {
  color: #1e3a5f;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.count-pill {
  background: rgba(29, 101, 216, 0.1);
  color: #1d65d8;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 0.8rem;
}

.btn-inscribe-student {
  width: calc(100% + 50px);
  background: linear-gradient(135deg, #1d65d8 0%, #3b82f6 100%);
  border: none;
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0 -25px 16px -25px;
  box-shadow: 0 4px 12px rgba(29, 101, 216, 0.3);
}

.btn-inscribe-student:hover {
  background: linear-gradient(135deg, #1552b0 0%, #1d65d8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(29, 101, 216, 0.4);
}

.students-scroll {
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}

.student-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(29, 101, 216, 0.05);
  border: 1px solid rgba(29, 101, 216, 0.08);
  transition: background 0.2s;
}

.student-item:hover {
  background: rgba(29, 101, 216, 0.1);
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d65d8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.student-detail .name {
  font-weight: 600;
  color: #1e3a5f;
  margin: 0;
  font-size: 0.9rem;
}

.student-detail .email {
  font-size: 0.78rem;
  color: #4b7ba7;
  margin: 2px 0 0;
}

/* --- ÁREA PRINCIPAL --- */
.content-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* --- STATS --- */
.top-stats {
  display: flex;
  gap: 16px;
}

.stat-box {
  flex: 1;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.box-solid-blue {
  background: linear-gradient(135deg, #1d65d8 0%, #c5c1c1 100%);
  color: white;
}

.box-soft-blue {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(29, 101, 216, 0.15);
  backdrop-filter: blur(8px);
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-primary {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  color: white;
}

.stat-icon-secondary {
  background: linear-gradient(135deg, #3b82f6 0%, #929db3 100%);
  color: white;
}

.stat-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-text .number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}

.box-solid-blue .stat-text .number,
.box-solid-blue .stat-text .label {
  color: white;
}

.box-soft-blue .stat-text .number {
  color: #1e3a5f;
}

.stat-text .label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.85;
}

.box-soft-blue .stat-text .label {
  color: #4b7ba7;
}

/* --- TIMELINE DE UNIDADES --- */
.units-timeline {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(29, 101, 216, 0.12);
  backdrop-filter: blur(8px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0;
}

.btn-primary-add {
  background: linear-gradient(135deg, #1d65d8 0%, #3b82f6 100%);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(29, 101, 216, 0.3);
}

.btn-primary-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(29, 101, 216, 0.4);
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.unit-card-soft {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(29, 101, 216, 0.12);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.unit-card-soft:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(29, 101, 216, 0.12);
  border-color: rgba(29, 101, 216, 0.25);
}

.unit-index-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1d65d8 0%, #c5c1c1 100%);
  color: white;
  font-weight: 800;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(29, 101, 216, 0.3);
}

.unit-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.unit-main h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 8px;
}

.date-row {
  display: flex;
  gap: 10px;
}

.date-tag {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 600;
}

.date-tag.start {
  background: rgba(59, 130, 246, 0.12);
  color: #1d65d8;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.date-tag.end {
  background: rgba(74, 222, 128, 0.12);
  color: #166534;
  border: 1px solid rgba(74, 222, 128, 0.25);
}

.btn-manage-unit {
  background: rgba(29, 101, 216, 0.08);
  color: #1d65d8;
  border: 1.5px solid rgba(29, 101, 216, 0.2);
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-manage-unit:hover {
  background: linear-gradient(135deg, #1d65d8 0%, #3b82f6 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-1px);
}

/* --- MODALES --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 58, 95, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(30, 58, 95, 0.2);
  overflow: hidden;
}

.modal-large {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0;
}

.btn-close-modal {
  background: rgba(29, 101, 216, 0.08);
  border: 1px solid rgba(29, 101, 216, 0.15);
  color: #4b7ba7;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-close-modal:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #c53030;
  border-color: rgba(239, 68, 68, 0.2);
}

.modal-body {
  padding: 20px 24px;
}

.modal-footer {
  padding: 0 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* --- MANAGE MENU --- */
.manage-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8fbff;
  border: 2px solid rgba(29, 101, 216, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.menu-item:hover {
  border-color: #1d65d8;
  background: rgba(29, 101, 216, 0.05);
  transform: translateX(4px);
}

.menu-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.edit-bg { background: rgba(29, 101, 216, 0.1); color: #1d65d8; }
.activity-bg { background: rgba(74, 222, 128, 0.15); color: #166534; }
.delete-bg { background: rgba(239, 68, 68, 0.1); color: #c53030; }

.menu-title {
  display: block;
  font-weight: 700;
  color: #1e3a5f;
  font-size: 0.95rem;
}

.menu-text p {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: #4b7ba7;
}

.danger-item:hover {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

/* --- FORMULARIOS --- */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #4b7ba7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input,
select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid rgba(29, 101, 216, 0.2);
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1e3a5f;
  background: rgba(208, 228, 247, 0.3);
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
select:focus {
  outline: none;
  border-color: #1d65d8;
  background: white;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* --- BOTONES --- */
.btn-cancel {
  padding: 10px 20px;
  background: rgba(29, 101, 216, 0.08);
  border: 1.5px solid rgba(29, 101, 216, 0.2);
  border-radius: 10px;
  color: #4b7ba7;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: rgba(29, 101, 216, 0.15);
  color: #1e3a5f;
}

.btn-confirm {
  padding: 10px 20px;
  background: linear-gradient(135deg, #1d65d8 0%, #3b82f6 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(29, 101, 216, 0.3);
}

.btn-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(29, 101, 216, 0.4);
}

.btn-danger {
  padding: 10px 20px;
  background: linear-gradient(135deg, #ef4444 0%, #c53030 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

/* --- MODAL DETALLES ESTUDIANTE --- */
.student-avatar-large {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d65d8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 1.5rem;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(29, 101, 216, 0.3);
}

.student-info-section {
  text-align: center;
  margin-bottom: 20px;
}

.student-info-section h3 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(29, 101, 216, 0.08);
}

.info-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.email-icon { background: rgba(29, 101, 216, 0.1); color: #1d65d8; }
.phone-icon { background: rgba(74, 222, 128, 0.15); color: #166534; }
.id-icon { background: rgba(197, 197, 197, 0.2); color: #4b7ba7; }
.status-icon { background: rgba(120, 251, 166, 0.3); color: #166534; }

.info-content label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: #4b7ba7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-content p {
  margin: 2px 0 0;
  font-weight: 600;
  color: #1e3a5f;
  font-size: 0.95rem;
}

.phone-link {
  color: #1d65d8;
  font-weight: 600;
  text-decoration: none;
}

.phone-link:hover {
  text-decoration: underline;
}

/* --- DELETE CONFIRM --- */
.warning-icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  color: #c53030;
  font-size: 1.8rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.text-center {
  text-align: center;
}

/* --- ESTADOS --- */
.state-msg {
  text-align: center;
  padding: 60px;
  color: #4b7ba7;
  font-weight: 600;
  font-size: 1.1rem;
}

.state-msg.error {
  color: #c53030;
}

/* --- RESPONSIVE --- */
@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: 16px;
  }

  .top-stats {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
