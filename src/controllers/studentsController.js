// Controlador de productos
const fs = require("fs").promises;
const path = require("path")
const db = require("../database/models/index.js");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const { reportePDF } = require("./prestamosController.js");
const PDFDocument = require("pdfkit-table");
require("pdfkit");


const controller = {
  detail: async (req, res) => {
    try {
      const producto = await db.Producto.findByPk(req.params.id, {
        include: [
          { model: db.Plataforma, as: "plataformas" },
          { model: db.Categoria, as: "categorias" },
        ],
      });

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
      const alumnos = await db.Estudiante.findAll({
      });
      res.render("alumnos/listStudents", {
        titulo: null,
        alumnos: alumnos,
        usuario: req.session.userLogged,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  create: async (req, res) => {
    try {
      res.render("alumnos/registerStudent", {
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
        await db.Estudiante.create({
          nombre: req.body.nombre,
          dni: req.body.dni,
          email: req.body.email,
          curso: req.body.curso,
          telefono: req.body.telefono,
        });

        res.redirect("/estudiantes");
      } catch (error) {
        console.error(error);
        res.render("error", {
          error: "Problema conectando a la base de datos",
        });
      }
    } else {
      try {
        res.render("alumnos/registerStudent", {
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
      const alumno = await db.Estudiante.findByPk(id);

      res.render("alumnos/editStudents", {
        usuario: req.session.userLogged,
        alumno: alumno,
        errores: null,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  actualizar: async (req, res) => {
    console.log("actualizando")
    console.log("ID recibido:", req.params.id);
    console.log("Body recibido:", req.body);

    try {
      let errores = validationResult(req);
      console.log(errores + " errores")
      const id = req.params.id;
      if (errores.isEmpty()) {
        await db.Estudiante.update(
          {
            nombre: req.body.nombre,
            dni: req.body.dni,
            email: req.body.email,
            curso: req.body.curso,
            telefono: req.body.telefono,
          },
          {
            where: {
              id: id,
            },
          }
        );

        res.redirect("/estudiantes");
      } else {
        res.render("alumnos/editStudents", {
          usuario: req.session.userLogged,
          old: req.body,
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
      await db.Estudiante.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.redirect("/estudiantes");
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  search: async (req, res) => {
    try {
      const titulo = req.body.q;
      const estudiantes = await db.Estudiante.findAll({
        where: {
          nombre: { [Op.like]: `%${titulo}%` },
        },
      });

      res.render("alumnos/listStudents", {
        titulo: titulo,
        alumnos: estudiantes,
        usuario: req.session.userLogged,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  reportePDF: async (req, res) => {
    const estudiantes = await db.Estudiante.findAll();
    // 📌 Definir tabla
    const doc = new PDFDocument({ margin: 10, size: "A4" });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      res.setHeader("Content-Disposition", "attachment; filename=estudiantes.pdf");
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfData);
    });
    const table = {
      title: "Reporte de Estudiantes  " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      headers: [
        { label: "ID", property: "id", width: 30, renderer: null , headerColor: "blue", headerOpacity: 0.5, align: "center"},
        { label: "Nombre", property: "nombre", width: 150 },
        { label: "DNI", property: "dni", width: 100 },
        { label: "Email", property: "email", width: 150 },
        { label: "Curso", property: "curso", width: 100 },
        { label: "Teléfono", property: "telefono", width: 100 },
      ],  
      datas: estudiantes.map((e) => ({
        id: e.id,
        nombre: e.nombre || "",
        dni: e.dni || "",
        email: e.email || "",
        curso: e.curso || "",
        telefono: e.telefono || "",
      })),
    };
    // 📌 Generar tabla
     await doc.table(table, { prepareHeader: () => doc.font("Helvetica-Bold"), prepareRow: (row, i) => doc.font("Helvetica").fontSize(8) });

  doc.end();
  }
};

module.exports = controller;
