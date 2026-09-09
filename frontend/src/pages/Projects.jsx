import { useState } from 'react';
import { Plus, Search, MoreVertical, Calendar } from 'lucide-react';

export default function Projects() {
  const [projects] = useState([
    {
      id: 1,
      title: 'Project Alpha - BRD Refinement',
      description: 'Refining the Business Requirements Document for the new CRM system.',
      deadline: '2026-10-15',
      status: 'ONGOING',
      assignee: 'Alice Smith',
      tasksCount: 5,
      docsCount: 2
    },
    {
      id: 2,
      title: 'Project Beta - UAT Coordination',
      description: 'Coordinate User Acceptance Testing for the billing module.',
      deadline: '2026-09-30',
      status: 'PENDING',
      assignee: 'John Doe',
      tasksCount: 3,
      docsCount: 0
    },
    {
      id: 3,
      title: 'Project Gamma - Process Mapping',
      description: 'Map out the AS-IS and TO-BE processes for HR onboarding.',
      deadline: '2026-09-12',
      status: 'COMPLETED',
      assignee: 'Alice Smith',
      tasksCount: 8,
      docsCount: 4
    }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'ONGOING': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Manage and track all assigned projects.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90 smooth-transition hover-lift shadow-sm">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="bg-white dark:bg-[#121214] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="w-full pl-9 pr-4 py-2 rounded-md border border-[var(--border)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] smooth-transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[var(--secondary)]/50 text-[var(--muted-foreground)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Project</th>
                <th className="px-6 py-3 font-medium">Assignee</th>
                <th className="px-6 py-3 font-medium">Deadline</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-[var(--secondary)]/30 smooth-transition group">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[var(--foreground)]">{project.title}</p>
                    <div className="flex gap-3 mt-1 text-xs text-[var(--muted-foreground)]">
                      <span>{project.tasksCount} tasks</span>
                      <span>{project.docsCount} docs</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-[10px] font-bold">
                        {project.assignee.charAt(0)}
                      </div>
                      <span className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] smooth-transition">{project.assignee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-md hover:bg-[var(--secondary)] smooth-transition">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
