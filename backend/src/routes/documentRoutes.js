const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadDocument, getDocuments, updateDocumentStatus } = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.route('/')
  .get(protect, getDocuments)
  .post(protect, upload.single('document'), uploadDocument);

router.route('/:id/status')
  .patch(protect, authorize('SUPERVISOR', 'ADMIN'), updateDocumentStatus);

module.exports = router;
