const db = require('../database/models');
const { Op } = require('sequelize');

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
          { usuario_nombre: { [Op.like]: `%${q}%` } },
          { accion: { [Op.like]: `%${q}%` } },
          { ruta: { [Op.like]: `%${q}%` } },
          { datos: { [Op.like]: `%${q}%` } }
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
  }
};
