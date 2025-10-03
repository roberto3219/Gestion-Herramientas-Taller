// controllers/backupController.js
const fs = require("fs");
const path = require("path");
const { sequelize, Estudiante, Herramienta, Prestamos } = require("../database/models");

const backupController = {
  async makeBackup(req, res) {
    try {
      await sequelize.authenticate();

      const estudiantes = await Estudiante.findAll({ raw: true });
      const herramientas = await Herramienta.findAll({ raw: true });
      const prestamos = await Prestamos.findAll({
        nest: true,
      });

      const data = {
        estudiantes,
        herramientas,
        prestamos,
        generatedAt: new Date().toISOString(),
      };

      // Crear carpeta backups si no existe
      const outDir = path.join(__dirname, "..", "backups");
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

      const filename = `backup-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.json`;
      const filepath = path.join(outDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

      // Para descargar directamente en el navegador:
      res.download(filepath, filename);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error generando backup" });
    }
  },
};

module.exports = backupController;
