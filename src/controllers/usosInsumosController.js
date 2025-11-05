const db = require("../database/models");
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

      res.redirect("/usosInsumos");
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Error al registrar el uso del insumo." });
    }
  },
};

module.exports = usosInsumosController;
