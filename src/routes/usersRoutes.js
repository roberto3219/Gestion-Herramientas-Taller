// Módulos
const express = require("express");
const router = express.Router();
const path = require("path");

// Controlador

const userController = require("../controllers/usersController");

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
    //console.log(file)
    let imageName = "user-" + Date.now() + path.extname(file.originalname);
    callback(null, imageName);
  },
});

let fileUpload = multer({ storage: multerDiskStorage });

// Ruteos
// Ruteos
router.post("/change-password", authMiddleware, userController.changePassword);
router.get("/profile", authMiddleware,userController.mostrarPerfil);
router.post("/profile", authMiddleware, userController.logout)
router.get("/login", guestMiddleware, userController.login);
router.post("/login", guestMiddleware,userController.loadLogin);
router.get("/register", guestMiddleware, userController.register);
router.post("/register",guestMiddleware,
fileUpload.single("imagen"),registerValidator,
  logUserMiddleware,
  userController.saveRegister
);

module.exports = router;



