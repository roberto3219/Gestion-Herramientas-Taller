const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require("../database/models/index.js");
const { jsPDF } = require("jspdf"); // librería para PDF
const nodemailer = require("nodemailer");
const { generateAllPDFs } = require("../scripts/generate_pdfs"); // Importamos la función
const { save } = require("pdfkit");

// Controlador de usuarios

const controller = {
  register: (req, res) => {
    res.render("users/register", { imagen: null });
  },

  saveRegister: async (req, res) => {
    let errores = validationResult(req);
    let saveImage = req.file;
    console.log(saveImage)
    console.log(errores)
    if (errores.isEmpty()) {
      try {
        const hashedPassword = await bcrypt.hashSync(req.body.password, 10);

        await db.Usuario.create({
          user_name: req.body.username,
          nombre: req.body.nombre,
          email: req.body.email,
          password_hash: hashedPassword,
          img_user:
          saveImage != undefined ? saveImage.filename : "default.png",
          role_id: 3,
        });

        // Responder con algún mensaje o redirigir a otra página
        res.redirect("/users/login");
      } catch (error) {
        console.log(error)
        res.render("error", {
          error: "Problema conectando a la base de datos",
        });
      }
    } else {
      console.log("O no que mal")
      res.render("users/register", {
        errores: errores.mapped(),
        old: req.body,
        imagen: saveImage != undefined ? saveImage.filename : "default.jpg",
      });
    }
  },
  login: (req, res) => {
    res.render("users/login", { error: null });
  },
  loadLogin: async function (req, res) {
    try {
      const usuario = await db.Usuario.findOne({
        where: { email: req.body.email },
      });
/*       console.log(usuario)
 */      if (usuario) {
        const validarPass = await bcrypt.compare(
          req.body.password,
          usuario.password_hash
        );
        if (validarPass) {
          let loginData = {
            user_name: usuario.user_name,
            nombre: usuario.nombre,
            correo: usuario.email,
            img_usuario: usuario.img_user,
            role_id: usuario.role_id
          }
          req.session.userLogged = loginData;
          console.log(req.session.userLogged)
          res.redirect("/");
        } else {
          res.render("users/login", {
            old: req.body,
            error: "Contraseña incorrecta.",
          });
        }
      } else {
        res.render("users/login", {
          old: req.body,
          error: "No existe un usuario con este correo.",
        });
      }
    } catch (error) {
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  mostrarPerfil: async (req, res) => {
    try {
      const usuario = await db.Usuario.findOne({
        where: {
          email: req.session.userLogged.correo,
        }
      });
      console.log(usuario + "usuario")
      res.render("users/perfil", { usuario: usuario , error: null });
    } catch (error) {
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },

  editarPerfil: async (req, res) => {
    try {
      const usuario = await db.Usuario.findOne({
        where: {
          email: req.session.userLogged.correo,
        }
      });
      console.log(usuario + "usuario para editar")
      await db.Usuario.update(
        {
          user_name: req.body.username,
          nombre: req.body.nombre,
          email: req.body.email,
          img_user: req.file != undefined ? req.file.filename : usuario.img_usuario,
        },
        {
          where: {
            email: req.session.userLogged.correo,
          }
        }
      );
      res.redirect("/users/profile");
    } catch (error) {
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  logout: async (req, res) => {
    req.session.destroy(() => {
      res.redirect("/users/login");
    });
  },
  changePassword: async (req, res) => {
    try {
      const usuario = await db.Usuario.findOne({
        where: {
          email: req.session.userLogged.correo,
        }
      });

      const validarPass = await bcrypt.compare(
        req.body.currentPassword,
        usuario.password_hash
      );
      console.log(validarPass + "validarPass: es para ver si la contra actual es correcta")

      if (validarPass) {
        const hashedPassword = bcrypt.hashSync(req.body.newPassword, 10);
        await db.Usuario.update(
          { password_hash: hashedPassword },
          { where: { email: req.session.userLogged.correo } }
        );
        res.redirect("/users/profile");
        console.log("Contraseña actualizada");
      } else {
        res.render("users/perfil", {
          usuario: usuario,
          error: "La contraseña actual es incorrecta.",
        });
        console.log("La contraseña actual es incorrecta.");
      }
    } catch (error) {
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  backupJSON: async (req, res) => {
  const prestamos = await db.Prestamos.findAll({
    include: ["estudiantes", "herramientas"]
  });

  // Mapeamos solo lo importante (estructura simple)
  const backup = prestamos.map(p => ({
    id: p.id,
    estudiante: p.estudiantes.nombre,
    herramienta: p.herramientas.nombre,
    cantidad_herramientas: p.cantidad_herramientas,
    profesor: p.profesor_encargado,
    fecha_prestamo: p.fecha_prestamo,
    fecha_devolucion_estimada: p.fecha_devolucion_estimada,
    fecha_devolucion_real: p.fecha_devolucion_real,
    estado: p.estado,
    observaciones: p.observaciones,
  }));

  res.setHeader("Content-Disposition", "attachment; filename=backup.json");
  res.json(backup);
},
   recuperarForm: (req, res) => {
    res.render("users/recuperar" , { error: null , msg:null});
  },
  enviarRecuperacion: async (req, res) => {
    const { email } = req.body;

    // Buscar usuario
    const user = await db.Usuario.findOne({ where: { email } });
    if (!user) {
      return res.render("users/recuperar", { error: "Correo no registrado", msg:null });
    }

    // Generar token temporal (ejemplo simple, mejor usar JWT en la práctica)
    const token = Math.random().toString(36).slice(2);

    // Guardar token en DB (ejemplo: columna reset_token)
    user.reset_token = token;
    await user.save();

    // Configurar mailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tu_correo@gmail.com",
        pass: "tu_contraseña_de_app"
      }
    });

    const link = `http://localhost:3000/reset/${token}`;

    await transporter.sendMail({
      from: "tu_correo@gmail.com",
      to: email,
      subject: "Recuperación de Contraseña",
      text: `Haz click en este enlace para recuperar tu contraseña: ${link}`
    });

    res.render("usuario/recuperar", { msg: "Correo enviado con instrucciones" });
  },
  generarReportes: async (req, res) => {
    try {
      await generateAllPDFs(); // Llamamos a la función para generar todos los PDFs
      res.send("Reportes PDF generados correctamente.");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al generar los reportes PDF.");
    }}

};

module.exports = controller;
