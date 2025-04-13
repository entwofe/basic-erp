// js/components/modalConfirmacion.js

export function mostrarConfirmacion(mensaje, callbackConfirmar, opciones = {}) {
    const modal = document.getElementById('modal-confirmacion-global');
    const texto = document.getElementById('texto-confirmacion-global');
    const btnCancelar = document.getElementById('cancelar-confirmacion-global');
    const btnConfirmar = document.getElementById('confirmar-confirmacion-global');
  
    texto.textContent = mensaje;
    btnConfirmar.textContent = opciones.texto || 'Confirmar';
  
    // Estilos personalizados
    btnConfirmar.classList.toggle('rojo', opciones.color === 'crimson');
    btnConfirmar.style.color = opciones.color === 'crimson' ? 'white' : 'white';
  
    modal.classList.remove('oculto');
    modal.style.display = 'flex';
  
    const cerrar = () => {
      modal.style.display = 'none';
      modal.classList.add('oculto');
      btnConfirmar.removeEventListener('click', confirmarAccion);
      btnCancelar.removeEventListener('click', cerrar);
    };
  
    const confirmarAccion = () => {
      callbackConfirmar();
      cerrar();
    };
  
    btnConfirmar.addEventListener('click', confirmarAccion);
    btnCancelar.addEventListener('click', cerrar);
  }
  