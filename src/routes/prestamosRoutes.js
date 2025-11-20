// Módulos
const express = require("express");
const router = express.Router();

/* const db = require("../database/models");
   console.log(Object.keys(db));
   console.log("PrestamosRoutes cargado"); */

const checkStockMiddleware = require("../middlewares/checkStockMiddleware");
const prestamosController = require("../controllers/prestamoController");

// Ruteos

router.get("/", prestamosController.index);
router.post("/", prestamosController.search);

router.get("/add", prestamosController.create);
router.post("/add" ,checkStockMiddleware,prestamosController.store); 
router.get("/:id/editar", prestamosController.editar);
router.post("/:id/editar", prestamosController.actualizar);

router.get("/:id/eliminar", prestamosController.borrar);

router.post("/reporte", prestamosController.reportePDF); 


module.exports = router;
