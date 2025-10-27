const db = require("../database/models/index.js");
const { Op } = require("sequelize");
const PDFDocument = require("pdfkit-table");
require("pdfkit");


const controller = {
    index: async (req, res) => {
        try{
            const insumos = await db.Insumo.findAll({
                order: [["nombre", "DESC"]]
            })
            res.render("insumos/insumosList",{
                insumos: insumos,
                usuario: req.session.userLogged
            })
        }catch(e){
            console.log("Error " + e)
        }
    },
    search: async (req, res) => {
        try {
            const titulo = req.body.q;
            const insumos = await db.Insumo.findAll({
                where: {
                    nombre: {
                        [Op.like]: `%${titulo}%`
                    }
                }
            });
            res.render("insumos/insumosList", {
                titulo: titulo,
                insumos: insumos,
                usuario: req.session.userLogged
            });
        } catch (e) {
            console.log("Error " + e);
        }
    },
    add: (req, res) => {
        res.render("insumos/registerInsumo", {
            usuario: req.session.userLogged
        });
    },
    store: async (req, res) => {
        try {
            await db.Insumo.create({
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                cantidad: req.body.cantidad,
                unidad: req.body.unidad,
                ubicacion: req.body.ubicacion,
                fecha_ingreso: Date.now(),
                estado: "Disponible"
            });
            res.redirect("/insumos");
        } catch (e) {
            console.log("Error " + e);
        }
    },
    actualizar: async (req, res) => {
    const id = req.params.id;
    await db.Insumo.update(req.body, { where: { id_insumo:id } });
    res.json({ msg: "Insumo actualizado correctamente" });
  },

  eliminar: async (req, res) => {
    const id = req.params.id;
    await db.Insumo.destroy({ where: { id_insumo:id } });
    res.json({ msg: "Insumo eliminado correctamente" });
  },
    reportePDF: async (req, res) => {
            const insumos = await db.Insumo.findAll();
            // Lógica para generar el PDF con la lista de insumos
            const doc = new PDFDocument({ margin: 10, size:"A4"});
           
            let buffers = [];
            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => {
                let pdfData = Buffer.concat(buffers);
                res
                    .writeHead(200, {
                        "Content-Length": Buffer.byteLength(pdfData),
                        "Content-Type": "application/pdf",
                        "Content-Disposition": "attachment; filename=insumos.pdf",
                    })
                    .end(pdfData);
            });
            const table = {
                title: "Reporte de Insumos " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
                headers: [
                    { label:"ID", property: "id_insumo", width:30, renderer:null, headerColor: "blue", headerOpacity: 0.5, align: "center"},
                    { label: "Nombre", property: "nombre", width:150 },
                    { label: "Descripcion", property: "descripcion", width:200},
                    { label: "Cantidad", property: "cantidad", width:70, align: "right"},
                    { label: "Unidad", property: "unidad", width:70, align: "right"},
                    { label: "Ubicacion", property: "ubicacion", width:100},
                    { label: "Estado", property: "estado", width:80, align: "center"},
                    { label: "Fecha de Ingreso", property: "fecha_ingreso", width:100, renderer: (value) => {
                        return new Date(value).toLocaleDateString();
                    } }
                ],
                datas: insumos.map((e) => ({
                    id_insumo: e.id_insumo,
                    nombre: e.nombre || "",
                    descripcion: e.descripcion || "",
                    cantidad: e.cantidad || "",
                    unidad: e.unidad || "",
                    ubicacion: e.ubicacion || "",
                    estado: e.estado || "",
                    fecha_ingreso: e.fecha_ingreso || ""
                }))
            }
            await doc.table(table, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
                prepareRow: (row, i) => doc.font("Helvetica").fontSize(8)
            });
            doc.end();
    }
};

module.exports = controller;