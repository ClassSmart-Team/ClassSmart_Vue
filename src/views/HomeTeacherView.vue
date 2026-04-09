<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useapi } from '@/assets/composables/useApi'
import { computed, h } from 'vue'

const ua = useAuthStore()

// --- ICONOS SVG (Componentes locales sin instalaciones) ---
const IconBook = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20' })
])
const IconPen = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M12 20h9' }),
  h('path', { d: 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' })
])
const IconMegaphone = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'm3 11 18-5v12L3 14v-3z' }),
  h('path', { d: 'M11.6 16.8a3 3 0 1 1-5.8-1.6' })
])

// --- LÓGICA DE DATOS ---
const { data: groupsData, isFetching: loadingGroups } = useapi('/groups').json()
const { data: announcementsData } = useapi('/announcements').json()
const { data: assignmentsData } = useapi('/assignments').json()

const totalGroups = computed(() => groupsData.value?.data?.length || 0)
const totalAnnouncements = computed(() => announcementsData.value?.data?.length || 0)
const activeAssignments = computed(() => {
  return assignmentsData.value?.data?.filter((a: any) => a.status === 'Activa').length || 0
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <div class="header-box">
        <div class="left-info">
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <div>
            <h1>¡Hola, {{ ua.credentials?.user.name }}!</h1>
            <p>Resumen de tu actividad académica</p>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="status-card">
          <div class="icon-wrapper bg-blue">
            <IconBook class="svg-icon" />
          </div>
          <div class="card-info">
            <h4>{{ totalGroups }}</h4>
            <p>Grupos</p>
          </div>
        </div>
        
        <div class="status-card">
          <div class="icon-wrapper bg-orange">
            <IconPen class="svg-icon" />
          </div>
          <div class="card-info">
            <h4>{{ activeAssignments }}</h4>
            <p>Tareas</p>
          </div>
        </div>

        <div class="status-card">
          <div class="icon-wrapper bg-green">
            <IconMegaphone class="svg-icon" />
          </div>
          <div class="card-info">
            <h4>{{ totalAnnouncements }}</h4>
            <p>Anuncios</p>
          </div>
        </div>
      </div>

      <div class="main-content-grid">
        <div class="content-column">
          <div class="section-header">
            <h3>Tus Grupos</h3>
            <router-link to="/teacher/groups" class="view-link">Gestionar</router-link>
          </div>
          
          <div v-if="loadingGroups" class="loading">Cargando...</div>
          <div v-else class="groups-list">
            <div v-for="group in groupsData?.data?.slice(0, 4)" :key="group.id" class="group-row">
              <div class="group-info">
                <span class="g-name">{{ group.name }}</span>
                <span class="g-count">{{ group.students_count || 0 }} alumnos inscritos</span>
              </div>
            </div>
          </div>
        </div>

        <div class="content-column">
          <div class="section-header">
            <h3>Últimos Anuncios</h3>
          </div>
          <div class="announcements-list">
            <div v-for="ann in announcementsData?.data?.slice(0, 3)" :key="ann.id" class="ann-item">
              <div class="ann-top">
                <span class="ann-title">{{ ann.title }}</span>
                <span class="ann-time">{{ formatDate(ann.created_at) }}</span>
              </div>
              <p class="ann-text">{{ ann.content }}</p>
            </div>
            <div v-if="!announcementsData?.data?.length" class="empty">No hay avisos recientes</div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  </div>
</template>

<style scoped>
.bg-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-AzulDos), var(--color-ComplementoDos));
  padding-bottom: 50px;
}

.header-box { padding: 40px; color: white; }
.left-info { display: flex; align-items: center; gap: 15px; }
.header-box h1 { margin: 0; font-size: 1.8rem; }
.header-box p { margin: 2px 0 0; opacity: 0.8; font-size: 0.9rem; }

.avatar {
  width: 50px; height: 50px; background: white; color: var(--color-Azul);
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  font-weight: 800; box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* Dashboard */
.dashboard-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px; padding: 0 40px; margin-bottom: 30px;
}

.status-card {
  background: white; padding: 20px; border-radius: 20px;
  display: flex; align-items: center; gap: 15px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.icon-wrapper {
  width: 45px; height: 45px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.bg-blue { background: #eff6ff; color: #2563eb; }
.bg-orange { background: #fff7ed; color: #f97316; }
.bg-green { background: #f0fdf4; color: #16a34a; }
.svg-icon { width: 22px; height: 22px; }

.card-info h4 { margin: 0; font-size: 1.4rem; color: #1e293b; }
.card-info p { margin: 0; font-size: 0.8rem; color: #64748b; font-weight: 600; }

/* Content Columns */
.main-content-grid {
  display: grid; grid-template-columns: 1.2fr 1fr;
  gap: 25px; padding: 0 40px;
}

.content-column {
  background: white; border-radius: 25px; padding: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.section-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;
}
.section-header h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }
.view-link { 
  font-size: 0.75rem; 
  background: #f1f5f9; 
  padding: 6px 14px; 
  border-radius: 8px; 
  color: #2563eb; 
  font-weight: 700; 
  text-decoration: none;
  transition: all 0.2s;
}
.view-link:hover { background: #2563eb; color: white; }

/* Grupos List (Informativa, no clicable) */
.groups-list { display: flex; flex-direction: column; gap: 10px; }
.group-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px; background: #f8fafc; border-radius: 15px;
  border: 1px solid #f1f5f9;
}
.g-name { display: block; font-weight: 700; color: #334155; font-size: 0.9rem; }
.g-count { font-size: 0.75rem; color: #94a3b8; }

/* Announcements */
.announcements-list { display: flex; flex-direction: column; gap: 15px; }
.ann-item { border-left: 3px solid #e2e8f0; padding-left: 15px; }
.ann-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
.ann-title { font-weight: 700; font-size: 0.85rem; color: #1e293b; }
.ann-time { font-size: 0.7rem; color: #94a3b8; }
.ann-text { font-size: 0.8rem; color: #64748b; margin: 0; line-height: 1.5; }

.empty { text-align: center; color: #94a3b8; font-size: 0.85rem; padding: 20px; }

@media (max-width: 850px) {
  .main-content-grid { grid-template-columns: 1fr; }
}
</style>