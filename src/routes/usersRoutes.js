// Módulos
const express = require("express");
const router = express.Router();
const path = require("path");

// Controlador

const userController = require("../controllers/usersController");
const backupController = require("../scripts/backup");

// Middlewares

const logUserMiddleware = require("../middlewares/logUserMiddleware");
const registerValidator = require("../middlewares/registerValidator");
const guestMiddleware = require("../middlewares/guestMiddleware"); 
const authMiddleware = require("../middlewares/authMiddleware");


const multer = require("multer");
const multerDiskStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    let folder = path.join(__dirname, "../../public/img/users/");
    callback(null, folder);
  },
  filename: (req, file, callback) => {
    console.log(file)
    let imageName = "user-" + Date.now() + path.extname(file.originalname);
    callback(null, imageName);
  },
});

let fileUpload = multer({ storage: multerDiskStorage });

// Ruteos

router.get("/",userController.list);
router.post("/",userController.search);
router.post("/change-password",userController.changePassword);
router.get("/profile",userController.mostrarPerfil);
router.post("/profile",userController.logout)
router.get("/recuperar-password",userController.recuperarForm);
router.post("/recuperar-password",userController.enviarRecuperacion);
router.get("/login", guestMiddleware, userController.login);
router.post("/login", guestMiddleware,userController.loadLogin);
router.get("/register", guestMiddleware, userController.register);
router.post("/register",guestMiddleware,fileUpload.single("imagen"),registerValidator,logUserMiddleware,userController.saveRegister);
router.get("/backup", backupController.makeBackup);
router.post("/generate-pdfs", userController.generarReportes);
router.post("/edit",fileUpload.single("imagen"),userController.editarPerfil);
router.post("/restore", userController.restore);
router.post("/generate-pdf-users", userController.generarPDF);
router.put("/:id/bloquear", userController.bloquear);
router.delete("/:id/eliminar", userController.eliminar);
router.put("/:id/cancelar-eliminacion", userController.cancelarEliminacion);


module.exports = router;



