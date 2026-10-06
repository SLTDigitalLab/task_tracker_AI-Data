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
  getDocumentHistory 
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
  }
});
const upload = multer({ storage });

router.route('/')
  .get(protect, getDocuments)
  .post(protect, upload.any(), uploadDocument);

router.route('/:id/status')
  .patch(protect, authorize('SUPERVISOR', 'ADMIN'), updateDocumentStatus);

router.route('/:id/revision')
  .post(protect, upload.any(), submitRevision);

router.route('/:id/history')
  .get(protect, getDocumentHistory);

module.exports = router;
