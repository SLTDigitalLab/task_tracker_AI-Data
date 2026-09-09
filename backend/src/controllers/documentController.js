const prisma = require('../config/db');

// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    const { title, category, projectId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const document = await prisma.document.create({
      data: {
        title,
        category,
        projectId,
        uploaderId: req.user.id,
        filePath: req.file.path
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error uploading document' });
  }
};

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      include: {
        uploader: { select: { fullName: true } },
        project: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
};

// @desc    Update document status (Supervisor review)
// @route   PATCH /api/documents/:id/status
// @access  Private (Supervisor/Admin)
const updateDocumentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const document = await prisma.document.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating document status' });
  }
};

module.exports = { uploadDocument, getDocuments, updateDocumentStatus };
