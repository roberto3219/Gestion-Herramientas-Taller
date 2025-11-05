// src/middlewares/logger.js
const fs = require('fs');
const path = require('path');
const db = require('../database/models'); // tu index de Sequelize que exporta modelos

const logFile = path.join(__dirname, '..', '..', 'logs', 'actions.log');

// Asegura carpeta logs
const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// formato amigable
function formatLine({ usuarioId, usuarioNombre, accion, ruta, ip, datos }) {
  const fecha = new Date().toISOString();
  return `${fecha} | userId:${usuarioId || 'anon'} | user:${usuarioNombre || 'anon'} | ruta:${ruta || '-'} | accion:${accion} | ip:${ip || '-'} | datos:${JSON.stringify(datos || {})}\n`;
}

async function appendFileLine(line) {
  fs.appendFile(logFile, line, err => {
    if (err) console.error('Error escribiendo log:', err);
  });
}

// Función que guarda en DB y archivo
async function saveAudit({ usuarioId = null, usuarioNombre = null, accion, ruta = null, ip = null, datos = null }) {
  try {
    // Grabar en archivo
    const line = formatLine({ usuarioId, usuarioNombre, accion, ruta, ip, datos });
    appendFileLine(line);

    // Grabar en la BD
    if (db && db.AuditLog) {
      await db.AuditLog.create({
        usuario_id: usuarioId,
        usuario_nombre: usuarioNombre,
        accion,
        ruta,
        ip,
        datos
      });
    } else {
      console.warn('Modelo AuditLog no disponible en db');
    }
  } catch (err) {
    console.error('Error guardando audit:', err);
  }
}

// Middleware que añade helper a req
function auditMiddleware(req, res, next) {
  // helper: req.logAction('Eliminar alumno', { idAlumno: 4 })
  req.logAction = async (accion, datos = null) => {
    const usuario = req.session && req.session.userLogged ? req.session.userLogged : null;
    const usuarioId = usuario ? usuario.id : null;
    const usuarioNombre = usuario ? (usuario.user_name || usuario.user_name || usuario.email) : null;
    const ruta = req.originalUrl || req.url;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // guardar
    await saveAudit({
      usuarioId,
      usuarioNombre,
      accion,
      ruta,
      ip,
      datos
    });
  };

  // (OPCIONAL) auto-log para métodos que cambian datos:
  
  if (['POST','PUT','DELETE'].includes(req.method)) {
    // Ejemplo: loggeamos cambio con body (cuidado con datos sensibles)
    req.logAction(`${req.method} ${req.path}`, { body: req.body });
  }
 

  next();
}

module.exports = auditMiddleware;
