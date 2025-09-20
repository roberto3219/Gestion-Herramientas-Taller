// scripts/generate_pdfs.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { sequelize, Estudiante, Herramienta, Prestamos } = require("../database/models");

async function generateListPDF(filename, title, rows, columns) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const outDir = path.join(__dirname, '..', 'exports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const filePath = path.join(outDir, filename);
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown();

  rows.forEach((row) => {
    columns.forEach((col, cIdx) => {
      const text = String(row[col.key] !== undefined ? row[col.key] : '');
      doc.font('Helvetica').text(text, { continued: cIdx < columns.length - 1 });
      if (cIdx < columns.length - 1) doc.text('  |  ', { continued: true });
    });
    doc.moveDown(0.5);
  });

  doc.end();
  return filePath; // 👈 devolvemos la ruta del archivo creado
}

// 👇 Nueva función para generar todo el listado de PDFs
async function generateAllPDFs() {
  await sequelize.authenticate();

  const estudiantes = await Estudiante.findAll({ raw: true });
  await generateListPDF('estudiantes.pdf', 'Listado de Estudiantes', estudiantes, [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' }
  ]);

  const herramientas = await Herramienta.findAll({ raw: true });
  await generateListPDF('herramientas.pdf', 'Listado de Herramientas', herramientas, [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'cantidad', label: 'Cantidad' }
  ]);

  const prestamos = await Prestamos.findAll({
    raw: false
  });

  const prestamosRows = prestamos.map(p => ({
    id: p.id,
    estudiante: p.estudiante_id,
    profesor: p.profesor_encargado,
    fecha_prestamo: p.fecha_prestamo,
    fecha_devolucion: p.fecha_devolucion_real || p.fecha_devolucion_estimada,
    estado: p.estado
  }));

  await generateListPDF('prestamos.pdf', 'Listado de Préstamos', prestamosRows, [
    { key: 'id', label: 'ID' },
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'profesor', label: 'Profesor' },
    { key: 'fecha_prestamo', label: 'Fecha préstamo' },
    { key: 'fecha_devolucion', label: 'Fecha devolución' },
    { key: 'estado', label: 'Estado' }
  ]);
}

module.exports = { generateAllPDFs };
