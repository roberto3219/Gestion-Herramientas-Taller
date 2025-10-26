const express = require('express');
const router = express.Router();
const insumosController = require('../controllers/insumosController');

// Rutas para insumos
router.get('/', insumosController.index);
router.get('/add', insumosController.add);
router.post('/add', insumosController.store);
router.post('/:id', insumosController.update);
router.delete('/:id', insumosController.delete);

module.exports = router;