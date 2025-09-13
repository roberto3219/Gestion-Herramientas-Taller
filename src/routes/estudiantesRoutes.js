// Módulos
const express = require("express");
const router = express.Router();

// Controlador

const estudiantesController = require("../controllers/studentsController");

// Ruteos

router.get("/", estudiantesController.index);
router.get("/add", estudiantesController.create);
router.post("/add", estudiantesController.store);
/* router.get("/:id/editar", estudiantesController.editar);
router.post("/:id/actualizar", estudiantesController.actualizar);
router.get("/:id/eliminar", estudiantesController.eliminar); */


module.exports = router;
