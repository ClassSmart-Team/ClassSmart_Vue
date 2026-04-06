<script setup lang="ts">
import Contenedor from '@/components/Contenedor.vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
const use = useAuthStore();
const router = useRouter();

const logout = () => {
  use.logout();
  router.push('/login');
};
</script>

<template>
    <Contenedor>
        
    </Contenedor>
</template>

<style scoped>
</style>