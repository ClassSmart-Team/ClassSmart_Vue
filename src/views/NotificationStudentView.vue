<script setup lang="ts">
import SidebarLayout from '@/components/StudentSideBar.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useapi } from '@/assets/composables/useApi'
import { computed, ref } from 'vue'

const ua = useAuthStore()

// --- TIPOS ---
interface Notification {
  id: number
  title: string
  message?: string
  read_at: string | null
  created_at: string
  type?: string
  group?: { id: number; name: string }
  creator?: { id: number; name: string; lastname: string }
}

// --- FETCH DE DATOS ---
const { data: notificationsData, isFetching, execute: refetch } = useapi('/notifications').json()

// --- FILTRO ACTIVO ---
const activeFilter = ref<'all' | 'unread' | 'read'>('all')

// --- MODAL DETALLE ---
const selectedNotif = ref<Notification | null>(null)

function openDetail(notif: Notification) {
  selectedNotif.value = notif
  markAsRead(notif)
}

function closeDetail() {
  selectedNotif.value = null
}

// --- COMPUTADAS ---
const allNotifications = computed<Notification[]>(() => notificationsData.value?.data ?? [])

const unreadCount = computed(() => allNotifications.value.filter(n => !n.read_at).length)
const readCount   = computed(() => allNotifications.value.filter(n =>  n.read_at).length)

const filtered = computed(() => {
  if (activeFilter.value === 'unread') return allNotifications.value.filter(n => !n.read_at)
  if (activeFilter.value === 'read')   return allNotifications.value.filter(n =>  n.read_at)
  return allNotifications.value
})

// --- MARCAR COMO LEÍDA ---
async function markAsRead(notif: Notification) {
  if (notif.read_at) return
  await useapi(`/notifications/${notif.id}/read`, { method: 'PATCH' }).json().execute()
  await refetch()
}

async function markAllAsRead() {
  const unread = allNotifications.value.filter(n => !n.read_at)
  await Promise.all(
    unread.map(n => useapi(`/notifications/${n.id}/read`, { method: 'PATCH' }).json().execute())
  )
  await refetch()
}

// --- HELPERS ---
function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs   = now.getTime() - date.getTime()
  const diffMin  = Math.floor(diffMs / 60000)
  const diffHrs  = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffMin < 1)    return 'Ahora mismo'
  if (diffMin < 60)   return `Hace ${diffMin} min`
  if (diffHrs < 24)   return `Hace ${diffHrs} h`
  if (diffDays === 1) return 'Ayer'
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

function formatDateFull(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function getInitials() {
  const name = ua.credentials?.user.name?.charAt(0) ?? ''
  const last = ua.credentials?.user.lastname?.charAt(0) ?? ''
  return `${name}${last}`
}
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>

      <!-- HEADER -->
      <div class="header-box">
        <div class="header-content">
          <div class="left-info">
            <div class="avatar">{{ getInitials() }}</div>
            <div>
              <h1>Notificaciones</h1>
              <p>Mantente al tanto de todo lo que pasa</p>
            </div>
          </div>
          <div class="badge-home">ESTUDIANTE</div>
        </div>
      </div>

      <!-- SUMMARY CARDS -->
      <div class="dashboard-grid">
        <div class="status-card">
          <div class="icon-wrapper bg-blue">
            <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div class="card-info">
            <h4>{{ allNotifications.length }}</h4>
            <p>Total</p>
          </div>
        </div>

        <div class="status-card">
          <div class="icon-wrapper bg-orange">
            <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="card-info">
            <h4>{{ unreadCount }}</h4>
            <p>Sin leer</p>
          </div>
        </div>

        <div class="status-card">
          <div class="icon-wrapper bg-green">
            <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="card-info">
            <h4>{{ readCount }}</h4>
            <p>Leídas</p>
          </div>
        </div>
      </div>

      <!-- MAIN PANEL -->
      <div class="main-panel">

        <!-- TOOLBAR -->
        <div class="section-header">
          <div class="filter-group">
            <button class="filter-btn" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">Todas</button>
            <button class="filter-btn" :class="{ active: activeFilter === 'unread' }" @click="activeFilter = 'unread'">
              Sin leer
              <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
            </button>
            <button class="filter-btn" :class="{ active: activeFilter === 'read' }" @click="activeFilter = 'read'">Leídas</button>
          </div>

          <button v-if="unreadCount > 0" class="mark-all-btn" @click="markAllAsRead">
            Marcar todas como leídas
          </button>
        </div>

        <!-- LOADING -->
        <div v-if="isFetching" class="loading-state">
          Cargando notificaciones...
        </div>

        <!-- LISTA -->
        <div v-else-if="filtered.length" class="notif-list">
          <div
            v-for="notif in filtered"
            :key="notif.id"
            class="notif-card"
            :class="{ unread: !notif.read_at }"
            @click="openDetail(notif)"
          >
            <span v-if="!notif.read_at" class="unread-dot" />

            <div class="notif-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>

            <div class="notif-body">
              <div class="notif-top">
                <span class="notif-title">{{ notif.title || 'Nueva Notificación' }}</span>
                <span class="notif-time">{{ formatDate(notif.created_at) }}</span>
              </div>
              <p class="notif-text">
                {{ notif.message || 'Toca para ver el detalle de esta notificación.' }}
              </p>
            </div>
          </div>
        </div>

        <!-- EMPTY -->
        <div v-else class="empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3; margin-bottom: 10px;">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <p>No tienes notificaciones en esta categoría</p>
        </div>

      </div>
    </SidebarLayout>

    <!-- MODAL DETALLE -->
    <div v-if="selectedNotif" class="modal-overlay" @click.self="closeDetail">
      <div class="modal">

        <!-- Cabecera del modal -->
        <div class="modal-header">
          <div class="modal-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div class="modal-header-info">
            <h2>{{ selectedNotif.title || 'Notificación' }}</h2>
            <span class="modal-date">{{ formatDateFull(selectedNotif.created_at) }}</span>
          </div>
          <button class="modal-close" @click="closeDetail">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Chips de metadata -->
        <div class="modal-meta" v-if="selectedNotif.group || selectedNotif.type || selectedNotif.creator">
          <span v-if="selectedNotif.type" class="chip chip-type">{{ selectedNotif.type }}</span>
          <span v-if="selectedNotif.group" class="chip chip-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {{ selectedNotif.group.name }}
          </span>
          <span v-if="selectedNotif.creator" class="chip chip-creator">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {{ selectedNotif.creator.name }} {{ selectedNotif.creator.lastname }}
          </span>
        </div>

        <!-- Contenido -->
        <div class="modal-body">
          <p class="modal-message">
            {{ selectedNotif.message || 'Esta notificación no tiene contenido adicional.' }}
          </p>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <span class="modal-read-status">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Leída
          </span>
          <button class="btn-close" @click="closeDetail">Cerrar</button>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Base ── */
.bg-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-AzulDos), var(--color-ComplementoDos));
  padding-bottom: 50px;
}

/* ── Header ── */
.header-box { padding: 40px; color: white; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.left-info { display: flex; align-items: center; gap: 15px; }
.header-box h1 { margin: 0; font-size: 1.8rem; }
.header-box p  { margin: 2px 0 0; opacity: 0.8; font-size: 0.9rem; }

.avatar {
  width: 55px; height: 55px;
  background: white; color: var(--color-Azul);
  border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1.2rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.badge-home {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px;
  padding: 6px 15px;
  font-weight: 700; font-size: 0.7rem; letter-spacing: 1px;
}

/* ── Summary Cards ── */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  padding: 0 40px;
  margin-bottom: 30px;
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
.bg-blue   { background: #eff6ff; color: #2563eb; }
.bg-orange { background: #fff7ed; color: #f97316; }
.bg-green  { background: #f0fdf4; color: #16a34a; }
.svg-icon  { width: 22px; height: 22px; }

.card-info h4 { margin: 0; font-size: 1.4rem; color: #1e293b; }
.card-info p  { margin: 0; font-size: 0.8rem; color: #64748b; font-weight: 600; }

/* ── Main Panel ── */
.main-panel {
  background: white;
  border-radius: 25px;
  padding: 25px;
  margin: 0 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

/* ── Toolbar ── */
.section-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 15px;
  gap: 12px; flex-wrap: wrap;
}

.filter-group { display: flex; gap: 8px; }

.filter-btn {
  display: flex; align-items: center; gap: 6px;
  background: #f1f5f9; border: none;
  padding: 7px 16px; border-radius: 10px;
  font-size: 0.8rem; font-weight: 600; color: #64748b;
  cursor: pointer; transition: all 0.15s;
}
.filter-btn:hover  { background: #e2e8f0; }
.filter-btn.active { background: var(--color-Azul, #2563eb); color: white; }

.badge {
  background: #ef4444; color: white;
  font-size: 0.65rem; font-weight: 800;
  padding: 1px 6px; border-radius: 10px;
}

.mark-all-btn {
  background: none; border: 1px solid #e2e8f0;
  padding: 7px 14px; border-radius: 10px;
  font-size: 0.78rem; font-weight: 600; color: #64748b;
  cursor: pointer; transition: all 0.15s;
}
.mark-all-btn:hover { background: #f8fafc; border-color: #cbd5e1; }

/* ── Notification List ── */
.notif-list { display: flex; flex-direction: column; gap: 10px; }

.notif-card {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 16px; border-radius: 15px;
  border: 1px solid #f1f5f9;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}
.notif-card:hover  { background: #f1f5f9; border-color: #e2e8f0; }
.notif-card.unread {
  background: #eff6ff;
  border-color: #bfdbfe;
  border-left: 3px solid #2563eb;
}

.unread-dot {
  position: absolute; top: 14px; right: 14px;
  width: 8px; height: 8px;
  background: #2563eb; border-radius: 50%;
}

.notif-icon {
  width: 38px; height: 38px; flex-shrink: 0;
  background: white; border-radius: 10px;
  border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  color: #2563eb;
}
.notif-icon svg { width: 18px; height: 18px; }

.notif-body { flex: 1; min-width: 0; }
.notif-top  {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 8px; margin-bottom: 4px;
}
.notif-title { font-size: 0.88rem; font-weight: 700; color: #334155; }
.notif-time  { font-size: 0.72rem; color: #94a3b8; white-space: nowrap; flex-shrink: 0; }
.notif-text  { font-size: 0.8rem; color: #64748b; margin: 0; line-height: 1.5;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ── States ── */
.loading-state, .empty {
  text-align: center; color: #94a3b8;
  font-size: 0.85rem; padding: 50px 20px;
  display: flex; flex-direction: column; align-items: center;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  backdrop-filter: blur(3px);
}

.modal {
  background: white; border-radius: 22px;
  width: 100%; max-width: 460px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.15);
  overflow: hidden;
}

/* Header del modal */
.modal-header {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 22px 22px 18px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-icon {
  width: 40px; height: 40px; flex-shrink: 0;
  background: #eff6ff; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #2563eb;
}
.modal-icon svg { width: 18px; height: 18px; }

.modal-header-info { flex: 1; min-width: 0; }
.modal-header-info h2 {
  margin: 0 0 3px;
  font-size: 1rem; font-weight: 700; color: #1e293b;
  line-height: 1.3;
}
.modal-date { font-size: 0.72rem; color: #94a3b8; text-transform: capitalize; }

.modal-close {
  background: #f1f5f9; border: none;
  border-radius: 8px; padding: 6px;
  cursor: pointer; color: #64748b; flex-shrink: 0;
  display: flex; align-items: center;
  transition: background 0.15s;
}
.modal-close:hover { background: #e2e8f0; }

/* Chips metadata */
.modal-meta {
  display: flex; flex-wrap: wrap; gap: 6px;
  padding: 14px 22px 0;
}

.chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.68rem; font-weight: 700;
  padding: 3px 10px; border-radius: 20px;
}
.chip-type    { background: #f0fdf4; color: #16a34a; }
.chip-group   { background: #eff6ff; color: #2563eb; }
.chip-creator { background: #faf5ff; color: #7c3aed; }

/* Cuerpo */
.modal-body { padding: 18px 22px 10px; }

.modal-message {
  margin: 0;
  font-size: 0.88rem; color: #334155;
  line-height: 1.7;
  white-space: pre-wrap;
}

/* Footer */
.modal-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 22px 20px;
}

.modal-read-status {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.72rem; font-weight: 600; color: #16a34a;
}

.btn-close {
  background: #f1f5f9; border: none;
  padding: 8px 20px; border-radius: 10px;
  font-size: 0.82rem; font-weight: 600; color: #64748b;
  cursor: pointer; transition: background 0.15s;
}
.btn-close:hover { background: #e2e8f0; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .header-box, .dashboard-grid, .main-panel { padding-left: 20px; padding-right: 20px; }
  .main-panel { margin: 0 20px; }
  .dashboard-grid { grid-template-columns: 1fr; }
  .section-header { flex-direction: column; align-items: flex-start; }
  .modal { margin: 0 16px; }
}
</style>