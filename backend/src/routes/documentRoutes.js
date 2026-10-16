const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  uploadDocument, 
  getDocuments, 
  updateDocumentStatus, 
  submitRevision, 
  getDocumentHistory,
  deleteDocument
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB limit
});

router.route('/')
  .get(protect, getDocuments)
  .post(protect, upload.any(), uploadDocument);

router.route('/:id')
  .delete(protect, deleteDocument);

router.route('/:id/status')
  .patch(protect, authorize('SUPERVISOR', 'ADMIN'), updateDocumentStatus);

router.route('/:id/revision')
  .post(protect, upload.any(), submitRevision);

router.route('/:id/history')
  .get(protect, getDocumentHistory);

module.exports = router;
