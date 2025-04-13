console.log('📄 Inicializando ficha del artículo');

// Buscar la clave que empiece por 'fichaArticulo-'
const clave = Object.keys(window.pestanaParams || {}).find(k => k.startsWith('fichaArticulo-'));
const params = clave ? window.pestanaParams[clave] : null;

console.log('🛠️ ID recibido:', params);

window.inicializarModuloFichaArticulo = async () => {
  if (!params || !params.id) {
    document.querySelector('.container').innerHTML = '<p>Error: ID de artículo no proporcionado.</p>';
    return;
  }

  try {
    const res = await fetch(`/api/almacen/${params.id}`);
    console.log('🧪 Verificando elementos:');
[
  'nombre', 'tipo', 'unidad', 'stock', 'stock_minimo', 'ubicacion',
  'proveedor', 'precio_coste', 'desperdicio', 'ultima_compra', 'descripcion'
].forEach(id => {
  const el = document.getElementById(id);
  console.log(`🧩 ${id}:`, el);
});

    if (!res.ok) throw new Error('Error al obtener el artículo');
    const articulo = await res.json();
    console.log('📦 Artículo recibido:', articulo);

    document.getElementById('titulo-articulo').textContent = `📦 ${articulo.nombre}`;
    document.getElementById('nombre').textContent = articulo.nombre || '—';
    document.getElementById('tipo').textContent = articulo.tipo || '—';
    document.getElementById('unidad').textContent = articulo.unidad || '—';
    document.getElementById('stock').textContent = articulo.stock ?? '—';
    document.getElementById('stock_minimo').textContent = articulo.stock_minimo ?? '—';
    document.getElementById('ubicacion').textContent = articulo.ubicacion || '—';
    document.getElementById('proveedor').textContent = articulo.proveedor || '—';
    document.getElementById('precio_coste').textContent = articulo.precio_coste || '—';
    document.getElementById('desperdicio').textContent = articulo.desperdicio || '0';
    document.getElementById('ultima_compra').textContent = articulo.ultima_compra || '—';
    document.getElementById('descripcion').textContent = articulo.descripcion || '—';

    // Imagen del producto
    const foto = document.getElementById('foto-articulo');
    foto.src = articulo.foto || '/imagenes/almacen/articulo_default.png';

    // QR del producto
    if (articulo.codigo_qr) {
      const qr = document.createElement('img');
      qr.src = articulo.codigo_qr;
      qr.alt = 'Código QR';
      qr.classList.add('qr-articulo');
      document.getElementById('qr-articulo').appendChild(qr);
    }

  } catch (error) {
    console.error(error);
    document.querySelector('.container').innerHTML = '<p>Error al cargar los datos del artículo.</p>';
  }
};
