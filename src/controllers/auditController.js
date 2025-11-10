const db = require('../database/models');
const { Op } = require('sequelize');
const { search } = require('./insumosController');

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
    const logs = await db.AuditLog.findAll({
      order: [['created_at', 'DESC']]
    });

    const doc = new PDFDocument({margin: 10, size: "A4"});
    let filename = "reporte_audit_logs.pdf";

    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res
        .writeHead(200, {
          'Content-Length': Buffer.byteLength(pdfData),
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment;filename=${filename}`,
        })
        .end(pdfData);
    });
    const table = {
      title: "Reporte de Audit Logs" + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      headers: [
        { label: "ID", property: "id", width: 30, align: "center" },
        { label: "Usuario", property: "usuario_nombre", width: 100 },
        { label: "Acción", property: "accion", width: 100 },
        { label: "Ruta", property: "ruta", width: 100 },
        { label: "Datos", property: "datos", width: 150 },
        { label: "IP", property: "ip", width: 80, align: "center" },
        { label: "Fecha", property: "created_at", width: 100, renderer: (value) => {
            return new Date(value).toLocaleString();
          }, align: "center" },
      ],
      datas: logs.map((e) => ({
        id: e.id,
        usuario_nombre: e.usuario_nombre,
        accion: e.accion,
        ruta: e.ruta,
        datos: e.datos,
        ip: e.ip,
        created_at: e.created_at,
      })),
    };
    await doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
    });
    doc.end();
    await req.logAction('Generar reporte PDF de audit logs', { totalLogs: logs.length });
  },
  search : async (query) => {
    return await db.AuditLog.findAll({
      where: {
        [Op.or]: [
          { usuario_nombre: { [Op.like]: `%${query}%` } },
          { accion: { [Op.like]: `%${query}%` } },
          { ruta: { [Op.like]: `%${query}%` } },
          { datos: { [Op.like]: `%${query}%` } },
          { ip: { [Op.like]: `%${query}%` } },
          { id: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [['created_at','DESC']]
    });
  }

};
