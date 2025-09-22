// scripts/generate_pdfs.js
const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");
const { sequelize, Estudiante, Herramienta, Prestamos } = require("../database/models");

async function generateTablePDF(filename, title, rows, columns) {
  const doc = new PDFDocument({ margin: 30, size: "A4" });
  const outDir = path.join(__dirname, "..", "exports");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const filePath = path.join(outDir, filename);
  doc.pipe(fs.createWriteStream(filePath));

  // Definimos la tabla
  const table = {
    title: title,
    headers: columns.map(col => ({ label: col.label, property: col.key, width: 80 })),
    datas: rows
  };

  await doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(9)
  });

  doc.end();
  return filePath;
}

async function generateAllPDFs() {
  await sequelize.authenticate();

  // Estudiantes
  const estudiantes = await Estudiante.findAll({ raw: true });
  await generateTablePDF("estudiantes.pdf", "Listado de Estudiantes", estudiantes, [
    { key: "id", label: "ID" },
    { key: "nombre", label: "Nombre" },
    { key: "email", label: "Email" },
  ]);

  // Herramientas
  const herramientas = await Herramienta.findAll({ raw: true });
  await generateTablePDF("herramientas.pdf", "Listado de Herramientas", herramientas, [
    { key: "id", label: "ID" },
    { key: "nombre", label: "Nombre" },
    { key: "categoria", label: "Categoría" },
    { key: "cantidad", label: "Cantidad" }
  ]);

  // Préstamos
  const prestamos = await Prestamos.findAll({ raw: false });
  const prestamosRows = prestamos.map(p => ({
    id: p.id,
    estudiante: p.estudiante_id,
    herramienta: p.herramientas_id,
    profesor: p.profesor_encargado,
    fecha_prestamo: p.fecha_prestamo ? p.fecha_prestamo.toISOString().split("T")[0] : "",
    fecha_devolucion: p.fecha_devolucion_real
      ? p.fecha_devolucion_real.toISOString().split("T")[0]
      : p.fecha_devolucion_estimada
      ? p.fecha_devolucion_estimada.toISOString().split("T")[0]
      : "",
    estado: p.estado
  }));

  await generateTablePDF("prestamos.pdf", "Listado de Préstamos", prestamosRows, [
    { key: "id", label: "ID" },
    { key: "estudiante", label: "Estudiante" },
    { key: "herramienta", label: "Herramienta" },
    { key: "profesor", label: "Profesor" },
    { key: "fecha_prestamo", label: "Fecha préstamo" },
    { key: "fecha_devolucion", label: "Fecha devolución" },
    { key: "estado", label: "Estado" }
  ]);
}

module.exports = { generateAllPDFs };
