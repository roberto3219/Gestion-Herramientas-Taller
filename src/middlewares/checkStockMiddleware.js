// middlewares/checkStockMiddleware.js
const db = require("../database/models");

module.exports = async (req, res, next) => {
  try {
    const { herramienta, cantidad } = req.body;

    // Buscar la herramienta correspondiente
    const herramienta_ = await db.Herramienta.findByPk(herramienta, {
      include: [
        {
          model: db.Prestamos,
          as: "prestamos",
          attributes: ["id", "cantidad_herramientas", "estado"]
        }
      ]
    });

    if (!herramienta_) {
      return res.status(404).json({ error: "Herramienta no encontrada" });
    }

    // Calcular cantidad actualmente prestada (solo los 'Pendientes')
    const prestamosPendientes = herramienta_.prestamos.filter(
      (p) => p.estado === "Pendiente"
    );
    const cantidadPrestada = prestamosPendientes.reduce(
      (acc, p) => acc + (p.cantidad_herramientas || 0),
      0
    );

    const cantidadDisponible = herramienta_.cantidad - cantidadPrestada;

    // Comparar con la cantidad solicitada
    if (cantidad > cantidadDisponible) {
      // Si no hay suficientes herramientas, lanzar error
      return res.status(400).json({
        error: `No hay suficientes herramientas disponibles. Solo quedan ${cantidadDisponible}.`
      });
    }

    // Si todo está bien, continuar al siguiente middleware o controlador
    next();

  } catch (error) {
    console.error("Error en checkStockMiddleware:", error);
    return res.status(500).json({ error: "Error al verificar el stock" });
  }
};
