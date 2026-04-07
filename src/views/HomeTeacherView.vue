
<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'


const ua = useAuthStore()
import { useAuthStore } from '@/stores/authStore.ts'

</script>

<template>

<div class ="bg-page">


<SidebarLayout>
  <div class="contenido">

      <div class="header-box header-flex">
        <div class="left">
          <div class="avatar">
            {{ ua.credentials?.user.name.charAt(0) }}{{ ua.credentials?.user.lastname.charAt(0) }}
          </div>
          <h1>Bienvenido, {{ ua.credentials?.user.name }}</h1>


        </div>

          
       </div> 

    <div class="ContBig">
      <div class="ContTittle center">
        <h3>Horario de clases</h3>
      </div>

    </div>   
      
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
  background: linear-gradient(180deg,var(--color-AzulDos),var(--color-ComplementoDos));
  z-index: -1;
}

.ContTittle {
  background: var(--color-Azul);
  width: 100%;
  max-width: 400px;
  height: 20px;
  border-radius: 10px;
  color: white;
  text-align: center;   
  margin: 2px auto;   
}
.ContSmall {
  background: var(--color-Azul);
  width: 100%;
  min-height: 30px;
  border-radius: 20px;
  margin: 20px 0;
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
  width: 100%;
  min-height: 420px;
  border-radius: 20px;
  margin: 0;
  padding: 30px;
  box-shadow: 0 10px 30px #00000030;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e1f5ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #0f6e56;
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

@media (max-width: 768px) {
  .ContSmall,
  .ContBig {
    margin: 15px;
    padding: 15px;
  }
}


</style>
