<template>

<div class="bg-page center">
  <div class="form-container">
    <h1>Crear Cuenta</h1>

    <form class="form-grid">
      
        <label>Nombre</label>
        <input type="text" placeholder="Nombre" />

        <label>Apellido</label>
        <input type="text" placeholder="Apellido" />

        <label>Correo electrónico</label>
        <input type="email" placeholder="correo@example.com" />

        <label>Teléfono (opcional)</label>
        <input type="text" placeholder="Teléfono" />

        <label>Contraseña</label>
        <input type="password" placeholder="**" />

        <label>Confirmar contraseña</label>
        <input type="password" placeholder="**" />

    </form>

    <button class="btn-submit">Confirmar Registro</button>
  </div>

  </div>
</template>



<style scoped>

.bg-page {
  position: fixed;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: linear-gradient(180deg,var(--color-Azul),var(--color-AzulTres));
  z-index: -1;
}

.form-container {
  background: var(--color-Contenedor);
  padding: 50px;
  border-radius: 15px;
  width: 45%;
  height: 85%;
  margin: auto;
  text-align: center;
  box-shadow: 0px 0px 30px #01a2ff80
}

h1 {
  color: var(--color-Titulos);
  background-color: var(--color-AzulDos);
  border-radius: 40px;
}
h2 {
  color: var(--color-Texto);
}

.form-grid {
  display: columns;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  text-align: left;
}

label {
  display: block;
  margin-top: 15px;
  margin-bottom: 5px;
  color: var(--color-Texto);
  font-weight: bold;
}

input, select {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: var(--color-ContenedorClaro);
  color: #343a55;
  outline: none;
}

input::placeholder {
  color: #343a55;
}

.btn-submit {
  margin-top: 40px;
  padding: 15px 40px;
  border: none;
  border-radius: 10px;
  background: var(--color-AzulTres);
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.btn-submit:hover {
  background: var(--color-OscuroAzulado);
}


</style>