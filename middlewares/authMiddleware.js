const permisos = require('../config/permisos');

exports.tienePermiso = (modulo, accion) => {
  return (req, res, next) => {
    const usuario = req.session.usuario;
    if (!usuario) return res.status(401).json({ error: 'No autenticado' });

    const rol = usuario.rol;
    const permitidas = permisos[modulo]?.[rol] || [];

    if (!permitidas.includes(accion)) {
      return res.status(403).json({ error: 'Permiso denegado' });
    }

    next();
  };
};


exports.autenticado = (req, res, next) => {
    if (!req.session.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    next();
  };
  
  exports.soloAdmin = (req, res, next) => {
    if (!req.session.usuario || req.session.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
  