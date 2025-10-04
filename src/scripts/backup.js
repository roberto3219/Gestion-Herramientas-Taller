// controllers/backupController.js
const fs = require("fs");
const path = require("path");
const { sequelize, Estudiante, Herramienta, Prestamos,Backups } = require("../database/models");

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

      backups = await Backups.findAll();
      if(backups.length>=10){
        // Eliminar el archivo físico
        const fileToDelete = path.join(outDir, backups[0].filename);
        if (fs.existsSync(fileToDelete)) {
          fs.unlinkSync(fileToDelete);
        }
        // Eliminar el registro de la base de datos
        await Backups.destroy({ where: { id: backups[0].id } });
      }
      await Backups.create({
        filename: filename,
        fecha_create: new Date(),
      });
      // Para descargar directamente en el navegador:
      res.download(filepath, filename);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error generando backup" });
    }
  },
};

module.exports = backupController;
