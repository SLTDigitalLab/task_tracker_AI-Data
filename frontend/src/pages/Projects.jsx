import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Edit2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [bas, setBas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    assigneeId: ''
  });

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

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'ONGOING': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description || '',
        status: project.status,
        assigneeId: project.assigneeId || ''
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        status: 'PENDING',
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
    }
  };

  const filteredProjects = projects.filter(project => {
    const query = searchQuery.toLowerCase();
    const titleMatch = project.title.toLowerCase().includes(query);
    const descMatch = project.description && project.description.toLowerCase().includes(query);
    const assigneeMatch = project.assignee && project.assignee.fullName.toLowerCase().includes(query);
    const supervisorMatch = project.supervisor && project.supervisor.fullName.toLowerCase().includes(query);
    return titleMatch || descMatch || assigneeMatch || supervisorMatch;
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{isSupervisor ? 'All Projects' : 'My Projects'}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {isSupervisor ? 'Manage and track all projects and assign BAs.' : 'View projects currently assigned to you.'}
          </p>
        </div>
        {isSupervisor && (
          <button 
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90 smooth-transition hover-lift shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#121214] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-md border border-[var(--border)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] smooth-transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[var(--secondary)]/50 text-[var(--muted-foreground)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Project</th>
                <th className="px-6 py-3 font-medium">{isSupervisor ? 'Assignee' : 'Supervisor'}</th>
                <th className="px-6 py-3 font-medium">Status</th>
                {isSupervisor && <th className="px-6 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={isSupervisor ? 4 : 3} className="px-6 py-8 text-center text-[var(--muted-foreground)]">
                    No projects found.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-[var(--secondary)]/30 smooth-transition group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--foreground)]">{project.title}</p>
                      <div className="flex gap-3 mt-1 text-xs text-[var(--muted-foreground)]">
                        <span>{project._count?.tasks || 0} tasks</span>
                        <span>{project._count?.documents || 0} docs</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isSupervisor ? (
                          project.assignee ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                                {project.assignee.fullName.charAt(0)}
                              </div>
                              <span className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] smooth-transition">{project.assignee.fullName}</span>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )
                        ) : (
                          project.supervisor ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">
                                {project.supervisor.fullName.charAt(0)}
                              </div>
                              <span className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] smooth-transition">{project.supervisor.fullName}</span>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    {isSupervisor && (
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleOpenModal(project)}
                          className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-md hover:bg-[var(--secondary)] smooth-transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121214] border border-[var(--border)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="font-semibold text-lg">{editingProject ? 'Edit Project' : 'New Project'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" rows="3" />
              </div>
              {editingProject && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                    <option value="PENDING">PENDING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Business Analyst</label>
                <select value={formData.assigneeId} onChange={(e) => setFormData({...formData, assigneeId: e.target.value})} className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                  <option value="">-- Unassigned --</option>
                  {bas.map(ba => (
                    <option key={ba.id} value={ba.id}>{ba.fullName} ({ba.email})</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-[var(--secondary)] smooth-transition">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 smooth-transition">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
