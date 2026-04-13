<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { useapi } from '@/assets/composables/useApi'
import { computed, ref } from 'vue'

const ua = useAuthStore()

// --- TIPOS ---
interface Group { id: number; name: string }
interface Alert { type: 'success' | 'error'; message: string }

// --- FETCH GRUPOS ---
const { data: groupsData } = useapi('/groups').json()
const groups = computed<Group[]>(() => groupsData.value?.data ?? [])

// --- ESTADO FORMULARIO ---
const isCreating = ref(false)
const newNotif = ref({
  title: '',
  message: '',
  type: 'General',
  related_group: null as number | null,
})

// --- ALERTAS ---
const alerts = ref<Alert[]>([])

function pushAlert(type: Alert['type'], message: string) {
  alerts.value.push({ type, message })
  setTimeout(() => alerts.value.shift(), 4000)
}

// --- HISTORIAL LOCAL (solo en sesión, sin llamada extra) ---
interface SentNotif { id: number; title: string; message: string; groupName: string; sentAt: Date }
const sentHistory = ref<SentNotif[]>([])

// --- ACCIONES ---
async function submitCreate() {
  if (!newNotif.value.title.trim() || !newNotif.value.message.trim()) {
    pushAlert('error', 'El título y el mensaje son obligatorios.')
    return
  }
  if (!newNotif.value.related_group) {
    pushAlert('error', 'Debes seleccionar un grupo de destino.')
    return
  }

  isCreating.value = true
  try {
    await useapi('/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif.value),
    }).json().execute()

    // Guardar en historial local
    const grupo = groups.value.find(g => g.id === newNotif.value.related_group)
    sentHistory.value.unshift({
      id: Date.now(),
      title: newNotif.value.title,
      message: newNotif.value.message,
      groupName: grupo?.name ?? 'Grupo',
      sentAt: new Date(),
    })

    pushAlert('success', `Notificación "${newNotif.value.title}" enviada al grupo ${grupo?.name}.`)

    // Limpiar formulario
    newNotif.value = { title: '', message: '', type: 'General', related_group: null }

  } catch {
    pushAlert('error', 'Ocurrió un error al enviar la notificación. Intenta de nuevo.')
  } finally {
    isCreating.value = false
  }
}

function clearForm() {
  newNotif.value = { title: '', message: '', type: 'General', related_group: null }
}

// --- HELPERS ---
function getInitials() {
  const name = ua.credentials?.user.name?.charAt(0) ?? ''
  const last = ua.credentials?.user.lastname?.charAt(0) ?? ''
  return `${name}${last}`
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
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
              <h1>Centro de Avisos</h1>
              <p>Envía notificaciones a tus grupos de alumnos</p>
            </div>
          </div>
          <div class="badge-home">MAESTRO</div>
        </div>
      </div>

      <!-- ALERTAS -->
      <div class="alerts-container">
        <transition-group name="alert">
          <div
            v-for="(alert, i) in alerts"
            :key="i"
            class="alert"
            :class="alert.type === 'success' ? 'alert-success' : 'alert-error'"
          >
            <svg v-if="alert.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ alert.message }}</span>
          </div>
        </transition-group>
      </div>

      <!-- CONTENIDO PRINCIPAL -->
      <div class="content-grid">

        <!-- FORMULARIO -->
        <div class="form-card">
          <div class="form-card-header">
            <div class="form-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </div>
            <div>
              <h2>Nueva Notificación</h2>
              <p>Completa los campos y envía el aviso a tu grupo</p>
            </div>
          </div>

          <div class="form-body">
            <div class="form-group">
              <label>Asunto / Título <span class="required">*</span></label>
              <input
                v-model="newNotif.title"
                type="text"
                placeholder="Ej: Clase suspendida el lunes"
                :class="{ 'input-filled': newNotif.title }"
              />
            </div>

            <div class="form-group">
              <label>Mensaje <span class="required">*</span></label>
              <textarea
                v-model="newNotif.message"
                rows="5"
                placeholder="Escribe aquí los detalles que verán tus alumnos..."
                :class="{ 'input-filled': newNotif.message }"
              ></textarea>
              <span class="char-count">{{ newNotif.message.length }} caracteres</span>
            </div>

            <div class="form-group">
              <label>Grupo destinatario <span class="required">*</span></label>
              <select
                v-model="newNotif.related_group"
                :class="{ 'input-filled': newNotif.related_group }"
              >
                <option :value="null" disabled>Selecciona a quién va dirigido</option>
                <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-footer">
            <button class="btn-clear" @click="clearForm" :disabled="isCreating">
              Limpiar
            </button>
            <button class="btn-send" @click="submitCreate" :disabled="isCreating">
              <svg v-if="!isCreating" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              <div v-else class="btn-spinner"></div>
              {{ isCreating ? 'Enviando...' : 'Publicar Ahora' }}
            </button>
          </div>
        </div>

        <!-- HISTORIAL DE SESIÓN -->
        <div class="history-card">
          <div class="history-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <h3>Enviados esta sesión</h3>
            <span class="history-count">{{ sentHistory.length }}</span>
          </div>

          <div v-if="sentHistory.length" class="history-list">
            <div v-for="notif in sentHistory" :key="notif.id" class="history-item">
              <div class="history-dot"></div>
              <div class="history-body">
                <span class="history-title">{{ notif.title }}</span>
                <div class="history-meta">
                  <span class="history-group">{{ notif.groupName }}</span>
                  <span class="history-time">{{ formatTime(notif.sentAt) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="history-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.25">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            <p>Aún no has enviado<br>notificaciones hoy</p>
          </div>
        </div>

      </div>
    </SidebarLayout>
  </div>
</template>

<style scoped>
.bg-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-AzulDos, #1e3a8a) 0%, var(--color-ComplementoDos, #3b82f6) 100%);
  padding-bottom: 60px;
}

/* ── Header ── */
.header-box { padding: 40px 40px 25px; color: white; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.left-info { display: flex; align-items: center; gap: 20px; }
.avatar {
  width: 58px; height: 58px;
  background: white; color: var(--color-AzulDos, #1e3a8a);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1.2rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}
.header-box h1 { margin: 0; font-size: 1.9rem; font-weight: 800; letter-spacing: -0.5px; }
.header-box p  { margin: 4px 0 0; opacity: 0.85; font-size: 0.95rem; }

.badge-home {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 30px; padding: 6px 14px;
  font-weight: 700; font-size: 0.75rem; letter-spacing: 1px;
}

/* ── Alertas ── */
.alerts-container {
  position: fixed; top: 20px; right: 24px;
  z-index: 200;
  display: flex; flex-direction: column; gap: 10px;
  min-width: 300px; max-width: 400px;
}

.alert {
  display: flex; align-items: center; gap: 10px;
  padding: 13px 16px; border-radius: 14px;
  font-size: 0.85rem; font-weight: 600;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.alert-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.alert-error   { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

.alert-enter-active, .alert-leave-active { transition: all 0.3s ease; }
.alert-enter-from { opacity: 0; transform: translateX(30px); }
.alert-leave-to   { opacity: 0; transform: translateX(30px); }

/* ── Layout principal ── */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  padding: 0 40px;
  align-items: start;
}

/* ── Formulario ── */
.form-card {
  background: white; border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  overflow: hidden;
}

.form-card-header {
  display: flex; align-items: center; gap: 16px;
  padding: 24px 28px;
  border-bottom: 1px solid #f1f5f9;
}
.form-icon {
  width: 46px; height: 46px; flex-shrink: 0;
  background: #eff6ff; color: #2563eb;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
}
.form-card-header h2 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #1e293b; }
.form-card-header p  { margin: 3px 0 0; font-size: 0.82rem; color: #94a3b8; }

.form-body {
  padding: 28px;
  display: flex; flex-direction: column; gap: 20px;
}

.form-group { display: flex; flex-direction: column; gap: 7px; }
.form-group label { font-size: 0.82rem; font-weight: 700; color: #475569; }
.required { color: #ef4444; margin-left: 2px; }

.form-group input,
.form-group textarea,
.form-group select {
  border: 2px solid #f1f5f9; border-radius: 12px;
  padding: 12px 14px; font-size: 0.9rem; color: #334155;
  outline: none; transition: all 0.2s;
  font-family: inherit; resize: vertical;
  background: #fafafa;
}
.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus { border-color: #2563eb; background: white; }
.input-filled             { border-color: #bfdbfe !important; background: white !important; }

.char-count { font-size: 0.72rem; color: #94a3b8; text-align: right; }

.form-footer {
  display: flex; justify-content: flex-end; align-items: center; gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid #f1f5f9;
}

.btn-clear {
  background: none; border: 1px solid #e2e8f0;
  padding: 11px 20px; border-radius: 12px;
  font-size: 0.85rem; font-weight: 600; color: #94a3b8;
  cursor: pointer; transition: all 0.15s;
}
.btn-clear:hover:not(:disabled) { border-color: #cbd5e1; color: #64748b; }
.btn-clear:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-send {
  display: flex; align-items: center; gap: 8px;
  background: #2563eb; color: white;
  border: none; border-radius: 12px;
  padding: 11px 24px;
  font-size: 0.88rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(37,99,235,0.3);
}
.btn-send:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(37,99,235,0.4); }
.btn-send:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.btn-spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Historial de sesión ── */
.history-card {
  background: white; border-radius: 22px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  overflow: hidden;
}

.history-header {
  display: flex; align-items: center; gap: 8px;
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
  color: #64748b;
}
.history-header h3 { margin: 0; font-size: 0.88rem; font-weight: 700; color: #334155; flex: 1; }
.history-count {
  background: #eff6ff; color: #2563eb;
  font-size: 0.72rem; font-weight: 800;
  padding: 2px 8px; border-radius: 10px;
}

.history-list { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }

.history-item { display: flex; align-items: flex-start; gap: 12px; }

.history-dot {
  width: 8px; height: 8px; flex-shrink: 0;
  background: #10b981; border-radius: 50%;
  margin-top: 5px;
}

.history-body { flex: 1; min-width: 0; }
.history-title {
  display: block;
  font-size: 0.83rem; font-weight: 700; color: #334155;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.history-meta  { display: flex; align-items: center; gap: 6px; margin-top: 3px; }
.history-group {
  background: #eff6ff; color: #2563eb;
  font-size: 0.65rem; font-weight: 700;
  padding: 2px 7px; border-radius: 6px;
}
.history-time  { font-size: 0.7rem; color: #94a3b8; }

.history-empty {
  padding: 40px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  color: #94a3b8; font-size: 0.8rem; text-align: center; line-height: 1.6;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; padding: 0 20px; }
  .header-box   { padding: 30px 20px 20px; }
  .header-content { flex-direction: column; align-items: flex-start; gap: 14px; }
  .alerts-container { right: 12px; left: 12px; min-width: unset; }
}
</style>