const prisma = require('../config/db');

// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    const { title, category, projectId, comment } = req.body;
    const uploadedFile = req.file || (req.files && req.files[0]);
    
    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const docTitle = title || uploadedFile.originalname || 'Document';

    const document = await prisma.document.create({
      data: {
        title: docTitle,
        category: category || 'BRD',
        projectId,
        uploaderId: req.user.id,
        filePath: `uploads/${uploadedFile.filename}`,
        version: 1,
        status: 'PENDING'
      },
      include: {
        project: true
      }
    });

    // Record in Document Submission History
    await prisma.documentHistory.create({
      data: {
        documentId: document.id,
        version: 1,
        action: 'INITIAL_UPLOAD',
        status: 'PENDING',
        comment: comment || 'Initial document submission',
        filePath: document.filePath,
        performedById: req.user.id
      }
    });

    // Notify supervisor if assigned to project
    if (document.project?.supervisorId && document.project.supervisorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: document.project.supervisorId,
          projectId: document.projectId,
          message: `New document "${document.title}" (${document.category}) uploaded by ${req.user.fullName}.`
        }
      });
    }

    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
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
        uploader: { select: { fullName: true, email: true } },
        project: { select: { id: true, title: true, supervisorId: true } },
        history: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { performedBy: { select: { fullName: true, role: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
};

// @desc    Update document status (Supervisor review / Needs Revision)
// @route   PATCH /api/documents/:id/status
// @access  Private (Supervisor/Admin)
const updateDocumentStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    const existingDoc = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });

    if (!existingDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = await prisma.document.update({
      where: { id: req.params.id },
      data: { status }
    });

    const action = status === 'NEEDS_REVISION' ? 'NEEDS_REVISION' : status === 'APPROVED' ? 'APPROVED' : 'STATUS_UPDATED';

    // Record review event in Document Submission History
    await prisma.documentHistory.create({
      data: {
        documentId: document.id,
        version: document.version,
        action,
        status,
        comment: feedback || (status === 'NEEDS_REVISION' ? 'Supervisor flagged document for revision' : `Status set to ${status}`),
        filePath: document.filePath,
        performedById: req.user.id
      }
    });

    // Automated update notification to BA when flagged as Needs Revision (FR-18)
    if (status === 'NEEDS_REVISION') {
      await prisma.notification.create({
        data: {
          userId: existingDoc.uploaderId,
          projectId: existingDoc.projectId,
          message: `Document "${existingDoc.title}" in project "${existingDoc.project?.title || ''}" was flagged as Needs Revision: ${feedback || 'Please review and submit an updated version.'}`
        }
      });
    } else if (status === 'APPROVED') {
      await prisma.notification.create({
        data: {
          userId: existingDoc.uploaderId,
          projectId: existingDoc.projectId,
          message: `Document "${existingDoc.title}" in project "${existingDoc.project?.title || ''}" has been approved by ${req.user.fullName}.`
        }
      });
    }

    res.json(document);
  } catch (error) {
    console.error('Error updating document status:', error);
    res.status(500).json({ message: 'Server error updating document status' });
  }
};

// @desc    Submit a new revision / version of a document
// @route   POST /api/documents/:id/revision
// @access  Private
const submitRevision = async (req, res) => {
  try {
    const { comment } = req.body;
    const uploadedFile = req.file || (req.files && req.files[0]);

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No revised file uploaded' });
    }

    const existingDoc = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });

    if (!existingDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const newVersion = existingDoc.version + 1;
    const newFilePath = `uploads/${uploadedFile.filename}`;

    const updatedDocument = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        version: newVersion,
        filePath: newFilePath,
        status: 'SUPERVISOR_REVIEW'
      }
    });

    // Record revision event in Document Submission History
    await prisma.documentHistory.create({
      data: {
        documentId: updatedDocument.id,
        version: newVersion,
        action: 'REVISED',
        status: 'SUPERVISOR_REVIEW',
        comment: comment || `Uploaded revision v${newVersion}`,
        filePath: newFilePath,
        performedById: req.user.id
      }
    });

    // Automated notification to Project Supervisor
    if (existingDoc.project?.supervisorId) {
      await prisma.notification.create({
        data: {
          userId: existingDoc.project.supervisorId,
          projectId: existingDoc.projectId,
          message: `BA ${req.user.fullName} uploaded revision v${newVersion} for document "${existingDoc.title}".`
        }
      });
    }

    res.json(updatedDocument);
  } catch (error) {
    console.error('Error submitting revision:', error);
    res.status(500).json({ message: 'Server error submitting document revision' });
  }
};

// @desc    Get complete submission history for a document
// @route   GET /api/documents/:id/history
// @access  Private
const getDocumentHistory = async (req, res) => {
  try {
    const history = await prisma.documentHistory.findMany({
      where: { documentId: req.params.id },
      include: {
        performedBy: { select: { fullName: true, role: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(history);
  } catch (error) {
    console.error('Error fetching document history:', error);
    res.status(500).json({ message: 'Server error fetching document history' });
  }
};

module.exports = { 
  uploadDocument, 
  getDocuments, 
  updateDocumentStatus, 
  submitRevision, 
  getDocumentHistory 
};
