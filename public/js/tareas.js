window.inicializarModuloTareas = () => {
  console.log('🧩 Inicializando módulo de tareas');

  let modoEdicion = false;
  let idEdicion = null;
  let paginaActual = 1;
  const tareasPorPagina = 20;
  let idParaBorrar = null;

  // Elementos del DOM
  const form = document.getElementById('form-tarea');
  const tabla = document.querySelector('#tabla-tareas tbody');
  const modal = document.getElementById('modal');
  const btnNuevaTarea = document.getElementById('btn-nueva-tarea');
  const cerrarModal = document.getElementById('cerrar-modal');
  const tituloInput = document.getElementById('titulo');
  const descripcionInput = document.getElementById('descripcion');
  const filtroSelect = document.getElementById('filtro');
  const busquedaInput = document.getElementById('busqueda');
  const contador = document.getElementById('contador');
  const paginacion = document.getElementById('paginacion');
  const modalTitulo = document.getElementById('modal-titulo');
  const modalConfirmar = document.getElementById('modal-confirmar');
  const confirmarBorradoBtn = document.getElementById('confirmar-borrado');
  const cancelarBorradoBtn = document.getElementById('cancelar-borrado');

  const abrirModal = (modo, tarea = null) => {
    modal.classList.remove('oculto');
    modal.style.display = 'flex';
    if (modo === 'editar') {
      modoEdicion = true;
      idEdicion = tarea.id;
      tituloInput.value = tarea.titulo;
      descripcionInput.value = tarea.descripcion;
      modalTitulo.textContent = 'Editar Tarea';
    } else {
      modoEdicion = false;
      idEdicion = null;
      form.reset();
      modalTitulo.textContent = 'Nueva Tarea';
    }
  };

  const cerrarElModal = () => {
    modal.style.display = 'none';
  };

  cerrarModal.addEventListener('click', cerrarElModal);
  btnNuevaTarea.addEventListener('click', () => abrirModal('crear'));

  // Cerrar modal si se hace clic fuera
  window.addEventListener('click', (e) => {
    if (e.target === modal) cerrarElModal();
    if (e.target === modalConfirmar) modalConfirmar.style.display = 'none';
  });

  const cargarTareas = async () => {
    const res = await fetch('/api/tareas');
    const tareas = await res.json();

    const filtro = filtroSelect.value;
    const textoBusqueda = busquedaInput.value.toLowerCase();

    localStorage.setItem('filtro_tareas', filtro);
    localStorage.setItem('busqueda_tareas', textoBusqueda);    

    const tareasFiltradas = tareas.filter(t => {
      const coincideBusqueda =
        t.titulo.toLowerCase().includes(textoBusqueda) ||
        t.descripcion.toLowerCase().includes(textoBusqueda);

      if (filtro === 'completadas' && !t.completado) return false;
      if (filtro === 'pendientes' && t.completado) return false;

      return coincideBusqueda;
    });

    const totalTareas = tareasFiltradas.length;

    const inicio = (paginaActual - 1) * tareasPorPagina;
    const fin = inicio + tareasPorPagina;
    const tareasPaginadas = tareasFiltradas.slice(inicio, fin);

    // Mostrar tabla
    tabla.innerHTML = '';
    tareasPaginadas.forEach(t => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${t.id}</td>
        <td>${t.titulo}</td>
        <td>${t.descripcion}</td>
        <td><input type="checkbox" ${t.completado ? 'checked' : ''} data-id="${t.id}"></td>
        <td>
          <button class="btn-editar"><i class="fas fa-pen"></i></button>
          <button class="btn-borrar"><i class="fas fa-trash"></i></button>
        </td>
      `;

      fila.querySelector('.btn-editar').addEventListener('click', () => abrirModal('editar', t));
      fila.querySelector('.btn-borrar').addEventListener('click', () => mostrarConfirmacion('¿Eliminar esta tarea?', async () => {
        await fetch(`/api/tareas/${t.id}`, { method: 'DELETE' });
        cargarTareas();
      }, { texto: 'Eliminar', color: 'crimson' }));

      tabla.appendChild(fila);
    });

    contador.textContent = `Mostrando ${tareasPaginadas.length} de ${totalTareas} tareas`;

    // Paginación
    paginacion.innerHTML = '';
    const totalPaginas = Math.ceil(totalTareas / tareasPorPagina);
    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      if (i === paginaActual) btn.disabled = true;
      btn.addEventListener('click', () => {
        paginaActual = i;
        cargarTareas();
      });
      paginacion.appendChild(btn);
    }
  };

  // Guardar nueva tarea o editar
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = tituloInput.value;
    const descripcion = descripcionInput.value;

    if (modoEdicion) {
      await fetch(`/api/tareas/${idEdicion}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion, completado: false })
      });
    } else {
      await fetch('/api/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion })
      });
    }

    cerrarElModal();
    form.reset();
    cargarTareas();
  });

  // Cambiar completado
  tabla.addEventListener('change', async (e) => {
    if (e.target.type === 'checkbox') {
      const id = e.target.dataset.id;
      const fila = e.target.closest('tr');
      const titulo = fila.children[1].innerText;
      const descripcion = fila.children[2].innerText;
      const completado = e.target.checked;

      await fetch(`/api/tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion, completado })
      });

      cargarTareas();
    }
  });

  // Filtros
  filtroSelect.addEventListener('change', () => {
    paginaActual = 1;
    cargarTareas();
  });

  busquedaInput.addEventListener('input', () => {
    paginaActual = 1;
    cargarTareas();
  });

  // Restaurar filtros
  filtroSelect.value = localStorage.getItem('filtro_tareas') || 'todas';
  busquedaInput.value = localStorage.getItem('busqueda_tareas') || '';

  // Iniciar
  cargarTareas();
};
