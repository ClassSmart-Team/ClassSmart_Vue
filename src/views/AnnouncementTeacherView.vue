<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
</script>

<template>
<div class ="bg-page">
  <SidebarLayout>
    <div class="header-box header-flex">
      <h1>Pagina Anuncios</h1>
    </div>  
    <div class="main-box">
      <h3>Contenido de la pagina </h3>
    </div>
  </SidebarLayout>
</div>

</template>

<style scoped>

.CenterItems {
  align-items: center;
  padding-left: 50px;
}




.ContSmall{
  background: var(--color-Azul);
  width: 1000px;
  height:60px;
  border-radius: 20px;
}

.ContBig{
  background: var(--color-Blanco);
  width: 800px;
  height:400px;
  border-radius: 20px;
}


</style>
