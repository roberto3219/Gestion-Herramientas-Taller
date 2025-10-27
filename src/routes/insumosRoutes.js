const express = require('express');
const router = express.Router();
const insumosController = require('../controllers/insumosController');

// Rutas para insumos
router.post('/reportes', insumosController.reportePDF);
router.get('/', insumosController.index);
router.post("/", insumosController.search);
router.get('/add', insumosController.add);
router.post('/add', insumosController.store);
router.post('/:id/edit', insumosController.actualizar);
router.delete('/:id/delete', insumosController.eliminar);

module.exports = router;