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
          fecha_prestamo: req.body.fecha_prestamo,
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
      const oldProduct = await db.Producto.findOne({
        where: {
          id_producto: id,
        },

      });
      if (errores.isEmpty()) {
        await db.Producto.update(
          {
            nombre: req.body.nombre,
            precio: req.body.precio,
            cant_desc: req.body.descuento,
            descripcion: req.body.detalle,
            img_prod:
              req.file != undefined ? req.file.filename : oldProduct.img_prod,
            id_plataforma: req.body.plataforma,
          },
          {
            where: {
              id_producto: id,
            },
          }
        );

        for (let i = 0; i < oldProduct.categorias.length; i++) {
          const idCategoria = oldProduct.categorias[i].id_categoria;
          await db.ProductoCategoria.destroy({
            where: {
              id: idCategoria,
            },
          });
        }

        for (let i = 0; i < req.body.tag.length; i++) {
          const idCategoria = req.body.tag[i];
          await oldProduct.addCategorias(Number(idCategoria));
        }

        res.redirect("/products/detail/" + id);
      } else {
        const plataformas = await db.Plataforma.findAll();
        const categorias = await db.Categoria.findAll();
        const seleccionadas =
          req.body.tag != undefined
            ? req.body.tag.map((tag) => Number(tag))
            : undefined;
        let categoriasFiltradas;
        let categoriasSeleccionadas;
        if (seleccionadas != undefined) {
          categoriasFiltradas = categorias.filter(
            (categoria) => !seleccionadas.includes(categoria.id_categoria)
          );
          categoriasSeleccionadas = categorias.filter((categoria) =>
            seleccionadas.includes(categoria.id_categoria)
          );
        }

        res.render("productEdit", {
          categorias:
            categoriasFiltradas != undefined ? categoriasFiltradas : categorias,
          plataformas: plataformas,
          usuario: req.session.userLogged,
          seleccionadas: categoriasSeleccionadas,
          old: req.body,
          imagen:
            req.file != undefined ? req.file.filename : oldProduct.img_prod,
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
      const producto = await db.Producto.findOne({
        where: {
          id_producto: req.params.id,
        },
      });
      await fs.unlink(path.join(__dirname, "../../public/images/products/" + producto.img_prod));
      await db.Producto.destroy({
        where: {
          id_producto: req.params.id,
        },
      });
      res.redirect("/products");
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  search: async (req, res) => {
    try {
      const titulo = req.body.searcher;
      const productos = await db.Producto.findAll({
        where: {
          nombre: { [Op.like]: `%${titulo}%` },
        },
        include: [
          {
            model: db.Plataforma,
            as: "plataformas",
          },
        ],
      });

      res.render("products", {
        titulo: titulo,
        productos: productos,
        usuario: req.session.userLogged,
      });
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  agregar: async (req, res) => {
    try {
      const idProducto = req.params.id;

      const carrito = await db.Carrito.findByPk(req.session.userLogged.id_carrito, {
        include: [
          {
            model: db.Producto,
            as: "productos",
          },
        ],
      });

      let productoEncontrado = carrito.productos.find(
        (p) => p.id_producto == idProducto
      );

      if (productoEncontrado) {
        await db.CarritoProducto.update(
          {
            cantidad: productoEncontrado.CarritoProducto.cantidad + 1,
          },
          {
            where: {
              id_carrito: req.session.userLogged.id_carrito,
              id_producto: idProducto,
            },
          }
        );

        res.redirect("/products");
      } else {
        await carrito.addProducto(idProducto, { through: { cantidad: 1 }})
        
        res.redirect("/products")
      }
    } catch (error) {
      console.error(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
};

module.exports = controller;
