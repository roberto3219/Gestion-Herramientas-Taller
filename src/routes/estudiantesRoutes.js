// Módulos
const express = require("express");
const router = express.Router();

//Middlewares
const alumnosValidator = require("../middlewares/alumnosValidator");

// Controlador

const estudiantesController = require("../controllers/studentsController");

// Ruteos

router.get("/", estudiantesController.index);
router.post("/", estudiantesController.search);
router.get("/add", estudiantesController.create);
router.post("/add",alumnosValidator, estudiantesController.store);
router.get("/editar/:id", estudiantesController.editar);
router.post("/editar/:id", estudiantesController.actualizar);
router.get("/eliminar/:id", estudiantesController.borrar);
router.post("/reporte", estudiantesController.reportePDF);


module.exports = router;
