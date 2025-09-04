// app.js o server.js
const express = require("express")
const app = express()
const path = require("path")
//Otros modulos


// Servir Bootstrap desde node_modules
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// Rutas y configuración de vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));