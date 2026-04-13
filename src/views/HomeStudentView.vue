<script setup lang="ts">
import SidebarLayout from '@/components/StudentSideBar.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useapi } from '@/assets/composables/useApi'
import { computed, h } from 'vue'

const ua = useAuthStore()

// --- ICONOS SVG ---
const IconBook = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20' })
])
const IconClipboard = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('rect', { x: '8', y: '2', width: '8', height: '4', rx: '1', ry: '1' }),
  h('path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' })
])
const IconBell = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
  h('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' })
])

// --- LÓGICA DE DATOS (Rutas de Alumno) ---
const { data: groupsData, isFetching: loadingGroups } = useapi('/my-groups').json()
const { data: assignmentsData } = useapi('/my-assignments').json()
const { data: notificationsData } = useapi('/notifications').json()

const totalGroups = computed(() => groupsData.value?.data?.length || 0)
const pendingAssignments = computed(() => {
  // Filtramos tareas que no tienen el status "Calificada" o "Entregada"
  return assignmentsData.value?.data?.filter((a: any) => a.status !== 'Calificada').length || 0
})
const unreadNotifications = computed(() => {
  return notificationsData.value?.data?.filter((n: any) => !n.read_at).length || 0
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <div class="header-box">
        <div class="header-content">
          <div class="left-info">
            <div class="avatar">
              {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
            </div>
            <div>
              <h1>¡Hola de nuevo, {{ ua.credentials?.user.name }}!</h1>
              <p>Aquí tienes un vistazo de tu progreso escolar</p>
            </div>
          </div>
          <div class="badge-home">ESTUDIANTE</div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="status-card">
          <div class="icon-wrapper bg-blue">
            <IconBook class="svg-icon" />
          </div>
          <div class="card-info">
            <h4>{{ totalGroups }}</h4>
            <p>Mis Materias</p>
          </div>
        </div>
        
        <div class="status-card">
          <div class="icon-wrapper bg-orange">
            <IconClipboard class="svg-icon" />
          </div>
          <div class="card-info">
            <h4>{{ pendingAssignments }}</h4>
            <p>Tareas Pendientes</p>
          </div>
        </div>

        <div class="status-card">
          <div class="icon-wrapper bg-green">
            <IconBell class="svg-icon" />
          </div>
          <div class="card-info">
            <h4>{{ unreadNotifications }}</h4>
            <p>Notificaciones</p>
          </div>
        </div>
      </div>

      <div class="main-content-grid">
        <div class="content-column">
          <div class="section-header">
            <h3>Mis Grupos e Inscripciones</h3>
            <router-link to="/student/groups" class="view-link">Ver todo</router-link>
          </div>
          
          <div v-if="loadingGroups" class="loading-state">Cargando tus clases...</div>
          <div v-else class="groups-list">
            <div v-for="group in groupsData?.data?.slice(0, 4)" :key="group.id" class="group-row">
              <div class="group-info">
                <span class="g-name">{{ group.name }}</span>
                <span class="g-teacher">Prof. {{ group.teacher?.name || 'Asignado' }}</span>
              </div>
              <div class="g-tag">Activo</div>
            </div>
            <div v-if="!groupsData?.data?.length" class="empty">No estás inscrito en ningún grupo aún.</div>
          </div>
        </div>

        <div class="content-column">
          <div class="section-header">
            <h3>Centro de Notificaciones</h3>
          </div>
          <div class="announcements-list">
            <div v-for="notif in notificationsData?.data?.slice(0, 4)" :key="notif.id" 
                 class="ann-item" :class="{ 'unread': !notif.read_at }">
              <div class="ann-top">
                <span class="ann-title">{{ notif.title || 'Nueva Notificación' }}</span>
                <span class="ann-time">{{ formatDate(notif.created_at) }}</span>
              </div>
              <p class="ann-text">{{ notif.data?.message || notif.content || 'Tienes una nueva notificación en la plataforma.' }}</p>
            </div>
            <div v-if="!notificationsData?.data?.length" class="empty">No tienes notificaciones pendientes</div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  </div>
</template>

<style scoped>
/* Heredamos la base del profesor para consistencia visual */
.bg-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-AzulDos), var(--color-ComplementoDos));
  padding-bottom: 50px;
}

.header-box { padding: 40px; color: white; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.left-info { display: flex; align-items: center; gap: 15px; }
.header-box h1 { margin: 0; font-size: 1.8rem; }
.header-box p { margin: 2px 0 0; opacity: 0.8; font-size: 0.9rem; }

.avatar {
  width: 55px; height: 55px; background: white; color: var(--color-Azul);
  border-radius: 15px; display: flex; align-items: center; justify-content: center;
  font-weight: 800; box-shadow: 0 5px 15px rgba(0,0,0,0.1); font-size: 1.2rem;
}

.badge-home {
  background: rgba(255,255,255,0.2);
  padding: 6px 15px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 1px;
  border: 1px solid rgba(255,255,255,0.3);
}

/* Dashboard Cards */
.dashboard-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

/* Content Grid */
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
  font-size: 0.75rem; background: #f1f5f9; padding: 6px 14px; 
  border-radius: 8px; color: #2563eb; font-weight: 700; text-decoration: none;
}

/* Groups List */
.groups-list { display: flex; flex-direction: column; gap: 12px; }
.group-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px; background: #f8fafc; border-radius: 15px; border: 1px solid #f1f5f9;
}
.g-name { display: block; font-weight: 700; color: #334155; font-size: 0.95rem; }
.g-teacher { font-size: 0.75rem; color: #64748b; }
.g-tag { font-size: 0.65rem; font-weight: 800; color: #16a34a; background: #dcfce7; padding: 4px 8px; border-radius: 6px; }

/* Notifications List */
.announcements-list { display: flex; flex-direction: column; gap: 15px; }
.ann-item { border-left: 3px solid #e2e8f0; padding-left: 15px; transition: all 0.2s; }
.ann-item.unread { border-left-color: #2563eb; background: #f0f7ff; padding: 10px 15px; border-radius: 0 10px 10px 0; }
.ann-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
.ann-title { font-weight: 700; font-size: 0.85rem; color: #1e293b; }
.ann-time { font-size: 0.7rem; color: #94a3b8; }
.ann-text { font-size: 0.8rem; color: #64748b; margin: 0; line-height: 1.4; }

.loading-state, .empty { text-align: center; color: #94a3b8; font-size: 0.85rem; padding: 30px; }

@media (max-width: 992px) {
  .main-content-grid { grid-template-columns: 1fr; }
}
</style>