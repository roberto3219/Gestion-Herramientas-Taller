// Controlador de productos
const fs = require("fs").promises;
const path = require("path")
const db = require("../database/models/index.js");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");

const controller = {
  detail: async (req, res) => {
    try {
      const producto = await db.Producto.findByPk(req.params.id);

      res.render("productDetail", {
        producto: producto,
        usuario: req.session.userLogged,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  index: async (req, res) => {
    try {
      const herramientas = await db.Herramienta.findAll({
      });
      res.render("herramientas/listTools", {
        herramientas: herramientas,
        usuario: req.session.userLogged,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  create: async (req, res) => {
    try {
      res.render("herramientas/registerHerramientas", {
        usuario: req.session.userLogged,
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
        await db.Herramienta.create({
          nombre: req.body.nombre,
          categoria: req.body.categoria,
          descripcion: req.body.descripcion,
          cantidad: req.body.cantidad,
          estado: req.body.estado,
        });

        res.redirect("/herramientas");
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
      const herramienta = await db.Herramienta.findByPk(id);

      res.render("herramientas/editTools", {
        usuario: req.session.userLogged,
        herramienta: herramienta,
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
      const id = req.params.id
      const oldProduct = await db.Herramienta.findByPk(id);
      if (errores.isEmpty()) {
        await db.Herramienta.update(
          {
            nombre: req.body.nombre,
            categoria: req.body.categoria,
            descripcion: req.body.descripcion,
            cantidad: req.body.cantidad,
            estado: req.body.estado,
          },
          {
            where: {
              id: id,
            },
          }
        );
        res.redirect("/herramientas");
      } else {
        res.render("herramientas/editTools", {
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
      const herramienta = await db.Herramienta.findOne({
        where: {
          id: req.params.id,
        },
      });
      await db.Herramienta.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.redirect("/herramientas");
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  search: async (req, res) => {
    try {
      const titulo = req.body.q;
      const Herramienta = await db.Herramienta.findAll({
        where: {
          nombre: { [Op.like]: `%${titulo}%` },
        }
      });

      res.render("herramientas/listTools", {
        titulo: titulo,
        herramientas: Herramienta,
        usuario: req.session.userLogged,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  
};

module.exports = controller;
