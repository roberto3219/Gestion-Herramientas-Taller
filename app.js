// app.js o server.js
const express = require("express")
const app = express()
const path = require("path")
//Otros modulos
const mainRouter = require("./src/routes/mainRoutes")

// Servir Bootstrap desde node_modules
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

//Routes
app.use("/",mainRouter)

// Rutas y configuración de vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));

const port = 3002

app.listen(port, () => console.log(`[server] Corriendo en el puerto ${port}`))