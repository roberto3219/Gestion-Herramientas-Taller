const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

router.get('/', auditController.list);            // GET /audit?q=texto&page=1
router.get('/:id/json', auditController.detailJson); // GET /audit/123/json
router.get('/reporte/pdf', auditController.reportePDF); // GET /audit/reporte/pdf

module.exports = router;
