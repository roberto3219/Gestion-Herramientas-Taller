const { render } = require("ejs");
const db = require("../database/models");
const PDFDocument = require("pdfkit-table");
const { header } = require("express-validator");
require("pdfkit");

/* console.log(db);
 */const usosInsumosController = {
  index: async (req, res) => {
    try {
      const usos = await db.UsosInsumos.findAll({
        include: [
          { model: db.Insumo, attributes:["nombre"] ,as: "insumos" },
          { model: db.Estudiante,attributes:["nombre"] , as: "estudiantes" },
        ],
      });
      console.log(usos);
      await req.logAction('Acceso a la lista de usos de insumos', { totalUsos: usos.length });
      res.render("usosInsumos/listUsos", { usos, usuario: req.session.userLogged });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "No se pudieron cargar los usos de insumos." });
    }
  },

  create: async (req, res) => {
    try {
      const insumos = await db.Insumo.findAll();
      const alumnos = await db.Estudiante.findAll();

      await req.logAction('Acceso a formulario de registro de uso de insumo', { });
      res.render("usosInsumos/registerUso", {error:undefined,  alumnos,insumos, usuario: req.session.userLogged });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "No se pudieron cargar los insumos." });
    }
  },

  store: async (req, res) => {
    try {
      console.log(req.body + " este es el body");
      const insumo = await db.Insumo.findByPk(req.body.insumo_id);
      console.log(insumo);

      if (req.body.cantidad_usada > insumo.cantidad) {
        return res.render("usosInsumos/registerUso", {
          insumos: await db.Insumo.findAll(),
          alumnos: await db.Estudiante.findAll(),
          error: `Cantidad insuficiente. Solo quedan ${insumo.cantidad}`,
          usuario: req.session.userLogged,
        });
      }

      // Registrar uso
      await db.UsosInsumos.create({
        insumo_id: req.body.insumo_id,
        estudiante_id: req.body.estudiante_id,
        profesor_encargado: req.body.profesor_encargado,
        cantidad_usada: req.body.cantidad_usada,
        descripcion: req.body.descripcion,
      });

      // Restar del stock
      await db.Insumo.update(
        { cantidad: insumo.cantidad - req.body.cantidad_usada },
        { where: { id_insumo: req.body.insumo_id } }
      );
      await req.logAction('Registro de uso de insumo', { insumo_id: req.body.insumo_id, estudiante_id: req.body.estudiante_id, cantidad_usada: req.body.cantidad_usada });
      res.redirect("/usosInsumos");
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Error al registrar el uso del insumo." });
    }
  },
  search: async (req, res) => {
    try {
      const termino = req.body.q;
      const usos = await db.UsosInsumos.findAll({
        include: [
          { model: db.Insumo, attributes:["nombre"] ,as: "insumos" },
          { model: db.Estudiante,attributes:["nombre"] , as: "estudiantes" },
        ],
        where: {
          [db.Sequelize.Op.or]: [
            { id: { [db.Sequelize.Op.like]: `%${termino}%` } },
            { '$insumos.nombre$': { [db.Sequelize.Op.like]: `%${termino}%` } },
            { '$estudiantes.nombre$': { [db.Sequelize.Op.like]: `%${termino}%` } },
            { profesor_encargado: { [db.Sequelize.Op.like]: `%${termino}%` } },
            { descripcion: { [db.Sequelize.Op.like]: `%${termino}%` } },
            { cantidad_usada: { [db.Sequelize.Op.like]: `%${termino}%` } },
          ],
        },
      });
      if (usos.length === 0) {
        return res.render("usosInsumos/listUsos", { usos: [], usuario: req.session.userLogged, mensaje: "No se encontraron usos de insumos que coincidan con la búsqueda." });
      }
      await req.logAction('Búsqueda de usos de insumos', { termino, resultados: usos.length });
      res.render("usosInsumos/listUsos", { usos, usuario: req.session.userLogged });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Error al buscar los usos de insumos." });
    }
  },
  reportePDF: async (req, res) => {
    const usos = await db.UsosInsumos.findAll({
      include: [
        { model: db.Insumo, attributes:["nombre"] ,as: "insumos" },
        { model: db.Estudiante,attributes:["nombre"] , as: "estudiantes" },
      ],
    });
    const doc = new PDFDocument({ margin:10, size: "A4"})
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res.setHeader("Content-Disposition", "attachment; filename=usos_insumos.pdf");
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfData);
    });
    const table ={
      title: "Reporte de Usos de Insumos" + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      headers: [
        { label: "ID", property: "id", width: 30, align: "center",renderer: null ,headerColor: "blue", headerOpacity: 0.5},
        { label: "Insumo", property: "insumo", width: 70, align: "center" },
        { label: "Estudiante", property: "estudiante", width: 100 },
        { label: "Profesor Encargado", property: "profesor_encargado", width: 100 },
        { label: "Cantidad Usada", property: "cantidad_usada", width: 80 },
        { label: "Descripción", property: "descripcion", width: 90 },
        { label: "Fecha de Uso", property: "fecha_uso", width: 100 },
      ],
      datas: usos.map(uso => ({
        id: uso.id,
        insumo: uso.insumos.nombre,
        estudiante: uso.estudiantes.nombre,
        profesor_encargado: uso.profesor_encargado,
        cantidad_usada: uso.cantidad_usada,
        descripcion: uso.descripcion,
        fecha_uso: uso.fecha_uso.toLocaleDateString(),
      })),
    }

    await doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
      prepareRow: (row, i) => doc.font("Helvetica").fontSize(10),
    });
    doc.end();

    await req.logAction('Generar reporte PDF de usos de insumos', { totalUsos: usos.length });
  },
};

module.exports = usosInsumosController;
