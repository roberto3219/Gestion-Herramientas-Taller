const express = require("express");
const router = express.Router();
const usosInsumosController = require("../controllers/usosInsumosController");

router.get("/", usosInsumosController.index);
router.get("/create", usosInsumosController.create);
router.post("/store", usosInsumosController.store);

module.exports = router;
