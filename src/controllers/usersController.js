const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require("../database/models/index.js");
const { jsPDF } = require("jspdf"); // librería para PDF
const nodemailer = require("nodemailer");
const { generateAllPDFs } = require("../scripts/generate_pdfs"); // Importamos la función
const { save } = require("pdfkit");
const path = require("path");
const fs = require("fs");

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
  restore: async (req, res) => {
  try {
    const mode = req.body.mode || "merge"; // viene del input hidden
    const filePath = path.join(__dirname, "../backups/backup-2025-10-03T17-20-42-605Z.json");
    const backupData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (mode === "replace") {
      // 🔹 BORRAR datos anteriores en orden (respetando FK si existen)
      await db.Prestamos.destroy({ where: {} });
      await db.Herramienta.destroy({ where: {} });
      await db.Estudiante.destroy({ where: {} });

      // 🔹 INSERTAR datos del backup
      await db.Estudiante.bulkCreate(backupData.estudiantes);
      await db.Herramienta.bulkCreate(backupData.herramientas);
      await db.Prestamos.bulkCreate(backupData.prestamos);

      return res.json({
        msg: "Backup restaurado (modo REPLACE, se reemplazaron los datos anteriores) ✅"
      });
    }

    // 🔹 MERGE (solo agrega lo que falta)
    for (const e of backupData.estudiantes) {
      await db.Estudiante.findOrCreate({ where: { id: e.id }, defaults: e });
    }

    for (const h of backupData.herramientas) {
      await db.Herramienta.findOrCreate({ where: { id: h.id }, defaults: h });
    }

    for (const p of backupData.prestamos) {
      await db.Prestamos.findOrCreate({ where: { id: p.id }, defaults: p });
    }

    res.json({
      msg: "Backup restaurado (modo MERGE, solo se agregaron los que faltaban) ✅"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error restaurando backup" });
  }
}
  ,
   recuperarForm: (req, res) => {
    res.render("users/recuperar" , { error: null , msg:null});
  },
  enviarRecuperacion: async (req, res) => {
    try {
      const { email } = req.body;

      // Buscar usuario
      const user = await db.Usuario.findOne({ where: { email } });
      if (!user) {
        return res.render("users/recuperar", { error: "Correo no registrado", msg: null });
      }

      // Generar nueva contraseña aleatoria
      const nuevaPass = Math.random().toString(36).slice(2, 10);

      // Hashearla
      const hashed = await bcrypt.hash(nuevaPass, 10);
      user.password_hash = hashed;
      await user.save();

      // Configurar transporte
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port:587,
        auth: {
          user: "",
          pass: "" // recuerda, no la de Gmail directo
        }
      });

      // Enviar correo
      await transporter.sendMail({
        from: "",
        to: email,
        subject: "Recuperación de contraseña",
        html: `
          <h2>Recuperación de cuenta</h2>
          <p>Tu nueva contraseña temporal es:</p>
          <h3>${nuevaPass}</h3>
          <p>Por favor, inicia sesión y cámbiala cuanto antes.</p>
        `
      });

      res.redirect("/")
    } catch (error) {
      console.error(error);
      res.render("users/recuperar", { error: "Error enviando el correo", msg: null });
    }
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
