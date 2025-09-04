// scripts/backup.js
const fs = require('fs');
const path = require('path');
const { sequelize, Estudiante, Herramienta, Prestamo, PrestamoItem, User } = require('../models'); // ajusta path

async function makeBackup() {
  await sequelize.authenticate();

  const estudiantes = await Estudiante.findAll({ raw: true });
  const herramientas = await Herramienta.findAll({ raw: true });
  const prestamos = await Prestamo.findAll({ include: [{ model: PrestamoItem, as: 'items' }], nest: true });

  const data = { estudiantes, herramientas, prestamos, generatedAt: new Date().toISOString() };

  const outDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const filename = `backup-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
  fs.writeFileSync(path.join(outDir, filename), JSON.stringify(data, null, 2));
  console.log('Backup creado en', path.join(outDir, filename));
  process.exit(0);
}

makeBackup().catch(err => {
  console.error(err);
  process.exit(1);
});
