<script setup lang="ts">
import NotificationModal from '@/components/NotificationModal.vue'
import ModalGlobal from '@/components/ModalGlobal.vue'
</script>

<template class="min-h-screen">
  <RouterView />
  <NotificationModal />
  <ModalGlobal />
</template>

<style scoped></style>
