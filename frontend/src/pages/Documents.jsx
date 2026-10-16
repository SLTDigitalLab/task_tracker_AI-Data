import { useState, useEffect } from 'react';
import { 
  FileUp, Search, FileText, Download, Loader2, AlertCircle, 
  Folder, FolderOpen, History, RotateCcw, CheckCircle2, AlertTriangle, 
  Clock, X, Check, MessageSquare, Shield, Trash2
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Active selected document for modals
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docHistory, setDocHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Filters and navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Error handling
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [uploadData, setUploadData] = useState({
    title: '',
    category: 'BRD',
    projectId: '',
    comment: '',
    file: null
  });

  const [revisionData, setRevisionData] = useState({
    comment: '',
    file: null
  });

  const [reviewData, setReviewData] = useState({
    status: 'NEEDS_REVISION',
    feedback: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const isSupervisor = user?.role === 'SUPERVISOR' || user?.role === 'ADMIN';

  const categories = [
    { id: 'BRD', name: 'BRD', desc: 'Business Requirements', color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200/80' },
    { id: 'Process Flow', name: 'Process Flow', desc: 'System & Workflow Diagrams', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80' },
    { id: 'UAT', name: 'UAT', desc: 'User Acceptance Testing', color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200/80' },
    { id: 'Meeting Minutes', name: 'Meeting Minutes', desc: 'Stakeholder Discussions', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200/80' },
    { id: 'Other', name: 'Other', desc: 'Supplementary Documents', color: 'text-slate-600 bg-slate-50 dark:bg-slate-900/40 border-slate-200/80' }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [docsRes, projectsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/documents`, config),
        axios.get(`${API_BASE_URL}/api/projects`, config)
      ]);
      
      setDocuments(docsRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/70">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'NEEDS_REVISION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/70">
            <AlertTriangle className="w-3.5 h-3.5" /> Needs Revision
          </span>
        );
      case 'SUPERVISOR_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/70">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/70">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  // Upload new document handler (FR 12/13)
  const handleUpload = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!uploadData.file || !uploadData.projectId || !uploadData.title) {
      setModalError('Please fill in all required fields and select a file.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('document', uploadData.file);
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('category', uploadData.category);
    formData.append('projectId', uploadData.projectId);
    if (uploadData.comment) formData.append('comment', uploadData.comment);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/documents`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsUploadModalOpen(false);
      setUploadData({ title: '', category: 'BRD', projectId: '', comment: '', file: null });
      fetchData();
    } catch (err) {
      console.error('Error uploading document:', err);
      setModalError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setSubmitting(false);
    }
  };

  // Supervisor Review / Flag as Needs Revision (FR 18)
  const handleOpenReviewModal = (doc, statusToSet = 'NEEDS_REVISION') => {
    setSelectedDoc(doc);
    setReviewData({
      status: statusToSet,
      feedback: ''
    });
    setModalError('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;

    setSubmitting(true);
    setModalError('');
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/documents/${selectedDoc.id}/status`, {
        status: reviewData.status,
        feedback: reviewData.feedback
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsReviewModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error submitting review:', err);
      setModalError('Failed to submit review status.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Revision Handler (FR 27)
  const handleOpenRevisionModal = (doc) => {
    setSelectedDoc(doc);
    setRevisionData({ comment: '', file: null });
    setModalError('');
    setIsRevisionModalOpen(true);
  };

  const handleSubmitRevision = async (e) => {
    e.preventDefault();
    if (!selectedDoc || !revisionData.file) {
      setModalError('Please choose the revised file to upload.');
      return;
    }

    setSubmitting(true);
    setModalError('');
    const formData = new FormData();
    formData.append('document', revisionData.file);
    formData.append('file', revisionData.file);
    formData.append('comment', revisionData.comment || `Revision v${(selectedDoc.version || 1) + 1}`);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/documents/${selectedDoc.id}/revision`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsRevisionModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error submitting revision:', err);
      setModalError(err.response?.data?.message || 'Failed to submit revision.');
    } finally {
      setSubmitting(false);
    }
  };

  // View Submission History (FR 27)
  const handleOpenHistoryModal = async (doc) => {
    setSelectedDoc(doc);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/documents/${doc.id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocHistory(res.data);
    } catch (err) {
      console.error('Error fetching document history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDownload = (filePath) => {
    if (!filePath) return;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      window.open(filePath, '_blank');
      return;
    }
    const cleanPath = filePath.replace(/\\/g, '/');
    const publicUrl = `${API_BASE_URL}/${cleanPath}`;
    window.open(publicUrl, '_blank');
  };

  const handleOpenDeleteModal = (doc) => {
    setDocumentToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/documents/${documentToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(prev => prev.filter(d => d.id !== documentToDelete.id));
      setIsDeleteModalOpen(false);
      setDocumentToDelete(null);
    } catch (err) {
      console.error('Error deleting document:', err);
      alert(err.response?.data?.message || 'Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered documents
  const filteredDocuments = documents.filter(doc => {
    const projectTitle = doc.project?.title?.toLowerCase() || '';
    const matchesProjectSearch = !projectSearch.trim() || projectTitle.includes(projectSearch.toLowerCase().trim());
    const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesDocSearch = !searchQuery.trim() || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.project?.title && doc.project.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.uploader?.fullName && doc.uploader.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesProjectSearch && matchesCategory && matchesDocSearch;
  });

  // Calculate folder counts based on project search
  const projectScopedDocs = !projectSearch.trim()
    ? documents 
    : documents.filter(d => d.project?.title?.toLowerCase().includes(projectSearch.toLowerCase().trim()));

  const getFolderStats = (catId) => {
    const docsInCat = projectScopedDocs.filter(d => d.category === catId);
    const approved = docsInCat.filter(d => d.status === 'APPROVED').length;
    const needsRev = docsInCat.filter(d => d.status === 'NEEDS_REVISION').length;
    return { count: docsInCat.length, approved, needsRev };
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/75 dark:bg-[#06242b]/80 backdrop-blur-md p-6 rounded-2xl border border-sky-100/80 dark:border-cyan-900/50 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 text-white shadow-xs">
              <FolderOpen className="w-5 h-5" />
            </span>
            Document Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Organize project categories, manage supervisor revisions, and track submission history.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white px-4 py-2.5 text-sm font-semibold smooth-transition hover-lift shadow-sm shadow-sky-500/20"
          >
            <FileUp className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Project Search Bar & Category Folder View */}
      <div className="bg-white/80 dark:bg-[#06242b]/80 backdrop-blur-md p-5 rounded-2xl border border-sky-100/80 dark:border-cyan-900/50 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
            <input 
              type="text" 
              placeholder="Search projects to filter folders..." 
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-sky-200/80 dark:border-cyan-900 bg-white dark:bg-[#082f38] font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
            {projectSearch && (
              <button 
                onClick={() => setProjectSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear project search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Folder className="w-4 h-4 text-sky-500" />
            <span>Folder View ({projectScopedDocs.length} documents)</span>
          </div>
        </div>

        {/* Category Folders Grid (FR 12/13) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`p-3.5 rounded-xl border text-left smooth-transition hover-lift flex flex-col justify-between ${selectedCategory === 'ALL' ? 'bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-950/40 dark:to-emerald-950/40 border-sky-400 dark:border-sky-500 shadow-xs ring-2 ring-sky-500/20' : 'bg-white/60 dark:bg-[#0a353f]/40 border-sky-100 dark:border-cyan-900/40 hover:bg-sky-50/40'}`}
          >
              <div className="flex items-center justify-between">
                <Folder className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/50">
                  {projectScopedDocs.length}
                </span>
              </div>
              <div className="mt-3">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">All Folders</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Everything</p>
              </div>
            </button>

            {categories.map((cat) => {
              const stats = getFolderStats(cat.id);
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3.5 rounded-xl border text-left smooth-transition hover-lift flex flex-col justify-between ${isSelected ? 'bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-950/40 dark:to-emerald-950/40 border-sky-400 dark:border-sky-500 shadow-xs ring-2 ring-sky-500/20' : 'bg-white/60 dark:bg-[#0a353f]/40 border-sky-100 dark:border-cyan-900/40 hover:bg-emerald-50/30'}`}
                >
                  <div className="flex items-center justify-between">
                    <Folder className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-full bg-emerald-100/70 dark:bg-emerald-950/50">
                      {stats.count}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{cat.name}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {stats.needsRev > 0 && (
                        <span className="text-amber-600 font-medium">({stats.needsRev} rev)</span>
                      )}
                      <span>{cat.desc}</span>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Search & Active Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by title, project, or uploader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-sky-200/80 dark:border-cyan-900 bg-white/80 dark:bg-[#06242b]/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
          />
        </div>

        {selectedCategory !== 'ALL' && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-medium">
            <span>Folder: <strong>{selectedCategory}</strong></span>
            <button onClick={() => setSelectedCategory('ALL')} className="hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Documents Table */}
      <div className="bg-white/85 dark:bg-[#06242b]/85 backdrop-blur-md border border-sky-100/80 dark:border-cyan-900/50 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-sky-50/50 dark:bg-sky-950/30 text-slate-600 dark:text-slate-400 border-b border-sky-100 dark:border-cyan-900/40">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Document & Category</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Project Folder</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Version</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Review Status</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Uploader</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/60 dark:divide-cyan-900/30">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <FolderOpen className="w-10 h-10 mx-auto text-sky-400/60 mb-3" />
                    <p className="font-medium text-base">No documents found in this folder</p>
                    <p className="text-xs text-slate-400 mt-1">Upload a document or change your search filter.</p>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-sky-50/40 dark:hover:bg-cyan-950/20 smooth-transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500/10 to-emerald-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/50">
                          <FileText className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 transition-colors">
                            {doc.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="font-medium text-emerald-700 dark:text-emerald-400">📁 {doc.category}</span>
                            <span>•</span>
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {doc.project?.title || 'Unknown Project'}
                    </td>

                    {/* Version Badge (FR 27) */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200">
                        v{doc.version || 1}
                      </span>
                    </td>

                    {/* Review Status (FR 18) */}
                    <td className="px-6 py-4">
                      {getStatusBadge(doc.status)}
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs">
                      {doc.uploader?.fullName || 'Unknown'}
                    </td>

                    {/* Actions: Download, History, Supervisor Review, BA Revision */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Download button */}
                        <button 
                          onClick={() => handleDownload(doc.filePath)}
                          className="p-1.5 text-slate-600 hover:text-sky-600 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800 smooth-transition"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* History Timeline button (FR 27) */}
                        <button 
                          onClick={() => handleOpenHistoryModal(doc)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 smooth-transition"
                          title="Submission History & Audit Trail"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* BA: Submit Revision button (FR 27) */}
                        {!isSupervisor && (
                          <button 
                            onClick={() => handleOpenRevisionModal(doc)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-md smooth-transition"
                            title="Upload New Version"
                          >
                            <RotateCcw className="w-3 h-3" /> Revise
                          </button>
                        )}

                        {/* Supervisor: Review / Flag Needs Revision (FR 18) */}
                        {isSupervisor && (
                          <div className="flex items-center gap-1">
                            {doc.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleOpenReviewModal(doc, 'APPROVED')}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg smooth-transition"
                                title="Approve Document"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenReviewModal(doc, 'NEEDS_REVISION')}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 rounded-md smooth-transition"
                              title="Flag for Revision with Feedback"
                            >
                              <AlertTriangle className="w-3 h-3" /> Flag Revision
                            </button>
                          </div>
                        )}

                        {/* Delete button (FR 3) */}
                        <button 
                          onClick={() => handleOpenDeleteModal(doc)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 smooth-transition"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------- MODALS -------------------- */}

      {/* 1. Upload Modal (FR 12/13) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#06242b] border border-sky-200/80 dark:border-cyan-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-sky-100 dark:border-cyan-900/50 flex justify-between items-center bg-gradient-to-r from-sky-50/60 to-emerald-50/60 dark:from-sky-950/30 dark:to-emerald-950/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500 text-white shadow-xs">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Upload Document</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add documentation to project category folders</p>
                </div>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {modalError && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {modalError}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Document Title</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Core Banking System Architecture"
                  value={uploadData.title} 
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})} 
                  className="w-full rounded-xl border border-sky-200 dark:border-cyan-900 bg-white/80 dark:bg-[#082f38] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Project Folder</label>
                  <select 
                    required 
                    value={uploadData.projectId} 
                    onChange={(e) => setUploadData({...uploadData, projectId: e.target.value})} 
                    className="w-full rounded-xl border border-sky-200 dark:border-cyan-900 bg-white/80 dark:bg-[#082f38] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Category Folder</label>
                  <select 
                    required 
                    value={uploadData.category} 
                    onChange={(e) => setUploadData({...uploadData, category: e.target.value})} 
                    className="w-full rounded-xl border border-sky-200 dark:border-cyan-900 bg-white/80 dark:bg-[#082f38] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="BRD">📁 BRD (Business Requirements)</option>
                    <option value="Process Flow">📁 Process Flow</option>
                    <option value="UAT">📁 UAT (User Acceptance Testing)</option>
                    <option value="Meeting Minutes">📁 Meeting Minutes</option>
                    <option value="Other">📁 Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Submission Notes (Optional)</label>
                <textarea 
                  placeholder="Notes about this submission or changes included..."
                  value={uploadData.comment} 
                  onChange={(e) => setUploadData({...uploadData, comment: e.target.value})} 
                  className="w-full rounded-xl border border-sky-200 dark:border-cyan-900 bg-white/80 dark:bg-[#082f38] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  rows="2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">File Attachment</label>
                <input 
                  required 
                  type="file" 
                  onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})} 
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-600 cursor-pointer" 
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-sky-100 dark:border-cyan-900/50">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 smooth-transition">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 text-white hover:opacity-90 smooth-transition flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Supervisor Review Modal (FR 18) */}
      {isReviewModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#06242b] border border-sky-200/80 dark:border-cyan-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-sky-100 dark:border-cyan-900/50 flex justify-between items-center bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Review Document</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[260px]">{selectedDoc.title}</p>
                </div>
              </div>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
                  {modalError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Set Review Status</label>
                <select 
                  value={reviewData.status} 
                  onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                  className="w-full rounded-xl border border-sky-200 dark:border-cyan-900 bg-white/80 dark:bg-[#082f38] px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="NEEDS_REVISION">⚠️ Needs Revision (Notify BA)</option>
                  <option value="APPROVED">✅ Approved</option>
                  <option value="SUPERVISOR_REVIEW">🕒 In Review</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {reviewData.status === 'NEEDS_REVISION' ? 'Revision Instructions for BA' : 'Feedback / Remarks'}
                </label>
                <textarea 
                  required={reviewData.status === 'NEEDS_REVISION'}
                  placeholder={reviewData.status === 'NEEDS_REVISION' ? "Specify the exact sections, diagrams, or requirements that require revision..." : "Optional reviewer comments..."}
                  value={reviewData.feedback} 
                  onChange={(e) => setReviewData({...reviewData, feedback: e.target.value})} 
                  className="w-full rounded-xl border border-sky-200 dark:border-cyan-900 bg-white/80 dark:bg-[#082f38] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  rows="3"
                />
              </div>

              <div className="pt-3 flex gap-3 justify-end border-t border-sky-100 dark:border-cyan-900/50">
                <button type="button" onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 smooth-transition">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-600 to-red-600 text-white hover:opacity-90 smooth-transition flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save & Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Submit Revision Modal (FR 27) */}
      {isRevisionModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#06242b] border border-sky-200/80 dark:border-cyan-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-sky-100 dark:border-cyan-900/50 flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Submit Revision</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[260px]">{selectedDoc.title} (v{(selectedDoc.version || 1) + 1})</p>
                </div>
              </div>
              <button onClick={() => setIsRevisionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
                  {modalError}
                </div>
              )}

              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-sky-800">
                Uploading a revision will increment the document to <strong>v{(selectedDoc.version || 1) + 1}</strong> and automatically notify the supervisor for re-review.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Revised File</label>
                <input 
                  required 
                  type="file" 
                  onChange={(e) => setRevisionData({...revisionData, file: e.target.files[0]})} 
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Revision Notes / Changes Made</label>
                <textarea 
                  placeholder="Describe the changes made in this revision..."
                  value={revisionData.comment} 
                  onChange={(e) => setRevisionData({...revisionData, comment: e.target.value})} 
                  className="w-full rounded-xl border border-sky-200 dark:border-cyan-900 bg-white/80 dark:bg-[#082f38] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  rows="3"
                />
              </div>

              <div className="pt-3 flex gap-3 justify-end border-t border-sky-100 dark:border-cyan-900/50">
                <button type="button" onClick={() => setIsRevisionModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 smooth-transition">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 smooth-transition flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Revision v{(selectedDoc.version || 1) + 1}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Complete Document Submission History Modal (FR 27) */}
      {isHistoryModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#06242b] border border-sky-200/80 dark:border-cyan-900 rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-sky-100 dark:border-cyan-900/50 flex justify-between items-center bg-sky-50/60 dark:bg-sky-950/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-600 text-white shadow-xs">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Document Submission History</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Audit trail for: <strong>{selectedDoc.title}</strong> (Current v{selectedDoc.version || 1})
                  </p>
                </div>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {historyLoading ? (
                <div className="flex py-12 items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                </div>
              ) : docHistory.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-sm">No recorded history entries found for this document.</p>
              ) : (
                <div className="relative pl-6 border-l-2 border-sky-200 dark:border-cyan-900 space-y-6">
                  {docHistory.map((item) => (
                    <div key={item.id} className="relative group">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#06242b] ${item.action === 'APPROVED' ? 'bg-emerald-500' : item.action === 'NEEDS_REVISION' ? 'bg-amber-500' : item.action === 'REVISED' ? 'bg-teal-500' : 'bg-sky-500'}`} />

                      <div className="bg-sky-50/50 dark:bg-[#0a353f]/40 p-4 rounded-2xl border border-sky-100 dark:border-cyan-900/40 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#082f38] border border-sky-200/80 text-sky-700 dark:text-sky-300">
                              v{item.version}
                            </span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {item.action === 'INITIAL_UPLOAD' ? 'Initial Submission' : item.action === 'REVISED' ? 'Revised Document Uploaded' : item.action === 'NEEDS_REVISION' ? 'Flagged as Needs Revision' : item.action === 'APPROVED' ? 'Document Approved' : 'Status Updated'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {item.comment && (
                          <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-[#06242b]/60 p-2.5 rounded-xl border border-sky-100/60 flex items-start gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                            <span>{item.comment}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                          <span>Action by: <strong>{item.performedBy?.fullName}</strong> ({item.performedBy?.role})</span>
                          {item.filePath && (
                            <button
                              onClick={() => handleDownload(item.filePath)}
                              className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
                            >
                              <Download className="w-3.5 h-3.5" /> Download File (v{item.version})
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-sky-100 dark:border-cyan-900/50 flex justify-end bg-sky-50/30">
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-200/80 hover:bg-slate-300/80 smooth-transition"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {isDeleteModalOpen && documentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#06242b] border border-rose-200/80 dark:border-rose-900/60 rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-rose-100 dark:border-rose-900/40 flex justify-between items-center bg-rose-50/50 dark:bg-rose-950/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500 text-white shadow-xs">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Delete Document</h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400">Permanently remove this file</p>
                </div>
              </div>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">"{documentToDelete.title}"</strong>?
              </p>
              <div className="p-3 bg-slate-50 dark:bg-[#0a353f]/50 rounded-xl text-xs space-y-1 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-cyan-900/40">
                <div><strong>Project:</strong> {documentToDelete.project?.title || 'N/A'}</div>
                <div><strong>Category:</strong> {documentToDelete.category}</div>
                <div><strong>Version:</strong> v{documentToDelete.version}</div>
              </div>
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                This will permanently remove the document and its version history.
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-cyan-900/50 flex justify-end gap-3 bg-slate-50/50 dark:bg-[#082f38]/30">
              <button 
                type="button" 
                disabled={deleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-800 smooth-transition"
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={deleting}
                onClick={handleDeleteDocument}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white smooth-transition shadow-xs flex items-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting...' : 'Delete Document'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
