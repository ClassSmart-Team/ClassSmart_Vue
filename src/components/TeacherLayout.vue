<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
</script>

<template>
  <div class="bg-page">
    <SidebarLayout>
      <div class="contenido">
        <slot />
      </div>
    </SidebarLayout>
  </div>
</template>