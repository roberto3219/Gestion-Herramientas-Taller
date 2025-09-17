// Módulos
const express = require("express");
const router = express.Router();

// Controlador

const mainController = require("../controllers/mainController");

// Ruteos

router.get("/",mainController.index);
router.post("/",mainController.devolver);
router.get("/buscar",mainController.search);



module.exports = router;
