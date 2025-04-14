// js/almacen.js

console.log('🔧 inicializarModuloAlmacen cargado');

import { socket } from './socket.js';

window.inicializarModuloAlmacen = () => {
  // --- Elementos del DOM ---
  const tabla = document.getElementById('tabla-articulos');
  const btnNuevo = document.getElementById('btn-nuevo-articulo');
  const modal = document.getElementById('modal-articulo');
  const cerrarModal = document.getElementById('cerrar-modal-articulo');
  const form = document.getElementById('form-articulo');
  const paginacion = document.getElementById('paginacion');
  const filtroTipo = document.getElementById('filtro-tipo');
  const inputBusqueda = document.getElementById('busqueda');

  const porPagina = 20;
  let paginaActual = 1;
  let articulosOriginales = [];

  btnNuevo.addEventListener('click', () => {
    form.reset();
    document.getElementById('titulo-modal-articulo').textContent = 'Nuevo Artículo';
    modal.classList.remove('oculto');
    modal.style.display = 'flex';
  });

  cerrarModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  const cargarArticulos = async () => {
    try {
      const res = await fetch('/api/almacen');
      articulosOriginales = await res.json();
      aplicarFiltrosYBusqueda();
    } catch (error) {
      console.error('❌ Error al cargar artículos:', error);
    }
  };

  const mostrarArticulos = (articulos) => {
    tabla.innerHTML = '';
    articulos.forEach(a => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${a.nombre}</td>
        <td>${a.tipo}</td>
        <td>${a.unidad}</td>
        <td>${a.stock}</td>
        <td>${a.precio || ''}</td>
        <td>
          <button class="btn-editar" data-id="${a.id}">✏️</button>
          <button class="btn-eliminar" data-id="${a.id}">🗑️</button>
        </td>
      `;
      fila.style.cursor = 'pointer';
      fila.addEventListener('mouseenter', () => fila.style.backgroundColor = '#f0f9ff');
      fila.addEventListener('mouseleave', () => fila.style.backgroundColor = '');
      fila.addEventListener('dblclick', () => {
        const id = a.id;
        const modulo = `fichaArticulo-${id}`;
        window.abrirPestanaDinamica && window.abrirPestanaDinamica({
          modulo,
          urlVista: '/views/fichaArticulo.html',
          urlScript: '/js/fichaArticulo.js',
          titulo: `📦 ${a.nombre}`,
          params: { id }
        });
      });
      tabla.appendChild(fila);
    });
  };

  const configurarEventosAcciones = (articulos) => {
    document.querySelectorAll('.btn-editar').forEach(boton => {
      boton.addEventListener('click', () => {
        const id = boton.dataset.id;
        const articulo = articulos.find(a => a.id == id);
        if (!articulo) return;

        form.reset();
        document.getElementById('nombre').value = articulo.nombre;
        document.getElementById('tipo').value = articulo.tipo;
        document.getElementById('unidad').value = articulo.unidad;
        document.getElementById('stock').value = articulo.stock;
        document.getElementById('stock_minimo').value = articulo.stock_minimo || '';
        document.getElementById('ubicacion').value = articulo.ubicacion || '';
        document.getElementById('proveedor').value = articulo.proveedor || '';
        document.getElementById('titulo-modal-articulo').textContent = 'Editar Artículo';

        modal.style.display = 'flex';
      });
    });

    document.querySelectorAll('.btn-eliminar').forEach(boton => {
      boton.addEventListener('click', () => {
        const id = boton.dataset.id;
        const eliminar = async () => {
          await fetch(`/api/almacen/${id}`, { method: 'DELETE' });
          socket.emit('almacenActualizado');
        };
        mostrarConfirmacion('¿Eliminar este artículo?', eliminar, { texto: 'Eliminar', color: 'crimson' });
      });
    });
  };

  const aplicarFiltrosYBusqueda = () => {
    const tipo = filtroTipo.value.toLowerCase();
    const texto = inputBusqueda.value.toLowerCase();

    localStorage.setItem('almacen_filtro', tipo);
    localStorage.setItem('almacen_busqueda', texto);

    const filtrados = articulosOriginales.filter(a => {
      const nombre = (a.nombre || '').toLowerCase();
      const tipoArticulo = (a.tipo || '').toLowerCase();

      const coincideTipo = !tipo || tipoArticulo === tipo;
      const coincideTexto = nombre.includes(texto);

      return coincideTipo && coincideTexto;
    });

    paginaActual = 1;
    mostrarPaginados(filtrados);
  };

  const mostrarPaginados = (articulos) => {
    const inicio = (paginaActual - 1) * porPagina;
    const paginados = articulos.slice(inicio, inicio + porPagina);

    mostrarArticulos(paginados);
    configurarEventosAcciones(paginados);
    renderizarPaginacion(articulos.length);
  };

  const renderizarPaginacion = (totalItems) => {
    paginacion.innerHTML = '';
    const totalPaginas = Math.ceil(totalItems / porPagina);

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      if (i === paginaActual) btn.disabled = true;

      btn.addEventListener('click', () => {
        paginaActual = i;
        aplicarFiltrosYBusqueda();
      });

      paginacion.appendChild(btn);
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
      nombre: document.getElementById('nombre').value,
      tipo: document.getElementById('tipo').value,
      unidad: document.getElementById('unidad').value,
      stock: document.getElementById('stock').value,
      stock_minimo: document.getElementById('stock_minimo').value,
      ubicacion: document.getElementById('ubicacion').value,
      proveedor: document.getElementById('proveedor').value,
    };

    const metodo = 'POST';
    const url = '/api/almacen';

    const res = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    if (res.ok) {
      modal.style.display = 'none';
      form.reset();
      socket.emit('almacenActualizado');
    } else {
      alert('Error al guardar el artículo');
    }
  });

  // --- EVENTOS DE FILTROS ---
  filtroTipo.addEventListener('change', aplicarFiltrosYBusqueda);
  inputBusqueda.addEventListener('input', aplicarFiltrosYBusqueda);

  // --- SOCKET.IO actualizaciones ---
  if (typeof socket !== 'undefined') {
    socket.on('almacenActualizado', () => {
      console.log('🔄 Actualizando lista de artículos por evento en tiempo real');
      cargarArticulos();
    });
  }

  filtroTipo.value = localStorage.getItem('almacen_filtro') || '';
  inputBusqueda.value = localStorage.getItem('almacen_busqueda') || '';

  cargarArticulos();
};
