const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const documentsController = require('../controllers/documents.controller');
const path = require('path');

// POST /documents → upload a file for a loan
router.post('/', upload.single('file'), documentsController.uploadDocument);

// GET /documents/:loan_id → get all documents for a loan
router.get('/:loan_id', documentsController.getDocumentsByLoan);

// router.get('/view/by-loan/:loan_id', documentsController.viewAllDocumentsByLoan);

router.get('/view/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  res.sendFile(filePath, err => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

module.exports = router;
