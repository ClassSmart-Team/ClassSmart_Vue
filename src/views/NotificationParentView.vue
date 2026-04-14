<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import SidebarLayout from '@/components/ParentSidebar.vue'
import NotificationItem from '@/components/NotificationCard.vue'
import { useapi } from '@/assets/composables/useApi.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import type { Notifications } from '@/types/types.ts'

const ua = useAuthStore()
const router = useRouter()

const { data, isFetching, error, execute: refetch } = useapi('/notifications').json()

const activeFilter = ref<'all' | 'unread' | 'read'>('all')
const selectedNotif = ref<Notifications | null>(null)

function openDetail(notif: Notifications) {
  selectedNotif.value = notif
  markAsRead(notif)
}

function closeDetail() {
  selectedNotif.value = null
}

const notifications = computed<Notifications[]>(() => data.value?.data || [])
const unreadCount = computed(() => notifications.value.filter((n) => !n.read_at).length)

const filtered = computed(() => {
  if (activeFilter.value === 'unread')
    return notifications.value.filter((n: Notifications) => !n.read_at)
  if (activeFilter.value === 'read')
    return notifications.value.filter((n: Notifications) => n.read_at)
  return notifications.value
})

async function markAsRead(notif: Notifications) {
  if (notif.read_at) return
  await useapi(`/notifications/${notif.id}/read`, { method: 'PATCH' }).json().execute()
  await refetch()
}

async function markAllRead() {
  const unread = notifications.value.filter((n) => !n.read_at)
  await Promise.all(
    unread.map((n) => useapi(`/notifications/${n.id}/read`, { method: 'PATCH' }).json().execute()),
  )
  await refetch()
}

function formatDateFull(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleNavigation = async (notif: any) => {
  if (!notif.is_read) {
    notif.is_read = true
    await useapi(`/notifications/${notif.id}/read`).patch().json()
  }

  if (notif.route_info && notif.route_info.name) {
    try {
      router.push({
        name: notif.route_info.name,
        // Solo enviamos params si la ruta no es una de las "estáticas"
        params: ['parentHome', 'parentGrades'].includes(notif.route_info.name)
          ? {}
          : notif.route_info.params,
      })
    } catch (err) {
      console.error('Error en la ruta:', err)
    }
  }
}
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <div class="ContSmall">
        <div class="left" style="display: flex; align-items: center; gap: 15px">
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <div>
            <h1>Notificaciones</h1>
          </div>
        </div>
        <div class="right">
          <span class="welcome-text">{{ ua.credentials?.user.name }}</span>
        </div>
      </div>

      <div
        class="main-box"
        style="margin-top: 30px;"
      >
        <div v-if="isFetching" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando notificaciones...</p>
        </div>

        <div v-else-if="error" class="error-banner">
          <p>Hubo un problema al cargar la información.</p>
        </div>

        <template v-else>
          <div
            class="section-header"
            style="display: flex; justify-content: space-between; margin-bottom: 20px"
          >
            <div class="filter-group" style="display: flex; gap: 10px">
              <button
                class="filter-btn"
                :class="{ active: activeFilter === 'all' }"
                @click="activeFilter = 'all'"
              >
                Todas
              </button>
              <button
                class="filter-btn"
                :class="{ active: activeFilter === 'unread' }"
                @click="activeFilter = 'unread'"
              >
                Sin leer
                <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
              </button>
              <button
                class="filter-btn"
                :class="{ active: activeFilter === 'read' }"
                @click="activeFilter = 'read'"
              >
                Leídas
              </button>
            </div>

            <button v-if="unreadCount > 0" class="mark-all-btn" @click="markAllRead">
              Marcar todas como leídas
            </button>
          </div>

          <div v-if="filtered.length > 0" class="notif-list">
            <NotificationItem
              v-for="n in filtered"
              :key="n.id"
              :notification="n"
              @click="openDetail(n)"
              @navigate="handleNavigation"
            />
          </div>

          <div v-else class="empty-state">
            <p>No tienes notificaciones en esta categoría.</p>
          </div>
        </template>
      </div>
    </SidebarLayout>

    <div v-if="selectedNotif" class="modal-overlay" @click.self="closeDetail">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div class="modal-header-info">
            <h2>{{ selectedNotif.title || 'Notificación' }}</h2>
            <span class="modal-date">{{ formatDateFull(selectedNotif.created_at) }}</span>
          </div>
          <button class="modal-close" @click="closeDetail">✕</button>
        </div>

        <div
          class="modal-meta"
          v-if="selectedNotif.group || selectedNotif.type || selectedNotif.creator"
        >
          <span v-if="selectedNotif.type" class="chip chip-type">{{ selectedNotif.type }}</span>
          <span v-if="selectedNotif.group" class="chip chip-group">{{
            selectedNotif.group.name
          }}</span>
        </div>

        <div class="modal-body">
          <p class="modal-message">{{ selectedNotif.message }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-close" @click="closeDetail">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-page {
  min-height: 100vh;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: -1;
}

.ContSmall {
  background: var(--color-Azul);
  width: 95%;
  max-width: 1000px;
  min-height: 40px;
  border-radius: 20px;
  margin: 0 auto;
  padding: 20px 25px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ContSmall h1 {
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: -0.5px;
}

.ContSmall p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.welcome-text {
  font-weight: 600;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 15px;
  border-radius: 10px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #94a3b8;
}
.spinner {
  width: 45px;
  height: 45px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid var(--color-Azul);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-banner {
  background: #fee2e2;
  color: #dc2626;
  padding: 18px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
}

@media (max-width: 1050px) {
  .ContSmall,
  .ContBig {
    width: 95%;
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  padding: 0 40px;
  margin-bottom: 30px;
}

.status-card {
  background: white;
  padding: 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.icon-wrapper {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-blue {
  background: #eff6ff;
  color: #2563eb;
}
.bg-orange {
  background: #fff7ed;
  color: #f97316;
}
.bg-green {
  background: #f0fdf4;
  color: #16a34a;
}
.svg-icon {
  width: 22px;
  height: 22px;
}

.card-info h4 {
  margin: 0;
  font-size: 1.4rem;
  color: #1e293b;
}
.card-info p {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 15px;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 8px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  border: none;
  padding: 7px 16px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}
.filter-btn:hover {
  background: #e2e8f0;
}
.filter-btn.active {
  background: var(--color-Azul, #2563eb);
  color: white;
}

.badge {
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 10px;
}

.mark-all-btn {
  background: none;
  border: 1px solid #e2e8f0;
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}
.mark-all-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.notif-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(3px);
}

.modal {
  background: white;
  border-radius: 22px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* Header del modal */
.modal-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 22px 22px 18px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
}
.modal-icon svg {
  width: 18px;
  height: 18px;
}

.modal-header-info {
  flex: 1;
  min-width: 0;
}
.modal-header-info h2 {
  margin: 0 0 3px;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
}
.modal-date {
  font-size: 0.72rem;
  color: #94a3b8;
  text-transform: capitalize;
}

.modal-close {
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  color: #64748b;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  transition: background 0.15s;
}
.modal-close:hover {
  background: #e2e8f0;
}

/* Chips metadata */
.modal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 14px 22px 0;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}
.chip-type {
  background: #f0fdf4;
  color: #16a34a;
}
.chip-group {
  background: #eff6ff;
  color: #2563eb;
}
.chip-creator {
  background: #faf5ff;
  color: #7c3aed;
}

/* Cuerpo */
.modal-body {
  padding: 18px 22px 10px;
}

.modal-message {
  margin: 0;
  font-size: 0.88rem;
  color: #334155;
  line-height: 1.7;
  white-space: pre-wrap;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 22px 20px;
}

.modal-read-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #16a34a;
}

.btn-close {
  background: #f1f5f9;
  border: none;
  padding: 8px 20px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-close:hover {
  background: #e2e8f0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .main-box {
    padding-left: 20px;
    padding-right: 20px;
  }
  .main-box {
    margin: 0 20px;
  }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .modal {
    margin: 0 16px;
  }
}
</style>
