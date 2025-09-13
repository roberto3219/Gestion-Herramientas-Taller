// Módulos
const express = require("express");
const router = express.Router();

// Controlador

const prestamosController = require("../controllers/prestamosController");

// Ruteos

router.get("/", prestamosController.index);
router.get("/add", prestamosController.create);
router.post("/add", prestamosController.store); 
/* router.get("/:id/editar", estudiantesController.editar);
router.post("/:id/actualizar", estudiantesController.actualizar);
router.get("/:id/eliminar", estudiantesController.eliminar); */



module.exports = router;
