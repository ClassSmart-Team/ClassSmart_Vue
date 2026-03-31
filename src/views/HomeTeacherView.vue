
<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'

</script>

<template>

<div class ="bg-page">


<SidebarLayout>
  <div class="contenido">

    <div class="ContSmall center">
      <h1>Pagina Home</h1>
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

.CenterItems {
  display: flex;
  justify-content: center;
  align-items: center;
}

.bg-page {
  position: fixed;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: linear-gradient(180deg,var(--color-OscuroAzulado),var(--color-OscuroDos));
  z-index: -1;
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
</style>
