import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Loader2, 
  Edit2, 
  Kanban, 
  Table2, 
  ArrowRight, 
  ArrowLeft, 
  Sliders, 
  Info, 
  CheckSquare, 
  FileText, 
  User, 
  Shield, 
  X,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const KANBAN_STAGES = [
  {
    key: 'BACKLOG',
    title: 'Backlog / Not started',
    range: '0%',
    min: 0,
    max: 0,
    defaultProgress: 0,
    whenToMove: 'It is approved and waiting to begin',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    barColor: 'bg-slate-500',
    headerAccent: 'border-t-slate-400',
    dotColor: 'bg-slate-400'
  },
  {
    key: 'DISCOVERY',
    title: 'Discovery / Requirements',
    range: '1–15%',
    min: 1,
    max: 15,
    defaultProgress: 10,
    whenToMove: 'Scope and requirements are being clarified',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    barColor: 'bg-blue-500',
    headerAccent: 'border-t-blue-500',
    dotColor: 'bg-blue-500'
  },
  {
    key: 'ANALYSIS_DESIGN',
    title: 'Analysis / Design',
    range: '16–40%',
    min: 16,
    max: 40,
    defaultProgress: 25,
    whenToMove: 'Requirements are agreed; solution and process are being designed',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    barColor: 'bg-indigo-500',
    headerAccent: 'border-t-indigo-500',
    dotColor: 'bg-indigo-500'
  },
  {
    key: 'BUILD_CONFIG',
    title: 'Build / Configuration',
    range: '41–70%',
    min: 41,
    max: 70,
    defaultProgress: 55,
    whenToMove: 'The approved solution is being implemented',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    barColor: 'bg-amber-500',
    headerAccent: 'border-t-amber-500',
    dotColor: 'bg-amber-500'
  },
  {
    key: 'TESTING_UAT',
    title: 'Testing / UAT',
    range: '71–90%',
    min: 71,
    max: 90,
    defaultProgress: 80,
    whenToMove: 'The build is ready and being verified by the team or users',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    barColor: 'bg-purple-500',
    headerAccent: 'border-t-purple-500',
    dotColor: 'bg-purple-500'
  },
  {
    key: 'HANDOVER_CLOSURE',
    title: 'Handover / Closure',
    range: '91–99%',
    min: 91,
    max: 99,
    defaultProgress: 95,
    whenToMove: 'Acceptance is complete; documentation, training, or transition remains',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    barColor: 'bg-teal-500',
    headerAccent: 'border-t-teal-500',
    dotColor: 'bg-teal-500'
  },
  {
    key: 'DONE',
    title: 'Done',
    range: '100%',
    min: 100,
    max: 100,
    defaultProgress: 100,
    whenToMove: 'Acceptance criteria are met and the business owner has signed off',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    barColor: 'bg-emerald-500',
    headerAccent: 'border-t-emerald-500',
    dotColor: 'bg-emerald-500'
  }
];

export const normalizeStatus = (status) => {
  if (!status) return 'BACKLOG';
  if (status === 'PENDING') return 'BACKLOG';
  if (status === 'ONGOING') return 'BUILD_CONFIG';
  if (status === 'COMPLETED') return 'DONE';
  return status;
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [bas, setBas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Supervisor Create/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'BACKLOG',
    progress: 0,
    assigneeId: ''
  });

  // Status & Progress update modal state
  const [statusModalProject, setStatusModalProject] = useState(null);
  const [targetStatus, setTargetStatus] = useState('BACKLOG');
  const [targetProgress, setTargetProgress] = useState(0);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Drag and Drop state
  const [draggingProjectId, setDraggingProjectId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const isSupervisor = user?.role === 'SUPERVISOR' || user?.role === 'ADMIN';

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data } = await axios.get(`${API_BASE_URL}/api/projects`, config);
      setProjects(data);

      if (isSupervisor) {
        const { data: users } = await axios.get(`${API_BASE_URL}/api/auth/users?role=BA`, config);
        setBas(users);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Status & Progress API call
  const handleUpdateStatusAndProgress = async (projectId, newStatus, newProgress) => {
    try {
      setIsUpdatingStatus(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data: updated } = await axios.patch(
        `${API_BASE_URL}/api/projects/${projectId}/status`,
        { status: newStatus, progress: newProgress },
        config
      );

      // Update state locally
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updated } : p))
      );
      setStatusModalProject(null);
    } catch (error) {
      console.error('Error updating project status:', error);
      alert(error.response?.data?.message || 'Failed to update project status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open the Status & Progress fine-tuning modal
  const handleOpenStatusModal = (project) => {
    const currentStatus = normalizeStatus(project.status);
    const stage = KANBAN_STAGES.find((s) => s.key === currentStatus) || KANBAN_STAGES[0];
    setStatusModalProject(project);
    setTargetStatus(currentStatus);
    setTargetProgress(project.progress ?? stage.defaultProgress);
  };

  // Change stage in the status modal (auto-adjusts default progress)
  const handleSelectStageInModal = (stageKey) => {
    setTargetStatus(stageKey);
    const stage = KANBAN_STAGES.find((s) => s.key === stageKey);
    if (stage) {
      setTargetProgress(stage.defaultProgress);
    }
  };

  // Quick move to previous or next stage
  const handleQuickStep = (e, project, direction) => {
    e.stopPropagation();
    const currentStatus = normalizeStatus(project.status);
    const currentIndex = KANBAN_STAGES.findIndex((s) => s.key === currentStatus);
    const targetIndex = currentIndex + direction;

    if (targetIndex >= 0 && targetIndex < KANBAN_STAGES.length) {
      const nextStage = KANBAN_STAGES[targetIndex];
      handleUpdateStatusAndProgress(project.id, nextStage.key, nextStage.defaultProgress);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, projectId) => {
    e.dataTransfer.setData('text/plain', projectId);
    setDraggingProjectId(projectId);
  };

  const handleDragEnd = () => {
    setDraggingProjectId(null);
    setDragOverColumn(null);
  };

  const handleDrop = (e, stageKey) => {
    e.preventDefault();
    setDragOverColumn(null);
    const projectId = e.dataTransfer.getData('text/plain') || draggingProjectId;
    if (!projectId) return;

    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const currentStatus = normalizeStatus(project.status);
    if (currentStatus === stageKey) return;

    const stage = KANBAN_STAGES.find((s) => s.key === stageKey);
    if (stage) {
      handleUpdateStatusAndProgress(projectId, stageKey, stage.defaultProgress);
    }
  };

  // Supervisor Project Create/Edit Modal
  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description || '',
        status: normalizeStatus(project.status),
        progress: project.progress ?? 0,
        assigneeId: project.assigneeId || ''
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        status: 'BACKLOG',
        progress: 0,
        assigneeId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editingProject) {
        await axios.put(`${API_BASE_URL}/api/projects/${editingProject.id}`, formData, config);
      } else {
        await axios.post(`${API_BASE_URL}/api/projects`, formData, config);
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving project:', error);
      alert(error.response?.data?.message || 'Error saving project');
    }
  };

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = project.title.toLowerCase().includes(query);
    const descMatch = project.description && project.description.toLowerCase().includes(query);
    const assigneeMatch = project.assignee && project.assignee.fullName.toLowerCase().includes(query);
    const supervisorMatch = project.supervisor && project.supervisor.fullName.toLowerCase().includes(query);
    return titleMatch || descMatch || assigneeMatch || supervisorMatch;
  });

  const getStageMeta = (status) => {
    const normalized = normalizeStatus(status);
    return KANBAN_STAGES.find((s) => s.key === normalized) || KANBAN_STAGES[0];
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 dark:bg-[#121214]/70 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              {isSupervisor ? 'Project Workflow' : 'My Projects'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary)]/10 text-[var(--primary)]">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            {isSupervisor 
              ? 'Track lifecycle stages, manage BA assignments, and drag cards to update progress.' 
              : 'Review your assigned projects and update their progress through workflow stages.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* View Mode Toggle */}
          <div className="inline-flex items-center bg-[var(--secondary)]/60 p-1 rounded-xl border border-[var(--border)]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-[#1e1e24] text-[var(--primary)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#1e1e24] text-[var(--primary)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              Table View
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-[var(--border)] bg-white/80 dark:bg-[#18181b]/80 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          {/* New Project Button */}
          {isSupervisor && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-1.5 text-sm font-semibold hover:opacity-90 transition-all shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="relative">
          {/* Workflow Stage Guidance Banner */}
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <strong>Workflow Lifecycle:</strong> Drag cards between columns or click <strong>Update Status</strong> to advance projects through their standard progress ranges.
              </span>
            </div>
            <span className="hidden lg:inline-block font-mono text-[11px] opacity-75">
              7 Standard Stages
            </span>
          </div>

          {/* 7-Column Horizontal Kanban Container */}
          <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start select-none no-scrollbar snap-x">
            {KANBAN_STAGES.map((stage, stageIndex) => {
              const stageProjects = filteredProjects.filter(
                (p) => normalizeStatus(p.status) === stage.key
              );
              const isOver = dragOverColumn === stage.key;

              return (
                <div
                  key={stage.key}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverColumn !== stage.key) setDragOverColumn(stage.key);
                  }}
                  onDragLeave={() => {
                    if (dragOverColumn === stage.key) setDragOverColumn(null);
                  }}
                  onDrop={(e) => handleDrop(e, stage.key)}
                  className={`flex flex-col min-w-[310px] max-w-[310px] rounded-2xl border transition-all duration-200 bg-white/70 dark:bg-[#121214]/80 backdrop-blur-sm shadow-sm ${
                    stage.headerAccent
                  } border-t-4 ${
                    isOver
                      ? 'border-dashed border-[var(--primary)] ring-2 ring-[var(--primary)]/30 bg-[var(--secondary)]/40 scale-[1.01]'
                      : 'border-[var(--border)]'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-[var(--border)] bg-gray-50/50 dark:bg-gray-900/40 rounded-t-xl">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                        <h2 className="font-semibold text-sm text-[var(--foreground)] truncate" title={stage.title}>
                          {stage.title}
                        </h2>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                        {stageProjects.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--border)]/60 text-[11px]">
                      <span className="text-[var(--muted-foreground)]">Suggested progress:</span>
                      <span className={`font-semibold px-2 py-0.5 rounded-md border ${stage.badge}`}>
                        {stage.range}
                      </span>
                    </div>

                    {/* Criteria Info */}
                    <div className="mt-2 text-[11px] text-[var(--muted-foreground)] bg-black/5 dark:bg-white/5 p-2 rounded-lg leading-relaxed">
                      <span className="font-medium text-[var(--foreground)] block mb-0.5">Move when:</span>
                      {stage.whenToMove}
                    </div>
                  </div>

                  {/* Column Droppable Area & Cards */}
                  <div className="p-3 flex flex-col gap-3 min-h-[380px] max-h-[calc(100vh-280px)] overflow-y-auto">
                    {stageProjects.length === 0 ? (
                      <div
                        className={`h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center transition-all ${
                          isOver
                            ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]'
                            : 'border-[var(--border)] text-[var(--muted-foreground)] opacity-60'
                        }`}
                      >
                        <p className="text-xs font-medium">No projects in this stage</p>
                        <p className="text-[10px] mt-0.5">Drag projects here to advance</p>
                      </div>
                    ) : (
                      stageProjects.map((project) => {
                        const progressVal = project.progress ?? stage.defaultProgress;
                        const isFirstStage = stageIndex === 0;
                        const isLastStage = stageIndex === KANBAN_STAGES.length - 1;

                        return (
                          <div
                            key={project.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, project.id)}
                            onDragEnd={handleDragEnd}
                            className={`group relative bg-white dark:bg-[#1a1a1e] border border-[var(--border)] rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing hover:border-[var(--primary)]/70 ${
                              draggingProjectId === project.id ? 'opacity-40 ring-2 ring-[var(--primary)]' : ''
                            }`}
                          >
                            {/* Card Top: Title & Edit */}
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-sm text-[var(--foreground)] leading-snug line-clamp-2">
                                {project.title}
                              </h3>
                              {isSupervisor && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModal(project);
                                  }}
                                  title="Edit Project"
                                  className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-md transition-all"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Description */}
                            {project.description && (
                              <p className="text-xs text-[var(--muted-foreground)] mt-1.5 line-clamp-2 leading-relaxed">
                                {project.description}
                              </p>
                            )}

                            {/* Progress Bar & Click-to-update */}
                            <div 
                              onClick={() => handleOpenStatusModal(project)}
                              title="Click to adjust status & progress"
                              className="mt-3 bg-[var(--secondary)]/40 hover:bg-[var(--secondary)] p-2 rounded-lg cursor-pointer transition-colors border border-[var(--border)]/60"
                            >
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-medium text-[var(--muted-foreground)] flex items-center gap-1">
                                  <Sliders className="w-3 h-3 text-[var(--primary)]" />
                                  Progress
                                </span>
                                <span className="font-bold text-[var(--foreground)] font-mono">
                                  {progressVal}%
                                </span>
                              </div>
                              <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${stage.barColor} transition-all duration-300 rounded-full`}
                                  style={{ width: `${Math.min(100, Math.max(0, progressVal))}%` }}
                                />
                              </div>
                            </div>

                            {/* People Info: Assignee & Supervisor */}
                            <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex flex-col gap-1.5 text-xs">
                              {/* Assignee */}
                              <div className="flex items-center justify-between">
                                <span className="text-[var(--muted-foreground)] flex items-center gap-1 text-[11px]">
                                  <User className="w-3 h-3" />
                                  BA:
                                </span>
                                {project.assignee ? (
                                  <div className="flex items-center gap-1.5 font-medium text-[var(--foreground)] max-w-[170px] truncate">
                                    <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center text-[9px] font-bold shrink-0">
                                      {project.assignee.fullName.charAt(0)}
                                    </div>
                                    <span className="truncate text-xs">{project.assignee.fullName}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic text-[11px]">Unassigned</span>
                                )}
                              </div>

                              {/* Supervisor */}
                              {project.supervisor && (
                                <div className="flex items-center justify-between">
                                  <span className="text-[var(--muted-foreground)] flex items-center gap-1 text-[11px]">
                                    <Shield className="w-3 h-3" />
                                    Lead:
                                  </span>
                                  <span className="font-medium text-[var(--muted-foreground)] text-xs truncate max-w-[170px]">
                                    {project.supervisor.fullName}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Card Footer: Counts & Stage Navigation */}
                            <div className="mt-3 pt-2 border-t border-[var(--border)] flex items-center justify-between gap-1 text-xs">
                              <div className="flex items-center gap-2.5 text-[11px] text-[var(--muted-foreground)]">
                                <span className="flex items-center gap-1" title={`${project._count?.tasks || 0} tasks`}>
                                  <CheckSquare className="w-3 h-3 text-[var(--primary)]" />
                                  {project._count?.tasks || 0}
                                </span>
                                <span className="flex items-center gap-1" title={`${project._count?.documents || 0} documents`}>
                                  <FileText className="w-3 h-3 text-[var(--secondary-foreground)]" />
                                  {project._count?.documents || 0}
                                </span>
                              </div>

                              {/* Quick Move Buttons */}
                              <div className="flex items-center gap-1">
                                {!isFirstStage && (
                                  <button
                                    onClick={(e) => handleQuickStep(e, project, -1)}
                                    title={`Move back to ${KANBAN_STAGES[stageIndex - 1]?.title}`}
                                    className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all"
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenStatusModal(project);
                                  }}
                                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-all"
                                >
                                  Update
                                </button>
                                {!isLastStage && (
                                  <button
                                    onClick={(e) => handleQuickStep(e, project, 1)}
                                    title={`Advance to ${KANBAN_STAGES[stageIndex + 1]?.title}`}
                                    className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-[#121214] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[var(--secondary)]/50 text-[var(--muted-foreground)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Project</th>
                  <th className="px-6 py-3 font-semibold">Workflow Stage</th>
                  <th className="px-6 py-3 font-semibold">Progress</th>
                  <th className="px-6 py-3 font-semibold">Assignee (BA)</th>
                  <th className="px-6 py-3 font-semibold">Supervisor</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[var(--muted-foreground)]">
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => {
                    const stageMeta = getStageMeta(project.status);
                    const progressVal = project.progress ?? stageMeta.defaultProgress;

                    return (
                      <tr key={project.id} className="hover:bg-[var(--secondary)]/30 smooth-transition group">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[var(--foreground)]">{project.title}</p>
                          <div className="flex gap-3 mt-1 text-xs text-[var(--muted-foreground)]">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3" />
                              {project._count?.tasks || 0} tasks
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {project._count?.documents || 0} docs
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${stageMeta.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stageMeta.dotColor}`} />
                            {stageMeta.title}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-36">
                            <div className="flex justify-between text-xs font-mono font-medium mb-1">
                              <span>{progressVal}%</span>
                              <span className="text-[10px] text-[var(--muted-foreground)]">{stageMeta.range}</span>
                            </div>
                            <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${stageMeta.barColor} rounded-full`}
                                style={{ width: `${Math.min(100, Math.max(0, progressVal))}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {project.assignee ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold">
                                {project.assignee.fullName.charAt(0)}
                              </div>
                              <span className="text-[var(--foreground)]">{project.assignee.fullName}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {project.supervisor ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">
                                {project.supervisor.fullName.charAt(0)}
                              </div>
                              <span className="text-[var(--foreground)]">{project.supervisor.fullName}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenStatusModal(project)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-all"
                            >
                              Update Status
                            </button>
                            {isSupervisor && (
                              <button
                                onClick={() => handleOpenModal(project)}
                                title="Edit Project Details"
                                className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)] transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STATUS & PROGRESS UPDATE MODAL */}
      {statusModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121214] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
              <div>
                <h3 className="font-bold text-lg text-[var(--foreground)]">Update Project Stage & Progress</h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 font-medium">
                  Project: <span className="text-[var(--foreground)] font-semibold">{statusModalProject.title}</span>
                </p>
              </div>
              <button
                onClick={() => setStatusModalProject(null)}
                className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Select Stage */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2.5">
                  Select Workflow Stage
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {KANBAN_STAGES.map((s) => {
                    const isSelected = targetStatus === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => handleSelectStageInModal(s.key)}
                        className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-2 ring-[var(--primary)]/30 font-semibold'
                            : 'border-[var(--border)] hover:bg-[var(--secondary)]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${s.dotColor}`} />
                            {s.title}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${s.badge}`}>
                            {s.range}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-1">
                          {s.whenToMove}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stage Guidance Banner */}
              {(() => {
                const activeStage = KANBAN_STAGES.find((s) => s.key === targetStatus) || KANBAN_STAGES[0];
                return (
                  <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-950 dark:text-blue-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Move project to &quot;{activeStage.title}&quot; when:</span>
                    </div>
                    <p className="pl-5 text-blue-800 dark:text-blue-300">
                      {activeStage.whenToMove}
                    </p>
                    <p className="pl-5 text-[11px] text-blue-700/80 dark:text-blue-400">
                      Suggested progress range: <strong>{activeStage.range}</strong>
                    </p>
                  </div>
                );
              })()}

              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Progress Percentage
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const activeStage = KANBAN_STAGES.find((s) => s.key === targetStatus);
                        if (activeStage) setTargetProgress(activeStage.defaultProgress);
                      }}
                      className="text-[11px] text-[var(--primary)] hover:underline font-medium"
                    >
                      Snap to default ({KANBAN_STAGES.find((s) => s.key === targetStatus)?.defaultProgress}%)
                    </button>
                    <span className="text-base font-bold font-mono text-[var(--foreground)] bg-[var(--secondary)] px-2.5 py-0.5 rounded-md">
                      {targetProgress}%
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={targetProgress}
                  onChange={(e) => setTargetProgress(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--primary)] cursor-pointer h-2 bg-black/10 dark:bg-white/10 rounded-lg"
                />

                <div className="flex justify-between text-[11px] text-[var(--muted-foreground)] px-0.5">
                  <span>0% (Backlog)</span>
                  <span>50%</span>
                  <span>100% (Done)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50/60 dark:bg-gray-900/60 border-t border-[var(--border)] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStatusModalProject(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--secondary)] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatusAndProgress(statusModalProject.id, targetStatus, targetProgress)}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
              >
                {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Stage & Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPERVISOR CREATE / EDIT PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121214] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg text-[var(--foreground)]">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Project Title</label>
                <input 
                  required 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" 
                  placeholder="e.g. Enterprise CRM Integration"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" 
                  rows="3" 
                  placeholder="Summary of project goals and scope..."
                />
              </div>

              {/* Stage Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Initial / Current Stage</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    const stage = KANBAN_STAGES.find((s) => s.key === newStatus);
                    setFormData({
                      ...formData,
                      status: newStatus,
                      progress: stage ? stage.defaultProgress : formData.progress
                    });
                  }} 
                  className="w-full rounded-xl border border-[var(--border)] bg-white dark:bg-[#1a1a1e] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {KANBAN_STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.title} ({s.range})
                    </option>
                  ))}
                </select>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Progress</label>
                  <span className="font-mono text-sm font-bold bg-[var(--secondary)] px-2 py-0.5 rounded text-[var(--secondary-foreground)]">
                    {formData.progress}%
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value, 10) })}
                  className="w-full accent-[var(--primary)] cursor-pointer"
                />
              </div>

              {/* Assign BA */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Assign Business Analyst</label>
                <select 
                  value={formData.assigneeId} 
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })} 
                  className="w-full rounded-xl border border-[var(--border)] bg-white dark:bg-[#1a1a1e] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">-- Unassigned --</option>
                  {bas.map((ba) => (
                    <option key={ba.id} value={ba.id}>
                      {ba.fullName} ({ba.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-[var(--border)]">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--secondary)] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-all shadow-sm"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
