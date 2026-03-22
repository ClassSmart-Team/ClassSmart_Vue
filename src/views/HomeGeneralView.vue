<script setup lang="ts">
import { ref } from "vue"
import Contenedor from '@/components/Contenedor.vue'

const currentView = ref("home")
</script>

<template>

  <Contenedor>

<div>
    <aside class="sidebar">
      <nav class="columna">

        <a class="link" @click="currentView = 'home'">Home</a>
        <a class="link" @click="currentView = 'perfil'">Perfil</a>
        <a class="link" @click="currentView = 'grupos'">Grupos</a>
        <a class="link" @click="currentView = 'tareas'">Tareas</a>
        <a class="link" @click="currentView = 'Foro'">Foro</a>
        <a class="link" @click="currentView = 'Mensajes'">Mensajes</a>
        <a class="link" @click="currentView = 'Notificaciones'">Notificaciones</a>
        <a class="link" @click="currentView = 'Configuracion'">Configuracion</a>

      </nav>
    </aside>

    <div class="contenido">

 
      <template v-if="currentView === 'home'">
        <div class="center">
          <div class="ContSmall center">
            <h1>Pagina Home</h1>
          </div>
        </div>

        <div class="center" style="padding-top: 80px">
          <div class="ContBig center">
            <h2>Contenido de la pagina home</h2>
          </div>
        </div>
      </template>

      <template v-if="currentView === 'perfil'">
        <h1 style="color:white">Perfil</h1>
      </template>

      <template v-if="currentView === 'grupos'">
        <h1 style="color:white">Grupos</h1>
      </template>

      <template v-if="currentView === 'tareas'">
        <h1 style="color:white">Tareas</h1>
      </template>

    </div>

  </div>

</Contenedor>

</template>

<style scoped>
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