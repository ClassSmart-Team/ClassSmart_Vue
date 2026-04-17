<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import SidebarLayout from '@/components/ParentSidebar.vue'
import { useapi } from '@/assets/composables/useApi'
import { useAuthStore } from '@/stores/authStore.ts'
import { messaging } from '@/firebaseConfig'
import { getToken } from 'firebase/messaging'
import { useModalStore } from '@/stores/modalStore.ts'

const ua = useAuthStore()
const ns = useModalStore()

// Estado de la configuración
const config = ref({
  email_notification: true,
  push_notification: true,
  theme: 'light',

  //subopciones
  email_feedback: true,
  email_grades: true,
  email_new_assignments: true,
  email_submissions: true,
  email_announcements: true,
  email_grade_records: true,

  push_feedback: true,
  push_grades: true,
  push_new_assignments: true,
  push_submissions: true,
  push_announcements: true,
  push_grade_records: true,
})

// Para detectar si hubo cambios reales
const originalConfig = ref('')

const saving = ref(false)
const loading = ref(true)

// Computado para habilitar/deshabilitar botón de guardado
const hasChanges = computed(() => {
  return originalConfig.value !== JSON.stringify(config.value)
})

// Lógica de Master Switch: Email
watch(
  () => config.value.email_notification,
  (val) => {
    const keys = [
      'email_feedback',
      'email_grades',
      'email_new_assignments',
      'email_submissions',
      'email_announcements',
      'email_grade_records',
    ]
    keys.forEach((k) => (config.value[k] = val))
  },
)

// Lógica de Master Switch: Push
watch(
  () => config.value.push_notification,
  (val) => {
    const keys = [
      'push_feedback',
      'push_grades',
      'push_new_assignments',
      'push_submissions',
      'push_announcements',
      'push_grade_records',
    ]
    keys.forEach((k) => (config.value[k] = val))
  },
)

const fetchSettings = async () => {
  loading.value = true
  try {
    const { data, error } = await useapi('/configurations').get().json()
    if (!error.value && data.value?.data) {
      config.value = { ...data.value.data }
      originalConfig.value = JSON.stringify(data.value.data)
      applyTheme(config.value.theme)
    }
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  if (!hasChanges.value) return
  saving.value = true
  try {
    const { error } = await useapi('/configurations').patch(config.value).json()
    if (!error.value) {
      originalConfig.value = JSON.stringify(config.value)
      ns.notify( 'Configuración actualizada con éxito', 'success')
    }
  } finally {
    saving.value = false
  }
}

const applyTheme = (theme: string) => {
  theme === 'dark'
    ? document.documentElement.classList.add('dark-mode')
    : document.documentElement.classList.remove('dark-mode')
  localStorage.setItem('theme', theme)
}
watch(
  () => config.value.theme,
  (t) => applyTheme(t),
)

onMounted(fetchSettings)

// Observar cuando se activa el switch global de Push
watch(
  () => config.value.push_notification,
  async (newVal) => {
    if (newVal) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey:
            'BJkmDK1oGI-rcVM1Y5GHXtpAwNE7TW4k0KSK62aSWFhoCyiGN-pk3TanfursphCGo537ClBo6-4fl6l_ifghNcU',
        })
        if (token) {
          // Guardamos el token en el servidor para que Laravel sepa a dónde enviar
          await useapi('/save-fcm-token').post({ token }).json()
        }
      }
    }
  },
)
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <div class="ContSmall">
        <div class="left">
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <div>
            <h1>Configuración</h1>
          </div>
        </div>
        <div class="right">
          <span class="welcome-text">{{ ua.credentials?.user.name }}</span>
        </div>
      </div>

      <div class="main-box" style="margin-top: 30px">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando tus preferencias...</p>
        </div>

        <div v-else class="settings-grid">
          <section class="settings-section">
            <div class="section-header">
              <div>
                <h3>Notificaciones</h3>
                <p>Gestiona cómo ClassSmart te mantiene informado desde tu bandeja de entrada.</p>
              </div>
            </div>

            <div class="setting-card">
              <div class="setting-item master">
                <div class="setting-info">
                  <label>Notificaciones por email</label>
                  <span>Control general de todas las notificaciones vía email.</span>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="config.email_notification" />
                  <span class="slider"></span>
                </label>
              </div>

              <div
                class="sub-options-container"
                :class="{ 'is-disabled': !config.email_notification }"
              >
                <div class="sub-item-row">
                  <label>Nuevas tareas asignadas</label>
                  <label class="switch mini">
                    <input
                      type="checkbox"
                      v-model="config.email_new_assignments"
                      :disabled="!config.email_notification"
                    />
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="sub-item-row">
                  <label>Entregas de tareas asignadas</label>
                  <label class="switch mini">
                    <input
                      type="checkbox"
                      v-model="config.email_submissions"
                      :disabled="!config.email_notification"
                    />
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="sub-item-row">
                  <label>Calificaciones de tareas entregadas</label>
                  <label class="switch mini">
                    <input
                      type="checkbox"
                      v-model="config.email_grades"
                      :disabled="!config.email_notification"
                    />
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="sub-item-row">
                  <label>Retroalimentación de tareas</label>
                  <label class="switch mini">
                    <input
                      type="checkbox"
                      v-model="config.email_feedback"
                      :disabled="!config.email_notification"
                    />
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="sub-item-row">
                  <label>Anuncios generales</label>
                  <label class="switch mini">
                    <input
                      type="checkbox"
                      v-model="config.email_announcements"
                      :disabled="!config.email_notification"
                    />
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="sub-item-row">
                  <label>Boletas de calificaciones</label>
                  <label class="switch mini">
                    <input
                      type="checkbox"
                      v-model="config.email_grade_records"
                      :disabled="!config.email_notification"
                    />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="setting-card">
              <div class="setting-item master">
                <div class="setting-info">
                  <label>Notificaciones Push</label>
                  <span>Alertas en tiempo real en navegador o dispositivo.</span>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="config.push_notification" />
                  <span class="slider"></span>
                </label>
              </div>

              <div
                class="sub-options-container"
                :class="{ 'is-disabled': !config.push_notification }"
              >
                <div class="sub-item-row">
                  <label>Nuevas tareas asignadas</label>
                  <label class="switch mini">
                    <input
                      type="checkbox"
                      v-model="config.push_new_assignments"
                      :disabled="!config.push_notification"
                    />
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="sub-item-row">
                  <label>Entregas de tareas asignadas</label>
                  <label class="switch mini">
                    <input
                      type="checkbox"
                      v-model="config.push_submissions"
                      :disabled="!config.push_notification"
                    />
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="sub-item-row">
                  <label>Calificaciones de tareas entregadas</label>
                  <label class="switch mini">
                    <input
                      type="checkbox"
                      v-model="config.push_grades"
                      :disabled="!config.push_notification"
                    />
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="sub-item-row">
                  <label>Retroalimentación de tareas</label>
                  <label class="switch mini">
                    <input
                      type="checkbox"
                      v-model="config.push_feedback"
                      :disabled="!config.push_notification"
                    />
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="sub-item-row">
                  <label>Anuncios generales</label>
                  <label class="switch mini">
                    <input
                      type="checkbox"
                      v-model="config.push_announcements"
                      :disabled="!config.push_notification"
                    />
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="sub-item-row">
                  <label>Boletas de calificaciones</label>
                  <label class="switch mini">
                    <input
                      type="checkbox"
                      v-model="config.push_grade_records"
                      :disabled="!config.push_notification"
                    />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section class="settings-section">
            <div class="section-header">
              <div>
                <h3>Apariencia</h3>
                <p>Personaliza tu experiencia visual.</p>
              </div>
            </div>

            <div class="setting-card">
              <div class="setting-item">
                <div class="setting-info">
                  <label>Tema de la Interfaz</label>
                  <span>Cambia entre modo claro y oscuro.</span>
                </div>

                <div class="child-selector">
                  <select id="child-select" v-model="config.theme">
                    <option value="light">Modo Claro</option>
                    <option value="dark">Modo Oscuro</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <div class="form-actions">
            <p v-if="hasChanges" class="unsaved-hint">Tienes cambios sin guardar</p>
            <button
              class="btn-save"
              :class="{ active: hasChanges }"
              :disabled="!hasChanges || saving"
              @click="saveSettings"
            >
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  </div>
</template>

<style>
body {
  background-color: var(--color-Fondo);
  color: var(--color-Texto);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
</style>

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
  width: 1000px;
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

.section-header {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.section-header .icon {
  font-size: 1.5rem;
  background: #f0f7ff;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.section-header h3 {
  margin: 0;
  color: var(--color-Azul);
  font-size: 1.2rem;
}

.section-header p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.setting-card {
  background: var(--color-Fondos);
  border: 1px solid var(--color-Bordes);
  border-radius: 18px;
  padding: 10px 25px;
  margin-bottom: 40px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 5px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info label {
  display: block;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-Texto);
}

.setting-info span {
  font-size: 0.8rem;
  color: #94a3b8;
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.unsaved-hint {
  font-size: 0.8rem;
  color: #f59e0b;
  font-weight: 600;
}

.btn-save {
  padding: 14px 40px;
  border-radius: 14px;
  border: none;
  background: #e2e8f0;
  color: #94a3b8;
  font-weight: 800;
  cursor: not-allowed;
  transition: all 0.3s;
}

.btn-save.active {
  background: var(--color-Azul);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.2);
}

.btn-save.active:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* Switch Styles */
.switch {
  position: relative;
  width: 48px;
  height: 26px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #cbd5e1;
  transition: 0.4s;
  border-radius: 34px;
}
.slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background: white;
  transition: 0.4s;
  border-radius: 50%;
}
input:checked + .slider {
  background: var(--color-Azul);
}
input:checked + .slider:before {
  transform: translateX(22px);
}

/*SUBOPCIONES*/
.sub-options-container {
  padding: 0 10px 15px 45px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: opacity 0.3s ease;
}

.sub-options-container.is-disabled {
  opacity: 0.3;
  pointer-events: none;
}

.sub-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub-item-row label {
  font-size: 0.9rem;
  color: #475569;
  font-weight: 500;
}

/* Estilos de Switch (Normal y Mini) */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch.mini {
  width: 38px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #cbd5e1;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

/* Ajustes para el mini slider */
.switch.mini .slider:before {
  height: 14px;
  width: 14px;
}

input:checked + .slider {
  background-color: var(--color-Azul);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.switch.mini input:checked + .slider:before {
  transform: translateX(18px);
}

/*SELECT*/
.child-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  margin-top: 10px;
}

.child-selector select {
  background-color: var(--color-Blanco);
  padding: 8px 15px;
  border-radius: 10px;
  border: 1px solid var(--color-Bordes);
  color: var(--color-Azul);
  font-weight: 600;
  cursor: pointer;
  outline: none;
  min-width: 200px;
}
</style>
