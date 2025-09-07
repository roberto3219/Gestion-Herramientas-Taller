// app.js o server.js
const express = require("express")
const app = express()
const path = require("path")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const methodOverride = require("method-override")

//Otros modulos
const mainRouter = require("./src/routes/mainRoutes")
const userRouter = require("./src/routes/usersRoutes")
const herramientaRouter = require("./src/routes/herramientasRoutes")
const prestamoRouter = require("./src/routes/prestamosRoutes")
const estudiantesRouter = require("./src/routes/estudiantesRoutes")

// Servir Bootstrap desde node_modules
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));


//Configuracion HTTP
app.use(methodOverride("_method"))

//Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, "./public")));

// Rutas y configuración de vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));

//cookies
app.use(cookieParser())

app.use(
    session({
        secret:"Shh, it's a secret",
        resave: false,
        saveUninitialized: false,
    })
)

// Middleware para parsear el cuerpo de las solicitudes
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const port = 3002

app.listen(port, () => console.log(`[server] Corriendo en el puerto ${port}`))

//Routes
app.use("/",mainRouter)
app.use("/users",userRouter)
app.use("/herramientas",herramientaRouter)
app.use("/prestamos", prestamoRouter)
app.use("/estudiantes", estudiantesRouter)


app.use((req,res,next) => {
    res.status(404).render("not-found")
})