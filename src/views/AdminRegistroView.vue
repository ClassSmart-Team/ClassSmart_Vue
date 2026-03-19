<template>
  <div class="form-container">
    <h1>ADMIN -Crear nueva cuenta</h1>

    <form class="form-grid">
      
        <label>Nombre</label>
        <input type="text" placeholder="Nombre" />

        <label>Apellido</label>
        <input type="text" placeholder="Apellido" />

        <label>Correo electrónico</label>
        <input type="email" placeholder="correo@example.com" />

        <label>Teléfono (opcional)</label>
        <input type="text" placeholder="Teléfono (opcional)" />

        <label>Contraseña</label>
        <input type="password" placeholder="**" />

        <label>Confirmar contraseña</label>
        <input type="password" placeholder="**" />

        <label>Rol</label>
        <select>
          <option disabled selected>Seleccione un rol</option>
          <option>Admin</option>
          <option>Profesor</option>
          <option>Alumno</option>
          <option>Padre</option>
        </select>

    </form>

    <button class="btn-submit">Confirmar Registro</button>
  </div>
</template>



<style scoped>

.form-container {
  background: var(--color-BlancoBg);
  padding: 50px;
  border-radius: 15px;
  width: 50%;
  margin: auto;
  text-align: center;
}

h1 {
  color: var(--color-AzulF);
  margin-bottom: 30px;
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
  background: var(--color-Azul);
  color: #343a55;
  outline: none;
}

/* Placeholder blanco */
input::placeholder {
  color: #343a55;
}

/* Botón */
.btn-submit {
  margin-top: 40px;
  padding: 15px 40px;
  border: none;
  border-radius: 10px;
  background: var(--color-AzulFuerte);
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.btn-submit:hover {
  background: var(--color-OscuroAzulado);
}


</style>