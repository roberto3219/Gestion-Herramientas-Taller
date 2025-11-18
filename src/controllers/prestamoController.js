const db = require("../database/models");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
/* console.log("🟢 Modelos disponibles:", Object.keys(db)); */

const controller = {
  index: async (req, res) => {
    try {

      const prestamos = await db.Prestamos.findAll({
        include: [
                        //{association: "herramientas"}
                        {model: db.Estudiante, attributes: ["nombre"], as: "estudiantes"},
                        {model: db.Herramienta, attributes: ["nombre"], as: "herramientas"}
                    ],
    });
/*     console.log(prestamos)
 */      res.render("prestamos/listPrestamos", {
        prestamos: prestamos,
        usuario: req.session.userLogged,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
    create: async (req, res) => {
    try {
        const estudiantes = await db.Estudiante.findAll();
        const herramientas = await db.Herramienta.findAll();
      res.render("prestamos/registerPrestamos", {
        usuario: req.session.userLogged,
        herramientas: herramientas,
        estudiantes: estudiantes,
        errores: null,
        imagen: null,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  store: async (req, res) => {
    let errores = validationResult(req);
    console.log(errores + " errores")
    if (errores.isEmpty()) {
      try {
         const herramienta = await db.Herramienta.findByPk(req.body.herramienta, {
        include: [{ model: db.Prestamos, as: "prestamos" }]
      });

      // calcular cantidad ya prestada
      const cantidadPrestada = herramienta.prestamos
        .filter(p => p.estado === "Pendiente")
        .reduce((acc, p) => acc + (p.cantidad_herramientas || 0), 0);

      const cantidadDisponible = herramienta.cantidad - cantidadPrestada;
      if(cantidadDisponible == 0){
        mensajeHerramientasCero = `No hay herramientas disponibles`;
      }else{
        mensajeHerramientasCero = `No hay suficientes herramientas disponibles. solo quedan ${cantidadDisponible}`
      }

      if (req.body.cantidad > cantidadDisponible) {
        return res.render("prestamos/registerPrestamos", {
          usuario: req.session.userLogged,
          herramientas: await db.Herramienta.findAll(),
          estudiantes: await db.Estudiante.findAll(),
          errores: { cantidad: { msg: mensajeHerramientasCero } },
          old: req.body
        });
      }

        await db.Prestamos.create({
          estudiante_id: req.body.estudiante,
          herramientas_id: req.body.herramienta,
          cantidad_herramientas: req.body.cantidad,
          profesor_encargado: req.body.profesor,
          fecha_prestamo: Date.now(),
          fecha_devolucion_estimada: req.body.fecha_devolucion,
          fecha_devolucion_real: null,
          estado: "pendiente",
          observaciones: req.body.observaciones,
        });

        res.redirect("/prestamos");
      } catch (error) {
        console.error(error);
        res.render("error", {
          error: "Problema conectando a la base de datos",
        });
      }
    } else {
      try {
        res.render("herramientas/registerHerramientas", {
          usuario: req.session.userLogged,
         errores: errores.mapped(),
          imagen: req.file != undefined ? req.file.filename : "204.jpg",
          old: req.body,
        });
      } catch (error) {
        console.error(error);
        res.render("error", { error: "Problema conectando a la base de datos"})
      }
    }
  },
  
  editar: async (req, res) => {
    try {
      const id = req.params.id;
      const prestamo = await db.Prestamos.findByPk(id);
      const alumnos = await db.Estudiante.findAll();
      const herramientas = await db.Herramienta.findAll();
      /* console.log(prestamo + " prestamo a editar") */
      res.render("prestamos/editarPrestamos", {
        usuario: req.session.userLogged,
        prestamo: prestamo,
        alumnos: alumnos,
        herramientas: herramientas,
        id: id,
        errores: null,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  actualizar: async (req, res) => {
    try {
      let errores = validationResult(req);
      const id = req.params.id;
      console.log(id + " id a actualizar")
      const oldProduct = await db.Prestamos.findOne({
        where: {
          id: id,
        },
      });
      
      if (errores.isEmpty()) {

        const id = req.params.id;
      const prestamo = await db.Prestamos.findByPk(id);
        
         const herramienta = await db.Herramienta.findByPk(req.body.herramienta, {
        include: [{ model: db.Prestamos, as: "prestamos" }]
      });


        // calcular cantidad ya prestada
      const cantidadPrestada = herramienta.prestamos
        .filter(p => p.estado === "Pendiente")
        .reduce((acc, p) => acc + (p.cantidad_herramientas || 0), 0);

      const cantidadDisponible = herramienta.cantidad - cantidadPrestada;
      if(cantidadDisponible == 0){
        mensajeHerramientasCero = `No hay herramientas disponibles`;
      }else{
        mensajeHerramientasCero = `No hay suficientes herramientas disponibles. solo quedan ${cantidadDisponible}`
      }

      if (req.body.cantidad > cantidadDisponible) {
        return res.render("prestamos/editarPrestamos", {
          prestamo: prestamo,
          usuario: req.session.userLogged,
          herramientas: await db.Herramienta.findAll(),
          alumnos: await db.Estudiante.findAll(),
          errores: { cantidad: { msg: mensajeHerramientasCero } },
          old: req.body
        });
      }

        console.log(req.body.fecha_devolucion_estimada + " fecha devolucion estimada")
        console.log(req.body.fecha_prestamo + " fecha prestamo" )
        await db.Prestamos.update(
          {
            estudiante_id: req.body.alumno_id,
            herramientas_id: req.body.herramienta,
            cantidad_herramientas: req.body.cantidad,
            profesor_encargado: req.body.profesor,
            fecha_prestamo: req.body.fecha_prestamo,
            estado : "pendiente",
            observaciones: req.body.observaciones,
            fecha_devolucion_estimada: req.body.fecha_devolucion_estimada,
            fecha_devolucion_real: null,
          },
          {
            where: {
              id: id,
            },
          }
        );



          await req.logAction('Actualizar préstamo', { id: id, estudiante_id: req.body.alumno_id, herramientas_id: req.body.herramienta });
        res.redirect("/prestamos");
      } else {
        res.render("prestamos/registerPrestamos", {
          usuario: req.session.userLogged,
          old: req.body,
          producto: oldProduct,
          id: id,
          errores: errores.mapped(),
        });
      }
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problemas conectando a la base de datos" });
    }
  },
}

module.exports = controller