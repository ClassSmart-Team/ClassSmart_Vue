<script setup lang="ts">
import SidebarLayout from '@/components/TeacherSidebar.vue'
</script>

<template>

<div class ="bg-page">


<SidebarLayout>

  <div class="ContSmall center">
    <h1>Pagina Home</h1>
  </div>  

  <div class="ContBig CenterItems" style="margin-top: 10px">

    <div class="ContTittle CenterItems"  style="margin-top: 10px">

    </div>
    
  </div>   

</SidebarLayout>

</div>

</template>

<style scoped>

.CenterItems {
  align-items: center;
  padding-left: 50px;
}


.bg-page {
  position: fixed;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: linear-gradient(180deg,var(--color-OscuroAzulado),var(--color-OscuroDos));
  z-index: -1;
}

.ContTittle{
  background: var(--color-Azul);
  width: 900px;
  height:40px;
  border-radius: 10px;
}


.ContSmall{
  background: var(--color-Azul);
  width: 1000px;
  height:40px;
  border-radius: 10px;
}

.ContBig{
  background: var(--color-Blanco);
  width: 1000px;
  height:550px;
  border-radius: 10px;
}


</style>
