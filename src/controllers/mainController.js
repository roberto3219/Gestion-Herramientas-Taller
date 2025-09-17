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
        //console.log(prestamos)
        res.render("index",{
            prestamos: prestamos,
            usuario: req.session.userLogged
            //usuario: req.session.userLogged,
        })
    }catch(e){
        console.log("Error " + e)
    }
},
devolver: async (req, res) => {
    try {
      
      await db.Prestamos.update(
        { estado: "Devuelto" },
        {
          where: {
            id: req.params.id,
          },
        }
      );
      res.redirect("/");
    }catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
},
search_page: async (req, res) => {
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
            { '$estudiantes.nombre$': { [Op.like]: `%${titulo}%` } },
            { '$herramientas.nombre$': { [Op.like]: `%${titulo}%` } },
             { profesor_encargado: { [Op.like]: `%${titulo}%` } },
             { estado: { [Op.like]: `%${titulo}%` } },
          ],
        },
      });
      console.log(prestamos + " prestamos encontrados")
      
      // Uno los dos resultados
      res.render("index", {
        titulo: titulo,
        prestamos: prestamos,
        usuario: req.session.userLogged,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
}

module.exports = controller;
