const cargarUsuarios = async () => {
    const res = await fetch('/api/usuarios');
    const usuarios = await res.json();
  
    const tabla = document.getElementById('tabla-usuarios');
    tabla.innerHTML = '';
  
    usuarios.forEach(u => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${u.id}</td>
        <td>${u.nombre}</td>
        <td>${u.email}</td>
        <td>${u.rol}</td>
      `;
      tabla.appendChild(fila);
    });
  };
  
  const modal = document.getElementById('modal-usuario');
  const abrir = document.getElementById('btn-nuevo-usuario');
  const cerrar = document.getElementById('cerrar-modal-usuario');
  const form = document.getElementById('form-usuario');
  
  abrir.addEventListener('click', () => {
    modal.classList.remove('oculto');
    modal.style.display = 'flex';
  });
  
  cerrar.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = {
      nombre: document.getElementById('nombre').value,
      email: document.getElementById('email').value,
      contraseña: document.getElementById('contraseña').value,
      rol: document.getElementById('rol').value,
    };
  
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
  
    if (res.ok) {
      modal.style.display = 'none';
      form.reset();
      cargarUsuarios();
    } else {
      alert('Error al crear usuario');
    }
  });
  
  cargarUsuarios();
  