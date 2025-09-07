// Controlador del index
const db = require("../database/models/index.js");

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
            //usuario: req.session.userLogged,
        })
    }catch(e){
        console.log("Error " + e)
    }
}
}

module.exports = controller;
