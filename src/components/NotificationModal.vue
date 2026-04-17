<script setup lang="ts">
import { useNotificationStore } from '@/stores/notificationStore'
import { useRouter } from 'vue-router'

const store = useNotificationStore()
const router = useRouter()

const goToUrl = () => {
  store.showModal = false
  router.push(store.url)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="store.showModal" class="custom-modal-overlay">
      <div class="custom-modal-container">
        <div class="custom-modal-header">
          <div class="icon-circle">
            <img src="/Logo.svg" alt="Logo" class="modal-logo" />
          </div>
          <h3 class="modal-title">{{ store.title }}</h3>
        </div>

        <div class="custom-modal-body">
          <p>{{ store.body }}</p>
        </div>

        <div class="custom-modal-footer">
          <button @click="store.showModal = false" class="btn-secondary">Cerrar</button>
          <button @click="goToUrl" class="btn-primary">Ver detalles</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Contenedor que cubre toda la pantalla */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px); /* Efecto borroso de fondo */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999; /* Por encima de todo */
}

/* Caja del modal */
.custom-modal-container {
  background: white;
  width: 90%;
  max-width: 400px;
  border-radius: 16px;
  padding: 24px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.custom-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.icon-circle {
  background-color: #eff6ff;
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-logo {
  width: 24px;
  height: 24px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.custom-modal-body {
  color: #64748b;
  line-height: 1.6;
  font-size: 1rem;
  margin-bottom: 24px;
}

.custom-modal-footer {
  display: flex;
  gap: 12px;
}

/* Botones */
button {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}
</style>
