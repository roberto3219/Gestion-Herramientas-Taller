const db = require('../database/models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit-table');
require('pdfkit');

module.exports = {
  // lista con busqueda por usuario_nombre, accion, ruta, fecha
  list: async (req, res) => {
    try {
      const q = req.query.q || '';
      const page = parseInt(req.query.page) || 1;
      const limit = 50;
      const offset = (page - 1) * limit;

      const where = q ? {
        [Op.or]: [
          { created_at: { [Op.like]: `%${q}%` } },
          { usuario_nombre: { [Op.like]: `%${q}%` } },
          { accion: { [Op.like]: `%${q}%` } },
          { ruta: { [Op.like]: `%${q}%` } },
          { datos: { [Op.like]: `%${q}%` } },
          { ip: { [Op.like]: `%${q}%` } },
          { id: { [Op.like]: `%${q}%` } }
        ]
      } : {};

      const { rows, count } = await db.AuditLog.findAndCountAll({
        where,
        order: [['created_at','DESC']],
        limit, offset
      });

      res.render('audit/list', {
        usuario: req.session.userLogged,
        logs: rows,
        total: count,
        page,
        pages: Math.ceil(count / limit),
        q
      });
    } catch (err) {
      console.error(err);
      res.render('error', { error: 'Error obteniendo logs' });
    }
  },

  // obtener detalle JSON (usado por fetch desde front)
  detailJson: async (req, res) => {
    try {
      const id = req.params.id;
      const log = await db.AuditLog.findByPk(id);
      if (!log) return res.status(404).json({ error: 'No encontrado' });
      res.json(log);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error' });
    }
  },
reportePDF: async (req, res) => {
  const logs = await db.AuditLog.findAll();

  const PDFDocument = require("pdfkit");
  const doc = new PDFDocument({
    size: "A4",
    margin: 40
  });

  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    let pdfData = Buffer.concat(buffers);
    res.setHeader("Content-Disposition", "attachment; filename=reporte_audit_logs.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfData);
  });

  // --- TÍTULO ---
  doc.fontSize(16).text("Reporte de Audit Logs", { align: "center" });
  doc.moveDown(1);

  // --- CONFIG TABLA ---
  const columnWidths = [30, 60, 80, 70, 90, 150, 50, 50];
  const startX = 40;
  let y = doc.y;

  // --- DIBUJAR HEADERS ---
  doc.font("Helvetica-Bold").fontSize(9);

  const headers = [
    "ID", "Usuario",
    "Nombre Usuario",
    "Acción", "Ruta", "Datos", "IP", "Fecha"
  ];

  headers.forEach((h, i) => {
    doc.text(h, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
      width: columnWidths[i]
    });
  });

  y += 20;

  doc.font("Helvetica").fontSize(8);

  // --- FUNCIÓN PARA CREAR PÁGINA Y REDIBUJAR HEADER ---
  const nuevaPagina = () => {
    doc.addPage();
    y = 50;

    doc.font("Helvetica-Bold").fontSize(9);
    headers.forEach((h, i) => {
      doc.text(h, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
        width: columnWidths[i]
      });
    });

    y += 20;
    doc.font("Helvetica").fontSize(8);
  };

  // --- FILAS ---
  for (let log of logs) {
    const rowHeight = 40;

    // Si no entra en la página, hacemos nueva
    if (y + rowHeight > doc.page.height - 40) {
      nuevaPagina();
    }

    const row = [
      log.id ?? "-",
      log.usuario_id ?? "-",
      log.usuario_nombre ?? "-",
      log.accion ?? "-",
      log.ruta ?? "-",
      log.datos ?? "-",
      log.ip ?? "-",
      log.created_at
        ? new Date(log.created_at).toLocaleString()
        : "-"
    ];

    row.forEach((cell, i) => {
      doc.text(cell, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
        width: columnWidths[i]
      });
    });

    y += rowHeight;
  }

  doc.end();
}

};
