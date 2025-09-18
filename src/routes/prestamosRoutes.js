// Módulos
const express = require("express");
const router = express.Router();

// Controlador

const prestamosController = require("../controllers/prestamosController");

// Ruteos

router.get("/", prestamosController.index);
router.post("/", prestamosController.search);
router.get("/add", prestamosController.create);
router.post("/add", prestamosController.store); 
router.get("/:id/editar", prestamosController.editar);
router.post("/:id/editar", prestamosController.actualizar);
router.get("/:id/eliminar", prestamosController.borrar);
router.post("/reporte", prestamosController.reportePDF); 


module.exports = router;
