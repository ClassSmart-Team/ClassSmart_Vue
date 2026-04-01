<script setup lang="ts">
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

const getInitials = (name: string, lastname: string) => {
  return `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
}

const goBack = () => {
  router.push('/teacher/groups')
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
          <div class="students-scroll">
            <div v-for="student in data.data.students" :key="student.id" class="student-item">
              <div class="avatar">{{ getInitials(student.name, student.lastname) }}</div>
              <div class="student-detail">
                <p class="name">{{ student.name }} {{ student.lastname }}</p>
                <p class="email">{{ student.email }}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main class="content-area">
        <section class="top-stats">
          <div class="stat-box box-solid-blue">
            <div class="stat-icon-wrapper"><IconBook /></div>
            <div class="stat-text">
              <span class="number">{{ data.data.units.length }}</span>
              <span class="label">Unidades Temáticas</span>
            </div>
          </div>
          <div class="stat-box box-soft-blue">
            <div class="stat-icon-wrapper"><IconPlus /></div>
            <div class="stat-text">
              <span class="number">{{ data.data.assignments_count }}</span>
              <span class="label">Tareas Totales</span>
            </div>
          </div>
        </section>

        <section class="units-timeline">
          <div class="section-header">
            <h2>Estructura del Programa</h2>
            <button class="btn-primary-add">
              <IconPlus /> Inscribir Estudiante
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
.sidebar-info { display: flex; flex-direction: column; gap: 20px; }
.card-header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.group-id { font-size: 11px; font-weight: 900; background: #0c4a7a; color: white; padding: 3px 8px; border-radius: 6px; }

.status-badge { font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 99px; }
.status-badge.active { background: rgba(34, 197, 94, 0.1); color: #166534; }

.title { font-size: 1.8rem; color: #0c4a7a; font-weight: 800; margin: 0 0 10px; line-height: 1.2; }
.description { color: #555; font-size: 0.95rem; line-height: 1.5; margin: 0 0 25px; }

.meta-list { display: flex; flex-direction: column; gap: 15px; border-top: 2px solid #8bc2f3; padding-top: 20px; }
.meta-item { display: flex; gap: 15px; align-items: center; }
.meta-icon-wrapper { color: #1e67a3; width: 40px; height: 40px; background: #d6e9fa; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.meta-item label { display: block; font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; }
.meta-item span { font-weight: 700; color: #242f4e; font-size: 0.95rem; }

/* ESTUDIANTES CARD */
.students-card { max-height: 550px; display: flex; flex-direction: column; }
.card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-header-flex h3 { color: #0c4a7a; font-size: 1.1rem; font-weight: 700; margin: 0; }
.count-pill { background: #d6e9fa; color: #0c4a7a; font-weight: 800; padding: 4px 12px; border-radius: 99px; font-size: 0.8rem; }

.students-scroll { overflow-y: auto; flex: 1; padding-right: 5px; }
.student-item { display: flex; gap: 15px; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.03); }
.avatar { width: 38px; height: 38px; background: #1e67a3; color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; }
.student-detail .name { font-weight: 600; font-size: 0.9rem; margin: 0; color: #242f4e; }
.student-detail .email { font-size: 0.8rem; color: #666; margin: 0; }

/* --- ÁREA CENTRAL --- */
.top-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
.stat-box { padding: 25px; border-radius: 20px; display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
.box-solid-blue { background: #1e67a3; color: white; }
.box-soft-blue { background: #9bd3f1; border: 2px solid #1e67a3; color: #0c4a7a; }
.box-soft-blue .stat-icon-wrapper { background: #d6e9fa; color: #1e67a3; }
.stat-icon-wrapper { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.stat-number { font-size: 2.2rem; font-weight: 900; display: block; }
.stat-label { font-size: 0.8rem; text-transform: uppercase; font-weight: 700; opacity: 0.8; }

/* TIMELINE */
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.section-header h2 { color: #0c4a7a; font-size: 1.3rem; margin: 0; }
.btn-primary-add { background: #1e67a3; border: none; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
.btn-primary-add:hover { background: #0c4a7a; }

.timeline { display: flex; flex-direction: column; gap: 15px; }
.unit-card-soft { display: flex; gap: 20px; padding: 20px; border-radius: 20px; align-items: center; border-left: 5px solid #1e67a3; }
.unit-index-badge { width: 45px; height: 45px; background: #d6e9fa; border: 2px solid #8bc2f3; color: #1e67a3; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; }
.unit-body { flex: 1; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.unit-main h3 { margin: 0 0 10px 0; font-size: 1.2rem; color: #242f4e; }

.date-row { display: flex; gap: 12px; }
.date-tag { padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }
.date-tag strong { font-size: 0.7rem; margin-right: 6px; opacity: 0.7; font-weight: 800; }
.date-tag.start { background: rgba(34, 197, 94, 0.1); color: #166534; border: 1px solid rgba(34, 197, 94, 0.2); }
.date-tag.end { background: rgba(239, 68, 68, 0.1); color: #c53030; border: 1px solid rgba(239, 68, 68, 0.2); }

.btn-manage-unit { background: #ffffff; border: 1px solid #1e67a3; color: #1e67a3; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; }
.btn-manage-unit:hover { background: #1e67a3; color: white; }

.state-msg { text-align: center; padding: 100px; color: #666; font-size: 1.2rem; }

/* SCROLLBAR CUSTOM (SOFT) */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #8bc2f3; border-radius: 10px; }
::-webkit-scrollbar-track { background: transparent; }
</style>
