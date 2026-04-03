<script setup lang="ts">
import { ref } from 'vue'
import { useapi } from '@/assets/composables/useApi.ts'
import { useRoute, useRouter } from 'vue-router'
import { h } from 'vue'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

const { data, isFetching, error } = useapi(`/groups/${id}`).json()

// --- COMPONENTES DE ICONOS NATIVOS (Vue 3 'h') ---
// Ajustados para que se vean bien en fondo claro (stroke más oscuro)
const IconBack = () => h('svg', { width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('line', { x1: '19', y1: '12', x2: '5', y2: '12' }), h('polyline', { points: '12 19 5 12 12 5' })])
const IconUser = () => h('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }), h('circle', { cx: '12', cy: '7', r: '4' })])
const IconCalendar = () => h('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }), h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }), h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }), h('line', { x1: '3', y1: '10', x2: '21', y2: '10' })])
const IconBook = () => h('svg', { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }), h('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' })])
const IconPlus = () => h('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('line', { x1: '12', y1: '5', x2: '12', y2: '19' }), h('line', { x1: '5', y1: '12', x2: '19', y2: '12' })])
const IconX = () => h('svg', { width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }), h('line', { x1: '6', y1: '6', x2: '18', y2: '18' })])

const getInitials = (name: string, lastname: string) => {
  return `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
}

const goBack = () => {
  router.push('/teacher/groups')
}

// --- MODAL STATES ---
const showAddStudentModal = ref(false)
const showAddUnitModal = ref(false)
const showStudentDetailModal = ref(false)
const selectedStudent = ref<any>(null)

// --- FORM STATES ---
const selectedStudentId = ref<number | null>(null)
const newUnitForm = ref({
  name: '',
  start_date: '',
  end_date: ''
})

// --- EXAMPLE: Available students (reemplaza con tu consulta real) ---
const availableStudents = ref<Array<{ id: number; name: string; lastname: string; email: string }>>([])

// --- FUNCIONES PARA MODAL DE DETALLES DEL ESTUDIANTE ---
const openStudentDetailModal = (student: any) => {
  selectedStudent.value = student
  showStudentDetailModal.value = true
}

const closeStudentDetailModal = () => {
  showStudentDetailModal.value = false
  selectedStudent.value = null
}

// --- FUNCIONES MODALES ---
const openAddStudentModal = async () => {
  showAddStudentModal.value = true
  // Aquí va tu consulta para obtener estudiantes disponibles
  // REEMPLAZA ESTA LÍNEA CON TU CONSULTA REAL:
  // const { data: students } = useapi('/students/available').json()
  // availableStudents.value = students.value?.data || []

  // Por ahora, usa este placeholder:
  availableStudents.value = [
    { id: 1, name: 'Juan', lastname: 'García', email: 'juan@example.com' },
    { id: 2, name: 'María', lastname: 'López', email: 'maria@example.com' },
  ]
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
  // Aquí va tu lógica para agregar el estudiante
  console.log('Agregando estudiante:', selectedStudentId.value)
  // await useapi(`/groups/${id}/students`, { method: 'POST', body: { student_id: selectedStudentId.value } })
  closeAddStudentModal()
}

const submitAddUnit = async () => {
  if (!newUnitForm.value.name || !newUnitForm.value.start_date || !newUnitForm.value.end_date) return
  // Aquí va tu lógica para agregar la unidad
  console.log('Agregando unidad:', newUnitForm.value)
  // await useapi(`/groups/${id}/units`, { method: 'POST', body: newUnitForm.value })
  closeAddUnitModal()
}
</script>

<template>
  <div class="dashboard-container soft-light-mode">
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
          <!-- BOTÓN INSCRIBIR ESTUDIANTE AQUÍ (ANTES DEL SCROLL) -->
          <button @click="openAddStudentModal" class="btn-inscribe-student">
            <IconPlus /> Inscribir Estudiante
          </button>
          <div class="students-scroll">
            <div v-for="student in data.data.students" :key="student.id" class="student-item">
              <div class="avatar">{{ getInitials(student.name, student.lastname) }}</div>
              <div class="student-detail">
                <p class="name" @click="openStudentDetailModal(student)" style="cursor: pointer;">{{ student.name }} {{ student.lastname }}</p>
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
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
            <!-- BOTÓN AGREGAR UNIDAD AQUÍ -->
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
                    <div class="date-tag start">
                      <strong>INICIO</strong> {{ unit.start_date }}
                    </div>
                    <div class="date-tag end">
                      <strong>TÉRMINO</strong> {{ unit.end_date }}
                    </div>
                  </div>
                </div>
                <button class="btn-manage-unit">Gestionar</button>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>

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
              <select
                id="student-select"
                v-model.number="selectedStudentId"
                class="form-select"
              >
                <option :value="null" disabled>-- Elige un estudiante --</option>
                <option
                  v-for="student in availableStudents"
                  :key="student.id"
                  :value="student.id"
                >
                  {{ student.name }} {{ student.lastname }} ({{ student.email }})
                </option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeAddStudentModal" class="btn-cancel">
              Cancelar
            </button>
            <button @click="submitAddStudent" class="btn-confirm">
              Inscribir
            </button>
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
            <!-- AVATAR GRANDE -->
            <div class="student-avatar-large">
              {{ getInitials(selectedStudent.name, selectedStudent.lastname) }}
            </div>

            <!-- NOMBRE -->
            <div class="student-info-section">
              <h3>{{ selectedStudent.name }} {{ selectedStudent.lastname }}</h3>
            </div>

            <!-- EMAIL -->
            <div class="info-item">
              <div class="info-icon email-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <div class="info-content">
                <label>Correo Electrónico</label>
                <p>{{ selectedStudent.email }}</p>
              </div>
            </div>

            <!-- TELÉFONO (con enlace para llamar) -->
            <div class="info-item" v-if="selectedStudent.cellphone">
              <div class="info-icon phone-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div class="info-content">
                <label>Teléfono</label>
                <a :href="`tel:${selectedStudent.cellphone}`" class="phone-link">
                  {{ selectedStudent.cellphone }}
                </a>
              </div>
            </div>

            <!-- ID DEL ESTUDIANTE -->
            <div class="info-item" v-if="selectedStudent.id">
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

            <!-- INFORMACIÓN ADICIONAL SI EXISTE -->
            <div class="info-item" v-if="selectedStudent.enrollment_date">
              <div class="info-icon date-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div class="info-content">
                <label>Fecha de Inscripción</label>
                <p>{{ selectedStudent.enrollment_date }}</p>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeStudentDetailModal" class="btn-cancel">
              Cerrar
            </button>
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
              <input
                id="unit-name"
                v-model="newUnitForm.name"
                type="text"
                class="form-input"
                placeholder="Ej: Introducción a los Conceptos Básicos"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="unit-start">Fecha de Inicio</label>
                <input
                  id="unit-start"
                  v-model="newUnitForm.start_date"
                  type="date"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="unit-end">Fecha de Término</label>
                <input
                  id="unit-end"
                  v-model="newUnitForm.end_date"
                  type="date"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeAddUnitModal" class="btn-cancel">
              Cancelar
            </button>
            <button @click="submitAddUnit" class="btn-confirm">
              Crear Unidad
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
/* --- CONFIGURACIÓN DE COLORES ANTI-CEGUERA (SOFT LIGHT) --- */
.dashboard-container.soft-light-mode {
  /* Fondo principal: Azul grisáceo muy pálido */
  background-color: #d6e9fa; /* --color-Contenedor */
  min-height: 100vh;
  padding: 30px;
  /* Texto principal: Oscuro azulado para buen contraste */
  color: #242f4e; /* --color-OscuroAzulado */
  font-family: 'Plus Jakarta Sans', Inter, sans-serif;
  font-size: 15px;
}

.main-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 30px;
  max-width: 1600px;
  margin: 0 auto;
}

/* --- TARJETAS SOFT LIGHT --- */
.soft-card, .unit-card-soft {
  /* Fondo de tarjetas: Azul pastel claro */
  background-color: #9bd3f1; /* --color-ContenedorClaro */
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); /* Sombras muy suaves */
  border: 1px solid rgba(139, 194, 243, 0.2); /* var(--color-Azul) con opacidad */
}

/* --- BOTÓN REGRESAR ESTILO SOFT --- */
.btn-back-soft {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #9bd3f1; /* Fondo suave */
  border: 1px solid rgba(30, 103, 163, 0.1); /* var(--color-AzulTres) suave */
  padding: 12px 20px;
  border-radius: 18px;
  cursor: pointer;
  margin-bottom: 25px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: fit-content;
}

.back-icon-box {
  width: 42px;
  height: 42px;
  background-color: #d6e9fa; /* Color de fondo principal */
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e67a3; /* --color-AzulTres */
  transition: 0.3s;
}

.back-text small {
  color: #0c4a7a; /* --color-TitulosMenu */
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 1px;
  text-align: left; display: block;
}

.back-text span {
  color: #242f4e; /* --color-OscuroAzulado */
  font-weight: 800;
  font-size: 1rem;
}

.btn-back-soft:hover {
  background-color: #8bc2f3; /* --color-Azul */
  transform: translateX(-5px);
  border-color: transparent;
}

.btn-back-soft:hover .back-icon-box {
  background-color: #1e67a3; /* --color-AzulTres */
  color: #ffffff;
}

/* --- DETALLES SIDEBAR --- */
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
  background: linear-gradient(135deg, #1e67a3 0%, #0c4a7a 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(30, 103, 163, 0.2);
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%);
  color: #166534;
  border: 1.5px solid rgba(34, 197, 94, 0.3);
  font-weight: 700;
}

.title {
  font-size: 1.8rem;
  color: #0c4a7a;
  font-weight: 800;
  margin: 0 0 10px;
  line-height: 1.2;
}

.description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 25px;
  font-weight: 500;
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  border-top: 2px solid #1e67a3;
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
  background: linear-gradient(135deg, #1e67a3 0%, #0c4a7a 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(30, 103, 163, 0.15);
}

.meta-item label {
  display: block;
  font-size: 11px;
  color: #999;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-item span {
  font-weight: 700;
  color: #242f4e;
  font-size: 0.95rem;
}

/* ESTUDIANTES CARD */
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
  color: #0c4a7a;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.count-pill {
  background: #d6e9fa;
  color: #0c4a7a;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 0.8rem;
}

/* BOTÓN INSCRIBIR ESTUDIANTE */
.btn-inscribe-student {
  width: calc(100% + 50px);
  background: linear-gradient(135deg, #1e67a3 0%, #0c4a7a 100%);
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
  box-shadow: 0 4px 12px rgba(30, 103, 163, 0.2);
}

.btn-inscribe-student:hover {
  background: linear-gradient(135deg, #0c4a7a 0%, #082a45 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(30, 103, 163, 0.3);
}

.students-scroll {
  overflow-y: auto;
  flex: 1;
  padding-right: 5px;
}

.student-item {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0,0,0,0.03);
  transition: all 0.2s;
}

.student-item:hover {
  background: rgba(30, 103, 163, 0.05);
  padding: 12px 8px;
  border-radius: 8px;
  margin: 0 -8px;
}

.avatar {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #1e67a3 0%, #0c4a7a 100%);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(30, 103, 163, 0.15);
}

.student-detail .name {
  font-weight: 600;
  font-size: 0.9rem;
  margin: 0;
  color: #242f4e;
  transition: all 0.2s;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.student-detail .name:hover {
  color: #1e67a3;
  background: rgba(30, 103, 163, 0.08);
  font-weight: 700;
}

.student-detail .email {
  font-size: 0.8rem;
  color: #777;
  margin: 0;
  font-weight: 500;
}

/* --- ÁREA CENTRAL --- */
.top-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.stat-box {
  padding: 28px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255,255,255,0.2);
}

.stat-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}

.box-solid-blue {
  background: linear-gradient(135deg, #1e67a3 0%, #0c4a7a 100%);
  color: white;
}

.box-soft-blue {
  background: linear-gradient(135deg, #9bd3f1 0%, #8bc2f3 100%);
  border: 2px solid rgba(30, 103, 163, 0.2);
  color: #0c4a7a;
}

.stat-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 600;
}

.stat-icon-primary {
  background: rgba(255,255,255,0.2);
  color: white;
}

.stat-icon-secondary {
  background: rgba(30, 103, 163, 0.15);
  color: #1e67a3;
}

.stat-text{
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.number {
  font-size: 2.4rem;
  font-weight: 900;
  display: block;
  line-height: 1;
}

.label {
  font-size: 0.85rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  opacity: 0.85;
}

/* TIMELINE */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  color: #0c4a7a;
  font-size: 1.3rem;
  margin: 0;
}

.btn-primary-add {
  background: #1e67a3;
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.3s;
}

.btn-primary-add:hover {
  background: #0c4a7a;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.unit-card-soft {
  display: flex;
  gap: 20px;
  padding: 20px;
  border-radius: 20px;
  align-items: center;
  border-left: 5px solid #1e67a3;
}

.unit-index-badge {
  width: 45px;
  height: 45px;
  background: #d6e9fa;
  border: 2px solid #8bc2f3;
  color: #1e67a3;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.2rem;
}

.unit-body {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.unit-main h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #242f4e;
}

.date-row {
  display: flex;
  gap: 12px;
}

.date-tag {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.date-tag strong {
  font-size: 0.7rem;
  margin-right: 6px;
  opacity: 0.7;
  font-weight: 800;
}

.date-tag.start {
  background: rgba(34, 197, 94, 0.1);
  color: #166534;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.date-tag.end {
  background: rgba(239, 68, 68, 0.1);
  color: #c53030;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.btn-manage-unit {
  background: #ffffff;
  border: 1px solid #1e67a3;
  color: #1e67a3;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s;
}

.btn-manage-unit:hover {
  background: #1e67a3;
  color: white;
}

.state-msg {
  text-align: center;
  padding: 100px;
  color: #666;
  font-size: 1.2rem;
}

/* MODALES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.modal-content.modal-large {
  max-width: 600px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #0c4a7a;
  font-weight: 800;
}

.btn-close-modal {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.btn-close-modal:hover {
  color: #0c4a7a;
  transform: rotate(90deg);
}

.modal-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  color: #242f4e;
  margin-bottom: 8px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s;
  background: white;
  color: #242f4e;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #1e67a3;
  background: #f8fbff;
  box-shadow: 0 0 0 3px rgba(30, 103, 163, 0.1);
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231e67a3' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 25px;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 11px 24px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.95rem;
}

.btn-cancel {
  background: #f3f4f6;
  color: #666;
}

.btn-cancel:hover {
  background: #e5e7eb;
  color: #242f4e;
}

.btn-confirm {
  background: #1e67a3;
  color: white;
}

.btn-confirm:hover {
  background: #0c4a7a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 103, 163, 0.2);
}

/* SCROLLBAR CUSTOM (SOFT) */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background: #8bc2f3;
  border-radius: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

/* --- MODAL DE DETALLES DEL ESTUDIANTE --- */
.student-avatar-large {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1e67a3 0%, #0c4a7a 100%);
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.8rem;
  box-shadow: 0 6px 20px rgba(30, 103, 163, 0.2);
  margin: 0 auto 20px;
}

.student-info-section {
  text-align: center;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 16px;
}

.student-info-section h3 {
  margin: 0;
  font-size: 1.4rem;
  color: #0c4a7a;
  font-weight: 800;
}

.info-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
  transition: all 0.2s;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item:hover {
  background: #f9fbff;
  padding: 16px 12px;
  margin: 0 -12px;
  border-radius: 8px;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 600;
}

.email-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.phone-icon {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.id-icon {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.date-icon {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.info-content {
  flex: 1;
}

.info-content label {
  display: block;
  font-size: 0.8rem;
  color: #999;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.info-content p {
  margin: 0;
  color: #242f4e;
  font-weight: 600;
  font-size: 0.95rem;
}

.phone-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #22c55e;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s;
  background: rgba(34, 197, 94, 0.05);
}

.phone-link:hover {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
  text-decoration: underline;
}
</style>
