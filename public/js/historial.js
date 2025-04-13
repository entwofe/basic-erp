const cargarHistorial = async () => {
    const res = await fetch('/api/historial');
    const acciones = await res.json();
  
    const tabla = document.getElementById('tabla-historial');
    tabla.innerHTML = '';
  
    acciones.forEach(a => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${a.usuario || '(desconocido)'}</td>
        <td>${a.modulo}</td>
        <td>${a.accion}</td>
        <td>${a.detalle || ''}</td>
        <td>${new Date(a.fecha).toLocaleString()}</td>
      `;
      tabla.appendChild(fila);
    });
  };
  
  cargarHistorial();
  