// js/auth.js

export async function obtenerUsuarioAutenticado() {
    try {
      const res = await fetch('/auth/usuario');
      if (!res.ok) throw new Error('No autenticado');
      return await res.json();
    } catch (err) {
      console.error('🔒 Error de autenticación:', err);
      window.location.href = '/login.html';
    }
  }
  
  export async function cerrarSesion() {
    await fetch('/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  }
  
  export function aplicarPermisos(usuario) {
    // Ítems del menú que requieren un permiso específico
    document.querySelectorAll('[data-permiso]').forEach(el => {
      const requerido = el.dataset.permiso;
      if (usuario.rol !== requerido) {
        el.style.display = 'none';
      }
    });
  
    // Ítems del menú por módulo (solo si hay permisos definidos para el módulo)
    import('./permisos.js').then(({ permisosPorModulo }) => {
      document.querySelectorAll('[data-modulo]').forEach(el => {
        const modulo = el.dataset.modulo;
        const rolesPermitidos = permisosPorModulo[modulo];
        if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
          el.style.display = 'none';
        }
      });
    }).catch(err => {
      console.error('Error cargando permisos por módulo:', err);
    });
  }
  
  
  export function renderizarUsuario(usuario) {
    document.getElementById('avatar').src = `/avatars/${usuario.avatar}`;
    document.getElementById('nombre-usuario').textContent = usuario.nombre;
  }  