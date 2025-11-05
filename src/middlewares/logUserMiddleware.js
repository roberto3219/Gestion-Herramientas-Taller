// Middleware de usuarios

const fs = require("fs");
const path = require("path")

function logUserMiddleware(req, res, next) {
  console.log(req);
  fs.appendFileSync(
    path.join(__dirname, "../logs/logUser.txt"),
    `Se creo un regitro de usuario al ingresar en ${req.url} el dia: ${Date.now()}.\n`
  );

  next();
}

module.exports = logUserMiddleware;
