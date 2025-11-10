const express = require("express");
const router = express.Router();
const usosInsumosController = require("../controllers/usosInsumosController");

router.get("/", usosInsumosController.index);
router.post("/", usosInsumosController.search);
router.get("/create", usosInsumosController.create);
router.post("/store", usosInsumosController.store);
router.post("/reportePDF", usosInsumosController.reportePDF);


module.exports = router;
