<script setup lang="ts"></script>
<template>
  <div class="center">
    <div class="contain shadow">
      <slot></slot>
    </div>
  </div>
</template>

<style>
.contain {
  /*background: var(--color-Contenedor);*/
  width: 95%;
  max-width: 1400px;
  min-height: 690px;
  height: auto;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.shadow {
  box-shadow: 0 0 30px #01a2ff80;
}

@media (max-width: 768px) {
  .contain {
    min-height: 400px;
    margin-top: 10px;
  }
}
</style>
