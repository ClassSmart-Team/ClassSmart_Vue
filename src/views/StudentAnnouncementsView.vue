<script setup lang="ts">
import { useapi } from '@/assets/composables/useApi'
const { data } = useapi('/announcements', {
  method: 'GET',
}).json()
</script>

<template>
  <h1>{{ data.data }}</h1>
</template>

<style scoped></style>
