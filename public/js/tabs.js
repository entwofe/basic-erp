export function inicializarSistemaDePestanas() {
  const tabsBar = document.getElementById('tabs-bar');
  const tabsContent = document.getElementById('tabs-content');
  const pestañasAbiertas = new Map();
  window.pestanaParams = {}; // Para parámetros dinámicos

  const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

  const activarPestana = (modulo) => {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.modulo === modulo);
    });

    document.querySelectorAll('.tab-contenido').forEach(tab => {
      tab.style.display = (tab.dataset.modulo === modulo) ? 'block' : 'none';
    });
  };

  const guardarEstadoPestanas = () => {
    const abiertas = [...pestañasAbiertas.keys()];
    const activa = document.querySelector('.tab.active')?.dataset.modulo || null;
    localStorage.setItem('pestanasAbiertas', JSON.stringify(abiertas));
    localStorage.setItem('pestanaActiva', activa);
  };

  const abrirPestana = async (modulo) => {
    if (pestañasAbiertas.has(modulo)) {
      activarPestana(modulo);
      return;
    }

    const html = await (await fetch(`/views/${modulo}.html`)).text();
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('tab-contenido');
    contentDiv.dataset.modulo = modulo;
    contentDiv.innerHTML = html;

    const tabBtn = document.createElement('div');
    tabBtn.classList.add('tab');
    tabBtn.dataset.modulo = modulo;
    tabBtn.innerHTML = `<span>${capitalizar(modulo)}</span> <button class="close-tab">×</button>`;

    tabBtn.querySelector('.close-tab').addEventListener('click', (e) => {
      e.stopPropagation();
      tabsBar.removeChild(tabBtn);
      tabsContent.removeChild(contentDiv);
      pestañasAbiertas.delete(modulo);
      localStorage.removeItem(`busqueda_${modulo}`);
      localStorage.removeItem(`filtro_${modulo}`);
      delete window.pestanaParams?.[modulo];
      guardarEstadoPestanas();

      const restantes = [...tabsBar.querySelectorAll('.tab')];
      if (restantes.length) activarPestana(restantes[restantes.length - 1].dataset.modulo);
    });

    tabBtn.addEventListener('click', () => {
      activarPestana(modulo);
      guardarEstadoPestanas();
    });

    pestañasAbiertas.set(modulo, contentDiv);
    tabsBar.appendChild(tabBtn);
    tabsContent.appendChild(contentDiv);
    guardarEstadoPestanas();
    activarPestana(modulo);

    requestAnimationFrame(() => {
      const script = document.createElement('script');
      script.src = `/js/${modulo}.js?cacheBust=${Date.now()}`;
      script.type = 'module';
      script.onload = () => {
        const fn = window[`inicializarModulo${capitalizar(modulo.split('-')[0])}`];
        if (typeof fn === 'function') fn();
      };
      document.body.appendChild(script);
    });
  };

  window.abrirPestanaDinamica = async ({ modulo, urlVista, urlScript, titulo, params = {} }) => {

    // Dentro de abrirPestanaDinamica()
requestAnimationFrame(() => {
  const script = document.createElement('script');
  script.src = `${urlScript}?cacheBust=${Date.now()}`;
  script.type = 'module';
  script.onload = () => {
    const clave = modulo.split('-')[0];
    const fn = window[`inicializarModulo${capitalizar(clave)}`];
    if (typeof fn === 'function') fn();
  };
  document.body.appendChild(script);
});


    if (pestañasAbiertas.has(modulo)) {
      activarPestana(modulo);
      return;
    }

    window.pestanaParams[modulo] = params;

    const html = await (await fetch(urlVista)).text();
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('tab-contenido');
    contentDiv.dataset.modulo = modulo;
    contentDiv.innerHTML = html;

    const tabBtn = document.createElement('div');
    tabBtn.classList.add('tab');
    tabBtn.dataset.modulo = modulo;
    tabBtn.innerHTML = `<span>${titulo || modulo}</span> <button class="close-tab">×</button>`;

    tabBtn.querySelector('.close-tab').addEventListener('click', (e) => {
      e.stopPropagation();
      tabsBar.removeChild(tabBtn);
      tabsContent.removeChild(contentDiv);
      pestañasAbiertas.delete(modulo);
      localStorage.removeItem(`busqueda_${modulo}`);
      localStorage.removeItem(`filtro_${modulo}`);
      delete window.pestanaParams?.[modulo];
      guardarEstadoPestanas();

      const restantes = [...tabsBar.querySelectorAll('.tab')];
      if (restantes.length) activarPestana(restantes[restantes.length - 1].dataset.modulo);
    });

    tabBtn.addEventListener('click', () => {
      activarPestana(modulo);
      guardarEstadoPestanas();
    });

    pestañasAbiertas.set(modulo, contentDiv);
    tabsBar.appendChild(tabBtn);
    tabsContent.appendChild(contentDiv);
    guardarEstadoPestanas();
    activarPestana(modulo);

    requestAnimationFrame(() => {
      const script = document.createElement('script');
      script.src = `${urlScript}?cacheBust=${Date.now()}`;
      script.type = 'module';
      script.onload = () => {
        const clave = modulo.split('-')[0];
        const fn = window[`inicializarModulo${capitalizar(clave)}`];
        if (typeof fn === 'function') fn();
      };
      document.body.appendChild(script);
    });
  };

  window.addEventListener('DOMContentLoaded', async () => {
    const abiertas = JSON.parse(localStorage.getItem('pestanasAbiertas')) || [];
    const activa = localStorage.getItem('pestanaActiva');

    for (const modulo of abiertas) {
      await abrirPestana(modulo);
    }

    if (activa && pestañasAbiertas.has(activa)) {
      activarPestana(activa);
    }
  });

  document.querySelectorAll('.sidebar a').forEach(enlace => {
    enlace.addEventListener('click', (e) => {
      e.preventDefault();
      abrirPestana(enlace.dataset.modulo);
    });
  });
}
