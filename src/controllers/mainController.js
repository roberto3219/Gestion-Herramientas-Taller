// Controlador del index
const db = require("../database/models/index.js");
const { Op } = require("sequelize");



const controller = {
  index: async (req, res) => {
    try{
        const prestamos = await db.Prestamos.findAll({
            include: [
                //{association: "herramientas"}
                {model: db.Estudiante, attributes: ["nombre"], as: "estudiantes"},
                {model: db.Herramienta, attributes: ["nombre"], as: "herramientas"}
            ],
            order: [["created_at", "DESC"]]
        })

         const prestamosVencidos = await db.Prestamos.count({
              where: {
                estado: "pendiente" || "Pendiente",
                vencido : 1
              }
            })
        /*     console.log(prestamos)
        
         */
        prestamos.forEach(p => {
            if (new Date(p.fecha_devolucion_estimada) < p.fecha_prestamo && (p.estado == "pendiente" || p.estado == "Pendiente")) {
                p.vencido = 1;
                p.save();
            }
        });
        
      //  console.log(prestamos)
        res.render("index",{
            prestamos: prestamos,
            prestamosVencidos: prestamosVencidos,
            usuario: req.session.userLogged,
            id:null
            //usuario: req.session.userLogged,
        })
        await req.logAction('Acceder al índice', {  });
    }catch(e){
        console.log("Error " + e)
    }
},
devolver: async (req, res) => {
    try {
      await db.Prestamos.update(
        { 
          estado: "Devuelto",
          fecha_devolucion_real: new Date()
         },
        {
          where: {
            id: req.params.id,
          },
        }
      );
      await req.logAction('Devolver préstamo', { id: req.params.id });
      res.redirect("/");
    }catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
},
search: async (req, res) => {
    try {
      const titulo = req.body.q;
      const prestamos = await db.Prestamos.findAll({
        include: [
          { model: db.Estudiante, attributes: ["nombre"], as: "estudiantes" },
          { model: db.Herramienta, attributes: ["nombre"], as: "herramientas" },
        ],
        where: {
          [Op.or]: [
            { id: { [Op.like]: `%${titulo}%` } },
            { '$estudiantes.nombre$': { [Op.like]: `%${titulo}%` } },
            { '$herramientas.nombre$': { [Op.like]: `%${titulo}%` } },
             { profesor_encargado: { [Op.like]: `%${titulo}%` } },
             { estado: { [Op.like]: `%${titulo}%` } },
          ],
        },
      });
      const prestamosVencidos = await db.Prestamos.count({
              where: {
                estado: "pendiente" || "Pendiente",
                vencido : 1
              }
            })
      console.log(prestamos + " prestamos encontrados")
      await req.logAction('Búsqueda en el índice', { termino: titulo });
      // Uno los dos resultados
      res.render("index", {
        titulo: titulo,
        prestamos: prestamos,
        usuario: req.session.userLogged,
        prestamosVencidos: prestamosVencidos,
        id:null
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
}

module.exports = controller;
