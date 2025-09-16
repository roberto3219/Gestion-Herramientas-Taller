// Módulos
const express = require("express");
const router = express.Router();

// Controlador

const herramientasController = require("../controllers/toolsController");

// Ruteos

router.get("/", herramientasController.index);
router.post("/", herramientasController.search);
router.get("/add", herramientasController.create);
router.post("/add", herramientasController.store); 
router.get("/:id/editar", herramientasController.editar);
router.post("/:id/editar", herramientasController.actualizar);
router.get("/:id/eliminar", herramientasController.borrar); 


module.exports = router;
