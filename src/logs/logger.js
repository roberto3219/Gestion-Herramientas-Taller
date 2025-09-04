// logger.js
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'logs', 'actions.log');

function formatLine({ usuarioId, usuarioNombre, accion, ruta, ip, datos }) {
  const fecha = new Date().toISOString();
  return `${fecha} | userId:${usuarioId || 'anon'} | user:${usuarioNombre || 'anon'} | ip:${ip || '-'} | ruta:${ruta || '-'} | accion:${accion} | datos:${JSON.stringify(datos) || '-'}\n`;
}

function appendLog(obj) {
  const line = formatLine(obj);
  fs.appendFile(logFile, line, (err) => {
    if (err) console.error('Error escribiendo log:', err);
  });
}

module.exports = {
  appendLog,
  middleware: function(req, res, next) {
    // middleware simple: logea cada request con info mínima
    const user = req.user || {}; // si usás passport o similar
    appendLog({
      usuarioId: user.id,
      usuarioNombre: user.nombre,
      accion: 'REQUEST',
      ruta: req.originalUrl,
      ip: req.ip,
      datos: { method: req.method, body: req.body ? req.body : null, query: req.query }
    });
    next();
  }
};
