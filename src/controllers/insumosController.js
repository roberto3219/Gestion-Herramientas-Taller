const db = require("../database/models/index.js");
const { Op } = require("sequelize");
const { actualizar } = require("./prestamosController.js");

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
    update: async (req, res) => {
        try {
            const id = req.params.id;
            const { nombre, descripcion, cantidad, estado } = req.body;
            await db.Insumo.update(
                { nombre, descripcion, cantidad, estado },
                { where: { id } }
            );
            res.status(200).send("Insumo actualizado");
        } catch (e) {
            console.log("Error " + e);
            res.status(500).send("Error al actualizar el insumo");
        }
    },
    delete: async (req, res) => {
        try {
            const id = req.params.id;
            await db.Insumo.destroy({ where: { id } });
            res.status(200).send("Insumo eliminado");
        } catch (e) {
            console.log("Error " + e);
            res.status(500).send("Error al eliminar el insumo");
        }
    },
};

module.exports = controller;