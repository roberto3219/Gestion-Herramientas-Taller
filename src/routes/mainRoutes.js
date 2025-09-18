// Módulos
const express = require("express");
const router = express.Router();

// Controlador

const mainController = require("../controllers/mainController");

// Ruteos

router.get("/",mainController.index);
router.post("/:id/devolver",mainController.devolver);
router.post("/",mainController.search);



module.exports = router;
