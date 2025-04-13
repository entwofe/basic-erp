// js/calendario.js

window.inicializarModuloCalendario = async () => {
  console.log('📅 Inicializando módulo de calendario');

  const calendarioEl = document.getElementById('calendario');
  const modal = document.getElementById('modal-evento');
  const cerrarModal = document.getElementById('cerrar-modal-evento');
  const form = document.getElementById('form-evento');
  const btnNuevoEvento = document.getElementById('btn-nuevo-evento');
  const btnEliminarEvento = document.getElementById('btn-eliminar-evento');

  let idEventoEditando = null; // 🧠 Guardar el id del evento editando (null si es nuevo)

  const calendar = new FullCalendar.Calendar(calendarioEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    firstDay: 1,
    selectable: true,
    editable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    events: '/api/calendario', // 🔥 Cargar eventos desde el backend
    
    dateClick: (info) => abrirModalNuevoEvento(info.dateStr),
    eventClick: (info) => abrirModalEditarEvento(info.event),
    eventDrop: (info) => moverEvento(info.event)
  });

  calendar.render();

  // --- Eventos de botones ---
  btnNuevoEvento.addEventListener('click', () => abrirModalNuevoEvento());
  cerrarModal.addEventListener('click', cerrarElModal);
  btnEliminarEvento.addEventListener('click', eliminarEvento);

  // --- Abrir modal para nuevo evento ---
  function abrirModalNuevoEvento(fecha) {
    form.reset();
    idEventoEditando = null;
  
    const ahora = new Date();
    let fechaInicio, fechaFin;
  
    if (fecha) {
      // Si nos pasa fecha (clic en calendario), construimos fecha_inicio a las 9:00
      fechaInicio = new Date(`${fecha}T09:00`);
    } else {
      // Si no, usamos fecha actual
      fechaInicio = ahora;
    }
  
    // fecha_fin es 1 hora después de fecha_inicio
    fechaFin = new Date(fechaInicio.getTime() + (60 * 60 * 1000)); // sumar 1h en milisegundos
  
    // Formateamos para <input type="datetime-local">
    const formatoInput = (fecha) => fecha.toISOString().slice(0, 16);
  
    document.getElementById('fecha_inicio').value = formatoInput(fechaInicio);
    document.getElementById('fecha_fin').value = formatoInput(fechaFin);
  
    btnEliminarEvento.style.display = 'none';
    document.getElementById('modal-titulo').textContent = 'Nuevo Evento';
    modal.classList.remove('oculto');
    modal.style.display = 'flex';
  }
  
  
  

  // --- Abrir modal para editar evento existente ---
  async function abrirModalEditarEvento(evento) {
    form.reset();
    idEventoEditando = evento.id;

    try {
      const res = await fetch(`/api/calendario/${evento.id}`);
      if (!res.ok) throw new Error('No se pudo obtener el evento');
      const datos = await res.json();

      document.getElementById('titulo').value = datos.titulo || '';
      document.getElementById('descripcion').value = datos.descripcion || '';
      document.getElementById('fecha_inicio').value = datos.fecha_inicio?.slice(0, 16) || '';
      document.getElementById('fecha_fin').value = datos.fecha_fin?.slice(0, 16) || '';
      document.getElementById('tipo_etiqueta').value = datos.tipo_etiqueta || '';
      document.getElementById('color').value = datos.color || '#2196f3';
      
      document.getElementById('modal-titulo').textContent = 'Editar Evento';
      btnEliminarEvento.style.display = 'block';
      modal.classList.remove('oculto');
      modal.style.display = 'flex';
    } catch (error) {
      console.error(error);
      alert('Error al cargar datos del evento.');
    }
  }

  // --- Cerrar modal ---
  function cerrarElModal() {
    modal.style.display = 'none';
  }

  // --- Guardar evento (crear o editar) ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
      titulo: document.getElementById('titulo').value,
      descripcion: document.getElementById('descripcion').value,
      fecha_inicio: document.getElementById('fecha_inicio').value,
      fecha_fin: document.getElementById('fecha_fin').value,
      tipo_etiqueta: document.getElementById('tipo_etiqueta').value,
      color: document.getElementById('color').value
    };

    try {
      let res;

      if (idEventoEditando) {
        // 🔥 Editar evento existente
        res = await fetch(`/api/calendario/${idEventoEditando}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });
      } else {
        // 🔥 Crear nuevo evento
        res = await fetch('/api/calendario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });
      }

      if (!res.ok) throw new Error('Error al guardar evento');

      cerrarElModal();
      calendar.refetchEvents();
    } catch (error) {
      console.error('Error al guardar evento:', error);
      alert('Hubo un error al guardar el evento');
    }
  });

  // --- Eliminar evento ---
  async function eliminarEvento() {
    if (!idEventoEditando) return;

    if (!confirm('¿Seguro que quieres eliminar este evento?')) return;

    try {
      const res = await fetch(`/api/calendario/${idEventoEditando}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar evento');

      cerrarElModal();
      calendar.refetchEvents();
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      alert('Error al eliminar el evento.');
    }
  }

  // --- Mover evento (arrastrar) ---
  async function moverEvento(evento) {
    try {
      const datos = {
        fecha_inicio: evento.startStr,
        fecha_fin: evento.endStr || evento.startStr
      };

      const res = await fetch(`/api/calendario/mover/${evento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!res.ok) throw new Error('Error al mover evento');
      console.log('✅ Evento movido con éxito');
    } catch (error) {
      console.error('Error al mover evento:', error);
      alert('Error al mover evento.');
    }
  }
};
