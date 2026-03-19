<template>
  <div class="center">
    <div class="contain shadow">
      <slot></slot>
    </div>
  </div>
</template>

<style>

.contain {
  background: var(--color-BlancoBg);
  width: 1400px;
  height:690px;
  border-radius: 10px;
}

.shadow {
  box-shadow: 0px 0px 30px #01a2ff80;
}
</style>