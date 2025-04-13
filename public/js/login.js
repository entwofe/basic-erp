document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const contraseña = document.getElementById('contraseña').value;
    const errorEl = document.getElementById('error-login');
  
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contraseña })
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        errorEl.textContent = data.error || 'Error desconocido';
        errorEl.classList.remove('oculto');
      } else {
        // Redirigir al panel principal (index.html)
        window.location.href = '/';
      }
    } catch (err) {
      errorEl.textContent = 'Error al conectar con el servidor';
      errorEl.classList.remove('oculto');
    }
  });
  