// Módulos
const express = require("express");
const router = express.Router();

// Controlador

const mainController = require("../controllers/mainController");

// Ruteos

router.get("/register", mainController.index);


module.exports = router;
