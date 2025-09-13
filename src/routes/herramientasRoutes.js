// Módulos
const express = require("express");
const router = express.Router();

// Controlador

const herramientasController = require("../controllers/toolsController");

// Ruteos

router.get("/", herramientasController.index);
router.get("/add", herramientasController.create);
router.post("/add", herramientasController.store); 
/* router.get("/:id/editar", estudiantesController.editar);
router.post("/:id/actualizar", estudiantesController.actualizar);
router.get("/:id/eliminar", estudiantesController.eliminar); */


module.exports = router;
