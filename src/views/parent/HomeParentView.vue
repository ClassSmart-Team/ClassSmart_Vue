<script setup lang="ts">
import SidebarLayout from '@/components/ParentSidebar.vue'
import ScheduleTable from '@/components/ScheduleTable.vue'
</script>

<template>
  <SidebarLayout>
    <div class="ContSmall center">
      <h1>Horario Escolar</h1>
    </div>

    <div class="ContBig" style="margin-top: 40px">
      <div class="table-wrapper">
        <ScheduleTable />
      </div>
    </div>
  </SidebarLayout>
</template>

<style scoped>
.ContSmall {
  background: var(--color-Azul);
  width: 95%;
  max-width: 1000px;
  height: 60px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto;
}

.ContBig {
  background: var(--color-Blanco);
  width: 95%;
  max-width: 1000px;
  min-height: 500px;
  border-radius: 20px;
  margin: 40px auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  box-sizing: border-box;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

h1 {
  font-size: 1.5rem;
  margin: 0;
  text-align: center;
}

@media (max-width: 768px) {
  .ContSmall {
    height: auto;
    padding: 15px;
    border-radius: 15px;
  }

  h1 {
    font-size: 1.2rem;
  }

  .ContBig {
    margin-top: 20px;
    padding: 10px;
    border-radius: 15px;
  }
}
</style>
