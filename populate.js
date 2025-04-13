const db = require('./db/db');

const getRandomText = () => {
  const titulos = ['Comprar', 'Hacer', 'Terminar', 'Revisar', 'Enviar', 'Buscar', 'Actualizar'];
  const cosas = ['documento', 'proyecto', 'código', 'email', 'presentación', 'informe', 'pedido'];
  return `${titulos[Math.floor(Math.random() * titulos.length)]} ${cosas[Math.floor(Math.random() * cosas.length)]}`;
};

for (let i = 0; i < 100; i++) {
  const titulo = getRandomText();
  const descripcion = `Descripción de ${titulo}`;
  const completado = Math.random() > 0.5; // aleatorio true o false
  db.query(
    'INSERT INTO tareas (titulo, descripcion, completado) VALUES (?, ?, ?)',
    [titulo, descripcion, completado],
    (err) => {
      if (err) console.error(err);
    }
  );
}

console.log('100 tareas insertadas');
