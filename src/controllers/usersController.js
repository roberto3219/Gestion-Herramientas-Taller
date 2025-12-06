const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require("../database/models/index.js");
const { jsPDF } = require("jspdf"); // librería para PDF
const nodemailer = require("nodemailer");
const { generateAllPDFs } = require("../scripts/generate_pdfs"); // Importamos la función
const { save } = require("pdfkit");
const path = require("path");
const fs = require("fs");
const {Op} = require("sequelize");
const PDFDocument = require("pdfkit-table");
require("pdfkit");


// Controlador de usuarios

const controller = {
  list: async (req, res) => {
    try {
      const usuarios = await db.Usuario.findAll();

      const hoy = new Date();

      usuarios.forEach(u => {
        if (u.fecha_eliminacion_programada) {
          console.log(u.fecha_eliminacion_programada + "fecha de eliminacion programada del usuario")
          const fechaLimite = new Date(u.fecha_eliminacion_programada)
          console.log(fechaLimite + "fecha limite de eliminacion programada")
          if(fechaLimite <= hoy){
            console.log("la fecha limite es menor o igual que hoy")
            u.puedeEliminarse = true;
            
          }
          console.log(u.puedeEliminarse + "puede eliminarse?")
        }})
        const adminNotificacion = usuarios.some(u => u.puedeEliminarse);
        console.log(adminNotificacion + "notificacion de admin")

      res.render("users/userList", { usuarios: usuarios, adminNotificacion, usuario: req.session.userLogged });
      await req.logAction('Listar usuarios', { userId: req.session.userLogged.id });
    } catch (error) {
      console.log(error);
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  register: async(req, res) => {
    await req.logAction('Mostrar formulario de registro', {  });
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
          bloqueado: false,
          fecha_eliminacion_programada: null
        });


        await req.logAction('Registrar usuario', { username: req.body.username, email: req.body.email });

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

      console.log(usuario)
      if (usuario) {
        if(usuario.bloqueado){
        return  res.render("users/login", {
          old: req.body,
          error: "Usuario bloqueado. Contacte al administrador.",
        });
      }
        const validarPass = await bcrypt.compare(
          req.body.password,
          usuario.password_hash
        );
        if (validarPass) {
          let loginData = {
            id: usuario.id,
            user_name: usuario.user_name,
            nombre: usuario.nombre,
            correo: usuario.email,
            img_usuario: usuario.img_user,
            role_id: usuario.role_id
          }
          req.session.userLogged = loginData;
          
          await req.logAction('Iniciar sesión', { userId: usuario.id, email: usuario.email });

/*           console.log(req.session.userLogged)
 */          res.redirect("/");
        } else {
          res.render("users/login", {
            old: req.body,
            error: "Correo o Contraseña incorrecta.",
          });
        }
      } else {
        res.render("users/login", {
          old: req.body,
          error: "Correo o Contraseña incorrecta.",
        });
      }
    } catch (error) {
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  mostrarPerfil: async (req, res) => {
    try {
      const backupDir = path.join(__dirname, "../backups");
      const backups = fs.readdirSync(backupDir)
      const usuario = await db.Usuario.findOne({
        where: {
          email: req.session.userLogged.correo,
        }
      });
      await req.logAction('Ver perfil', { userId: usuario.id, email: usuario.email });
      console.log(usuario + "usuario")
      res.render("users/perfil", { backups ,usuario: usuario , error: null });
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

      await req.logAction('Actualizar perfil', { userId: usuario.id, email: usuario.email });

      res.redirect("/users/profile");
    } catch (error) {
      res.render("error", { error: "Problema conectando a la base de datos" });
    }
  },
  logout: async (req, res) => {

    await req.logAction('Cerrar sesión', { userId: req.session.userLogged.id, email: req.session.userLogged.correo });
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

        await req.logAction('Cambiar contraseña', { userId: usuario.id, email: usuario.email });

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
    const { mode, file } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No se seleccionó ningún backup" });
    }

    const filePath = path.join(__dirname, "../backups", file);
    const backupData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (mode === "replace") {
      await db.Prestamos.destroy({ where: {} });
      await db.Herramienta.destroy({ where: {} });
      await db.Estudiante.destroy({ where: {} });
      await db.Insumo.destroy({ where: {} });
      await db.UsosInsumos.destroy({ where: {} });
      await db.Rol.destroy({ where: {} });
      await db.Usuario.destroy({ where: {} });


      await db.Estudiante.bulkCreate(backupData.estudiantes);
      await db.Herramienta.bulkCreate(backupData.herramientas);
      await db.Prestamos.bulkCreate(backupData.prestamos);
      await db.Insumo.bulkCreate(backupData.insumo);
      await db.UsosInsumos.bulkCreate(backupData.usos);
      await db.Rol.bulkCreate(backupData.rol);
      await db.Usuario.bulkCreate(backupData.usuario);

      return res.json({ msg: "Backup restaurado (REPLACE) ✔" });
    }

    // MERGE
    for (const e of backupData.estudiantes)
      await db.Estudiante.findOrCreate({ where: { id: e.id }, defaults: e });

    for (const h of backupData.herramientas)
      await db.Herramienta.findOrCreate({ where: { id: h.id }, defaults: h });

    for (const p of backupData.prestamos)
      await db.Prestamos.findOrCreate({ where: { id: p.id }, defaults: p });

    for (const i of backupData.insumo)
      await db.Insumo.findOrCreate({ where: { id: i.id }, defaults: i });
    for (const u of backupData.usos)
      await db.UsosInsumos.findOrCreate({ where: { id: u.id }, defaults: u });
    for (const r of backupData.rol)
      await db.Rol.findOrCreate({ where: { id: r.id }, defaults: r });
    for (const u of backupData.usuario)
      await db.Usuario.findOrCreate({ where: { id: u.id }, defaults: u });
    
    await req.logAction('Restaurar backup', { mode, file });

    res.json({ msg: "Backup restaurado (MERGE) ✔" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error restaurando backup" });
  }
}
  ,
   recuperarForm: async(req, res) => {
        await req.logAction('Mostrar formulario de recuperación de contraseña', {  });

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
          user: "example@gmail.com", // correo del admin
          pass: "yztf ydmt gvkp rzhn" // recuerda, no la de Gmail directo aca va una clave del correo no la contra
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

      await req.logAction('Recuperar contraseña', { userId: user.id, email: user.email });
      
      res.redirect("/")
    } catch (error) {
      console.error(error);
      res.render("users/recuperar", { error: "Error enviando el correo", msg: null });
    }
  },
  generarReportes: async (req, res) => {
    try {
      await generateAllPDFs(); // Llamamos a la función para generar todos los PDFs
      await req.logAction('Generar reportes PDF', { userId: req.session.userLogged.id });
      res.send("Reportes PDF generados correctamente.");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al generar los reportes PDF.");
    }},
    search: async (req, res) => {
      try {
        const query = req.body.q;
        const usuarios = await db.Usuario.findAll({
          where: {
            [Op.or]: [
              { user_name: { [Op.like]: `%${query}%` } },
              { nombre: { [Op.like]: `%${query}%` } },
              { email: { [Op.like]: `%${query}%` } },
              { role_id: { [Op.like]: `%${query}%` } },
              { id: { [Op.like]: `%${query}%` } },
              { bloqueado: { [Op.like]: `%${query}%` } }
            ]
          },
        });
         const adminNotificacion = usuarios.some(u => u.puedeEliminarse);
        console.log(adminNotificacion + "notificacion de admin")
        await req.logAction('Buscar usuarios', { query: query, userId: req.session.userLogged.id });
        res.render("users/userList", { usuarios: usuarios, usuario: req.session.userLogged , adminNotificacion});
      } catch (error) {
        console.log(error);
        res.render("error", { error: "Problema conectando a la base de datos" });
      }
    },
    generarPDF: async (req, res) => {
      const usuarios = await db.Usuario.findAll();
      const doc = new PDFDocument({ margin:10, size: "A4"});
      let buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        let pdfData = Buffer.concat(buffers);
        res
          .writeHead(200, {
            "Content-Length": Buffer.byteLength(pdfData),
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment;filename="usuarios.pdf"',
          })
          .end(pdfData);
      });
      const table = {
        headers: ["ID", "Nombre de Usuario", "Nombre", "Email", "Rol","¿Bloqueado?"],
        rows: usuarios.map((u) => [
          u.id,
          u.user_name,
          u.nombre,
          u.email,
          u.role_id,
          u.bloqueado ? "Sí" : "No"
        ]),
      };
      await doc.table(table, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
        prepareRow: (row, i) => doc.font("Helvetica").fontSize(10),
      });
      doc.end();
      await req.logAction('Generar listado de usuarios en PDF', { userId: req.session.userLogged.id });
    },
    bloquear: async (req, res) => {
    const id = req.params.id;
    const usuario = await db.Usuario.findByPk(id);
    usuario.bloqueado = !usuario.bloqueado;
    await req.logAction(usuario.bloqueado ? 'Bloquear usuario' : 'Desbloquear usuario', { userId: usuario.id, email: usuario.email });
    await usuario.save();
    res.json({ msg: usuario.bloqueado ? "Usuario bloqueado" : "Usuario desbloqueado" });
  },

  eliminar: async (req, res) => {
    const id = req.params.id;
    const usuario = await db.Usuario.findByPk(id);
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 2);
    usuario.fecha_eliminacion_programada = fecha;
    await req.logAction('Programar eliminación de usuario', { userId: usuario.id, email: usuario.email, fecha_eliminacion: fecha });
    await usuario.save();
    res.json({ msg: "Eliminación programada en 2 días" });
  },
  cancelarEliminacion: async (req, res) => {
    const id = req.params.id;
    const usuario = await db.Usuario.findByPk(id);
    usuario.fecha_eliminacion_programada = null;
    await req.logAction('Cancelar eliminación de usuario', { userId: usuario.id, email: usuario.email });
    await usuario.save();
    res.json({ msg: "Eliminación programada cancelada" });
  },
  eliminarDefinitivo: async (req, res) => {
    const id = req.params.id;
    const usuario = await db.Usuario.findByPk(id);
    await req.logAction('Eliminar usuario definitivamente', { userId: usuario.id, email: usuario.email });
    await usuario.destroy();
    res.json({ msg: "Usuario eliminado definitivamente" });
  }
};

module.exports = controller;
