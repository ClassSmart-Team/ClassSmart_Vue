<script setup lang="ts">
import { useModalStore } from '@/stores/modalStore'
const store = useModalStore()
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isOpen" class="modal-overlay" @click.self="store.close">
      <div class="modal-card" :class="store.type">
        <div class="icon-circle">
          <span v-if="store.type === 'success'"> ✓</span>
          <span v-else-if="store.type === 'error'">X</span>
          <span v-else>!</span>
        </div>
        <h3>{{ store.message }}</h3>
        <button @click="store.close" class="btn-confirm">Entendido</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}
.modal-card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 24px;
}
.success .icon-circle {
  background: #dcfce7;
  color: #16a34a;
}
.error .icon-circle {
  background: #fee2e2;
  color: #dc2626;
}

.btn-confirm {
  margin-top: 20px;
  padding: 10px 25px;
  border: none;
  background: var(--color-Azul);
  color: white;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
}

/* Animación */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
