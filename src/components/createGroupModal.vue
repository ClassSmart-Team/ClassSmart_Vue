<!-- src/components/Modal.vue -->
<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const closeModal = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <div v-if="modelValue" class="modal-overlay" @click="closeModal">
    <div class="modal-box" @click.stop>
      <!-- HEADER -->
      <div class="modal-header">
        <slot name="header"></slot>
        <button class="close-btn" @click="closeModal">✖</button>
      </div>

      <!-- BODY -->
      <div class="modal-body">
        <slot></slot>
      </div>

      <!-- FOOTER -->
      <div class="modal-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-box {
  background: white;
  width: 520px;
  max-width: 95%;
  padding: 20px;
  border-radius: 18px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35);
  animation: pop 0.2s ease;
}

@keyframes pop {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #111827;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  font-weight: bold;
  color: #111827;
}

.modal-body {
  margin-bottom: 15px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
