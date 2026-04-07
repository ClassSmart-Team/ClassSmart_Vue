
<script setup lang="ts">
import SidebarLayout from '@/components/StudentSideBar.vue'


const ua = useAuthStore()
import { useAuthStore } from '@/stores/authStore.ts'

</script>

<template>
<div class ="bg-page">
  <SidebarLayout>
    <div class="header-box header-flex">
      <div class="left">
        <div class="avatar">
          {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
        </div>
        <h1>Bienvenido, {{ ua.credentials?.user.name }}</h1>
      </div>
      <div class="main-box">
        <div class="ContTittle center">
          <h3>HOME VIEW</h3>
        </div>
      </div>   
    </div>
  </SidebarLayout>
</div>
</template>

<style scoped>
.CenterItems {
  display: flex;
  justify-content: center;
  align-items: center;
}


.ContTittle {
  background: var(--color-Azul);
  width: 400px;
  height: 20px;
  border-radius: 10px;
  color: white;
  text-align: center;   
  margin: 2px auto;   
}
.ContSmall {
  background: var(--color-Azul);
  width: 1000px;
  min-height: 30px;
  border-radius: 20px;
  margin: 30px auto 0 auto;
  padding: 15px;
  color: white;
}

.ContSmall h1 {
  margin: 0;
  font-size: 1.5rem;
}

.ContSmall p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.ContBig {
  background: var(--color-Blanco);
  width: 1000px;
  min-height: 420px;
  border-radius: 20px;
  margin: 20px auto;
  padding: 30px;
  box-shadow: 0 10px 30px #00000030;
}


.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.right {
  display: flex;
  align-items: center;
}




</style>
