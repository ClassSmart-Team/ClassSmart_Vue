<script setup lang="ts">
import SidebarLayout from '@/components/ParentSidebar.vue'
import ScheduleTable from '@/components/ScheduleTable.vue'
import { computed, ref, watch, onMounted } from 'vue'
import { requestForToken } from '@/services/notificationService'
import { useapi } from '@/assets/composables/useApi.ts'
import { useAuthStore } from '@/stores/authStore.ts'

//PARA NOTIFICACIONES PUSH Y EMAIL
onMounted(async () => {
  // Solo pide el token si el usuario está autenticado y el navegador lo soporta
  if (ua.credentials && 'Notification' in window) {
    await requestForToken()
  }
})

const ua = useAuthStore()

const {
  data: childrenData,
  isFetching: loadingChildren,
  error,
} = useapi('/my-children').get().json()

const selectedChildId = ref<number | null>(null)

const children = computed(() => childrenData.value?.data || [])

watch(children, (newChildren) => {
  if (newChildren.length > 0 && !selectedChildId.value) {
    selectedChildId.value = newChildren[0].id
  }
})
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <div class="header-box header-flex">
        <div class="left">
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <h1>Bienvenido, {{ ua.credentials?.user.name }}</h1>
        </div>
      </div>

      <div class="main-box" style="margin-top: 10px">
        <div v-if="loadingChildren" class="loading-state">
          <div class="spinner"></div>
          <p class="state-msg">Buscando datos de alumnos...</p>
        </div>

        <div v-if="error" class="error-banner">
          <div class="icon-circle">
            <img src="@/components/advertencia-triangulo.png" alt="advertencia" />
          </div>
          <p class="state-msg">No se pudo cargar la información de los hijos.</p>
          <span class="state-subtitle">Intenta recargar la página en unos momentos.</span>
        </div>

        <template v-else>
          <template v-if="children.length > 0">
            <div class="child-selector">
              <label for="child-select">Ver horario de: </label>
              <select id="child-select" v-model="selectedChildId">
                <option v-for="child in children" :key="child.id" :value="child.id">
                  {{ child.name }}
                </option>
              </select>
            </div>

            <div class="ContTittle center">
              <h3>
                Horario de clases
                {{
                  children.length > 0
                    ? ` - ${children.find((c: any) => c.id === selectedChildId)?.name}`
                    : ''
                }}
              </h3>
            </div>

            <div class="table-wrapper">
              <ScheduleTable
                v-if="selectedChildId"
                :childId="selectedChildId"
                :key="selectedChildId"
              />
            </div>
          </template>
        </template>
      </div>
    </SidebarLayout>
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

.no-children-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
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

.ContTittle {
  background: var(--color-Azul);
  width: 95%;
  max-width: 1000px;
  height: 20px;
  border-radius: 10px;
  color: white;
  text-align: center;
  margin: 20px auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --- DISEÑO DEL SELECT (MODERNO) --- */
.child-selector {
  margin-bottom: 25px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.child-selector label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.child-selector select {
  background: var(--color-Blanco);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23005499'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='C19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 15px;
  padding: 8px 35px 8px 15px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  color: var(--color-Azul);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  min-width: 180px;
}

.child-selector select:hover {
  border-color: var(--color-Azul);
  background-color: var(--color-Blanco);
}

/* --- SCROLL DE LA TABLA --- */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.table-wrapper::-webkit-scrollbar {
  display: none;
}

.state-container {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-Blanco);
  width: 95%;
  max-width: 1000px;
  margin: 40px auto;
  border-radius: 20px;
}

.state-msg {
  font-size: 1.1rem;
  font-weight: 600;
  color: #555;
  margin-top: 15px;
}

.state-subtitle {
  font-size: 0.9rem;
  color: #999;
  margin-top: 5px;
}

/* Loader */
.loader-dots {
  width: 50px;
  aspect-ratio: 2;
  --_g: no-repeat radial-gradient(circle closest-side, var(--color-Texto) 90%, #0000);
  background:
    var(--_g) 0% 50%,
    var(--_g) 50% 50%,
    var(--_g) 100% 50%;
  background-size: calc(100% / 3) 50%;
  animation: l3 1s infinite linear;
  opacity: 0.3;
}
@keyframes l3 {
  20% {
    background-position:
      0% 0%,
      50% 50%,
      100% 50%;
  }
  40% {
    background-position:
      0% 100%,
      50% 0%,
      100% 50%;
  }
  60% {
    background-position:
      0% 50%,
      50% 100%,
      100% 0%;
  }
  80% {
    background-position:
      0% 50%,
      50% 50%,
      100% 100%;
  }
}

/* Error */
.icon-circle {
  width: 70px;
  height: 70px;
  background: var(--color-Error);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 10px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.no-children-container h3 {
  color: var(--color-Azul);
  margin-bottom: 10px;
}

.info-box-mini {
  margin-top: 30px;
  background: var(--color-Aviso);
  padding: 15px;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #666;
  max-width: 400px;
}

/* Ajuste para que el ContBig no se vea vacío si no hay hijos */
.ContBig {
  /* ... tus otros estilos ... */
  display: flex;
  flex-direction: column;
}

.no-children-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}
</style>
