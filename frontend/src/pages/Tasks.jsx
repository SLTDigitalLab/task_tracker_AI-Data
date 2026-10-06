import { useState, useEffect } from 'react';
import { Plus, Search, CheckSquare, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bas, setBas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    projectId: '',
    assigneeId: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const isSupervisor = user?.role === 'SUPERVISOR' || user?.role === 'ADMIN';

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [tasksRes, projectsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/tasks`, config),
        axios.get(`${API_BASE_URL}/api/projects`, config)
      ]);
      
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);

      if (isSupervisor) {
        const usersRes = await axios.get(`${API_BASE_URL}/api/auth/users?role=BA`, config);
        setBas(usersRes.data);
      }
    } catch (error) {
      console.error('Error fetching tasks data:', error);
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

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'text-red-600 dark:text-red-400 font-semibold';
      case 'MEDIUM': return 'text-amber-600 dark:text-amber-400 font-semibold';
      case 'LOW': return 'text-green-600 dark:text-green-400 font-semibold';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.projectId || !formData.assigneeId) {
      setError('Project and Assignee are required.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/tasks`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', priority: 'MEDIUM', projectId: '', assigneeId: '' });
      fetchData();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please check your inputs.');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/tasks/${taskId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.project?.title && task.project.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.assignee?.fullName && task.assignee.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
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
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {isSupervisor ? 'Manage, assign, and track tasks across all projects.' : 'Manage your assigned tasks and update statuses.'}
          </p>
        </div>
        {isSupervisor && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90 smooth-transition hover-lift shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-white dark:bg-[#121214] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-white dark:bg-[#121214] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-white dark:bg-[#121214] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121214] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[var(--secondary)]/50 text-[var(--muted-foreground)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Task</th>
                <th className="px-6 py-3 font-medium">Project</th>
                {isSupervisor && <th className="px-6 py-3 font-medium">Assignee</th>}
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={isSupervisor ? 5 : 4} className="px-6 py-8 text-center text-[var(--muted-foreground)]">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[var(--secondary)]/30 smooth-transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="w-4 h-4 text-[var(--muted-foreground)]" />
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{task.title}</p>
                          {task.description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate max-w-[240px]">{task.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">{task.project?.title || 'Unknown'}</td>
                    {isSupervisor && (
                      <td className="px-6 py-4 text-[var(--muted-foreground)]">{task.assignee?.fullName || 'Unknown'}</td>
                    )}
                    <td className="px-6 py-4">
                      <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer ${getStatusColor(task.status)}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="ONGOING">ONGOING</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121214] border border-[var(--border)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="font-semibold text-lg">New Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">×</button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-md border border-red-200 dark:border-red-900/50">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Conduct Stakeholder Interview"
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  value={formData.description} 
                  placeholder="Brief details about the task requirements..."
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" 
                  rows="2" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select 
                  value={formData.priority} 
                  onChange={(e) => setFormData({...formData, priority: e.target.value})} 
                  className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <select 
                  required 
                  value={formData.projectId} 
                  onChange={(e) => setFormData({...formData, projectId: e.target.value})} 
                  className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">-- Select Project --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Business Analyst</label>
                <select 
                  required 
                  value={formData.assigneeId} 
                  onChange={(e) => setFormData({...formData, assigneeId: e.target.value})} 
                  className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">-- Select BA --</option>
                  {bas.map(ba => <option key={ba.id} value={ba.id}>{ba.fullName} ({ba.email})</option>)}
                </select>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-[var(--secondary)] smooth-transition">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 smooth-transition">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
