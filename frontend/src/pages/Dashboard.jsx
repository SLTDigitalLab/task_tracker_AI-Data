import { useState, useEffect } from 'react';
import { Loader2, FolderKanban, CheckSquare, FileText, ArrowRight, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    projectsCount: 0,
    completedProjects: 0,
    pendingTasks: 0,
    completedTasks: 0,
    highPriorityTasks: 0,
    docsCount: 0,
    docsApproved: 0,
    approvalRate: 0,
    recentActivity: [],
    priorityTasksList: []
  });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));
  const isSupervisor = user?.role === 'SUPERVISOR' || user?.role === 'ADMIN';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [projectsRes, tasksRes, docsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/projects`, config),
          axios.get(`${API_BASE_URL}/api/tasks`, config),
          axios.get(`${API_BASE_URL}/api/documents`, config)
        ]);

        const projects = projectsRes.data || [];
        const tasks = tasksRes.data || [];
        const documents = docsRes.data || [];

        // Project calculations
        const projectsCount = projects.length;
        const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;

        // Task calculations
        const pendingTasks = tasks.filter(t => t.status === 'PENDING' || t.status === 'ONGOING').length;
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
        const highPriorityTasks = tasks.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED').length;
        
        // Document calculations
        const docsCount = documents.length;
        const docsApproved = documents.filter(d => d.status === 'APPROVED').length;
        const approvalRate = docsCount > 0 ? Math.round((docsApproved / docsCount) * 100) : 0;

        // Priority Tasks list (filtered for active tasks, sorted by priority HIGH first)
        const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
        const activeTasks = tasks
          .filter(t => t.status !== 'COMPLETED')
          .sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2))
          .slice(0, 5);

        // Activity Feed
        const activity = [
          ...documents.map(d => ({
            id: d.id,
            title: `Document uploaded: "${d.title}"`,
            date: new Date(d.createdAt),
            subtext: `${d.category} • ${d.project?.title || 'Project'}`,
            type: 'doc'
          })),
          ...tasks.filter(t => t.status === 'COMPLETED').map(t => ({
            id: t.id,
            title: `Task completed: "${t.title}"`,
            date: new Date(t.updatedAt || t.createdAt),
            subtext: t.project?.title || 'Project',
            type: 'task'
          })),
          ...projects.map(p => ({
            id: p.id,
            title: `Project created: "${p.title}"`,
            date: new Date(p.createdAt),
            subtext: `Status: ${p.status}`,
            type: 'project'
          }))
        ]
        .sort((a, b) => b.date - a.date)
        .slice(0, 6);

        setStats({
          projectsCount,
          completedProjects,
          pendingTasks,
          completedTasks,
          highPriorityTasks,
          docsCount,
          docsApproved,
          approvalRate,
          recentActivity: activity,
          priorityTasksList: activeTasks
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">High</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">Medium</span>;
      case 'LOW':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">Low</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Greeting & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
          <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-2 flex-wrap mt-0.5">
            <span>Welcome back, <strong className="text-[var(--foreground)] font-semibold">{user?.fullName}</strong></span>
            {user?.inspNumber && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-cyan-950/80 dark:text-cyan-300 border border-sky-200/80 dark:border-cyan-800/80 shadow-2xs">
                {user.inspNumber}
              </span>
            )}
            <span className="text-[var(--muted-foreground)]">• Here is what's happening across your projects today.</span>
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard/projects"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#121214] border border-[var(--border)] hover:bg-[var(--secondary)] smooth-transition shadow-sm"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            Projects
          </Link>
          <Link
            to="/dashboard/tasks"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#121214] border border-[var(--border)] hover:bg-[var(--secondary)] smooth-transition shadow-sm"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Tasks
          </Link>
          <Link
            to="/dashboard/documents"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 smooth-transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            Documents
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Projects KPI */}
        <Link to="/dashboard/projects" className="p-6 rounded-2xl border border-[var(--border)] bg-white dark:bg-[#121214] shadow-sm hover-lift relative overflow-hidden group block">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
              {isSupervisor ? 'Active Projects' : 'Assigned Projects'}
            </h3>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{stats.projectsCount}</span>
            <span className="text-xs text-green-600 font-medium">
              {stats.completedProjects} completed
            </span>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-blue-600 group-hover:translate-x-1 smooth-transition">
            View all projects <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        {/* Tasks KPI */}
        <Link to="/dashboard/tasks" className="p-6 rounded-2xl border border-[var(--border)] bg-white dark:bg-[#121214] shadow-sm hover-lift relative overflow-hidden group block">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Pending Tasks</h3>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{stats.pendingTasks}</span>
            {stats.highPriorityTasks > 0 ? (
              <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {stats.highPriorityTasks} high priority
              </span>
            ) : (
              <span className="text-xs text-[var(--muted-foreground)] font-medium">
                {stats.completedTasks} completed
              </span>
            )}
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-amber-600 group-hover:translate-x-1 smooth-transition">
            Manage tasks <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        {/* Documents KPI */}
        <Link to="/dashboard/documents" className="p-6 rounded-2xl border border-[var(--border)] bg-white dark:bg-[#121214] shadow-sm hover-lift relative overflow-hidden group block sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Documents</h3>
            <div className="p-2 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{stats.docsCount}</span>
            <span className="text-xs text-green-600 font-medium">
              {stats.docsApproved} approved ({stats.approvalRate}%)
            </span>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-green-600 group-hover:translate-x-1 smooth-transition">
            Review documents <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>
      </div>

      {/* Main Grid: Activity & Priority Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-white dark:bg-[#121214] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold">Recent Activity</h3>
              <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
            </div>
            <div className="space-y-4">
              {stats.recentActivity.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-10">No recent activity detected.</p>
              ) : (
                stats.recentActivity.map((act) => (
                  <div key={act.id + act.type} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--secondary)]/40 smooth-transition">
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${act.type === 'doc' ? 'bg-blue-500 ring-4 ring-blue-500/10' : act.type === 'task' ? 'bg-green-500 ring-4 ring-green-500/10' : 'bg-violet-500 ring-4 ring-violet-500/10'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{act.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{act.subtext} • {act.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Priority & Attention Tasks */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-white dark:bg-[#121214] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold">Active Tasks & Priorities</h3>
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Sorted by priority</span>
            </div>
            <div className="space-y-3">
              {stats.priorityTasksList.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-80" />
                  <p className="text-sm text-[var(--muted-foreground)]">All tasks completed! Great work.</p>
                </div>
              ) : (
                stats.priorityTasksList.map((task) => (
                  <Link 
                    key={task.id} 
                    to="/dashboard/tasks"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/20 hover:bg-[var(--secondary)]/60 smooth-transition group"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] smooth-transition truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                        {task.project?.title || 'Project'} • <span className="font-semibold">{task.status}</span>
                      </p>
                    </div>
                    <div>
                      {getPriorityBadge(task.priority)}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
