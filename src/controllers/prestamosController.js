// Controlador de productos
const fs = require("fs").promises;
const path = require("path")
const db = require("../database/models/index.js");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");

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
      res.render("prestamos/listPrestamos", {
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
        await db.Prestamos.create({
          estudiante_id: req.body.estudiante,
          herramientas_id: req.body.herramienta,
          cantidad_herramientas: req.body.cantidad,
          profesor_encargado: req.body.profesor,
          fecha_prestamo: Date.now(),
          fecha_devolucion_estimada: req.body.fecha_devolucion,
          fecha_devolucion_real: null,
          estado: "Pendiente",
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
      console.log(prestamo + " prestamo a editar")
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
      const oldProduct = await db.Prestamos.findOne({
        where: {
          id: id,
        },

      });
      if (errores.isEmpty()) {
        await db.Prestamos.update(
          {
            estudiante_id: req.body.estudiante,
            herramientas_id: req.body.herramienta,
            cantidad_herramientas: req.body.cantidad,
            profesor_encargado: req.body.profesor,
            fecha_prestamo: req.body.fecha_prestamo,
            estado : "pendiente",
            observaciones: req.body.observaciones,
            fecha_devolucion_estimada: req.body.fecha_devolucion,
            fecha_devolucion_real: null,
          },
          {
            where: {
              id_producto: id,
            },
          }
        );
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
  borrar: async (req, res) => {
    try {
      await db.Prestamos.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.redirect("/prestamos");
    } catch (error) {
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
            { '$estudiantes.nombre$': { [Op.like]: `%${titulo}%` } },
            { '$herramientas.nombre$': { [Op.like]: `%${titulo}%` } },
             { profesor_encargado: { [Op.like]: `%${titulo}%` } },
             { estado: { [Op.like]: `%${titulo}%` } },
          ],
        },
      });
      console.log(prestamos + " prestamos encontrados")
      
      // Uno los dos resultados
      res.render("prestamos/listPrestamos", {
        titulo: titulo,
        prestamos: prestamos,
        usuario: req.session.userLogged,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
};

module.exports = controller;
