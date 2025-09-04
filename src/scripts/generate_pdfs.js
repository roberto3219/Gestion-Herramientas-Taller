// scripts/generate_pdfs.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { sequelize, Estudiante, Herramienta, Prestamo, PrestamoItem } = require('../models');

async function generateListPDF(filename, title, rows, columns) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const outDir = path.join(__dirname, '..', 'exports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const filePath = path.join(outDir, filename);
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown();

  // encabezado
  doc.fontSize(10);
  const colWidths = columns.map(() => 140);
  // simple table-like listing
  rows.forEach((row, idx) => {
    columns.forEach((col, cIdx) => {
      const text = String(row[col.key] !== undefined ? row[col.key] : '');
      doc.font('Helvetica').text(text, { continued: cIdx < columns.length - 1 });
      if (cIdx < columns.length - 1) doc.text('  |  ', { continued: true });
    });
    doc.moveDown(0.5);
  });

  doc.end();
  console.log('PDF creado:', filePath);
}

async function main() {
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

  // prestamos: incluir items y estudiante
  const prestamos = await Prestamo.findAll({
    include: [
      { model: PrestamoItem, as: 'items' }
    ],
    raw: false
  });

  // transformar prestamos para lista simple
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

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
