import { useState } from 'react';
import { FileUp, Search, MoreVertical, FileText, Download } from 'lucide-react';

export default function Documents() {
  const [documents] = useState([
    {
      id: 1,
      title: 'BRD_CRM_System_v1.2.pdf',
      category: 'BRD',
      project: 'Project Alpha',
      status: 'APPROVED',
      uploader: 'Alice Smith',
      date: '2026-09-07'
    },
    {
      id: 2,
      title: 'UAT_Test_Cases_Billing.xlsx',
      category: 'UAT',
      project: 'Project Beta',
      status: 'SUPERVISOR_REVIEW',
      uploader: 'John Doe',
      date: '2026-09-08'
    },
    {
      id: 3,
      title: 'Process_Flow_HR.png',
      category: 'Process Flow',
      project: 'Project Gamma',
      status: 'NEEDS_REVISION',
      uploader: 'Alice Smith',
      date: '2026-09-06'
    }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'SUPERVISOR_REVIEW': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'NEEDS_REVISION': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Manage project documentation and review status.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90 smooth-transition hover-lift shadow-sm">
          <FileUp className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      <div className="bg-white dark:bg-[#121214] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="w-full pl-9 pr-4 py-2 rounded-md border border-[var(--border)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] smooth-transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[var(--secondary)]/50 text-[var(--muted-foreground)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Document</th>
                <th className="px-6 py-3 font-medium">Project</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Uploader</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-[var(--secondary)]/30 smooth-transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{doc.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{doc.category} • {new Date(doc.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{doc.project}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                      {doc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">
                    {doc.uploader}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-md hover:bg-[var(--secondary)] smooth-transition">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-md hover:bg-[var(--secondary)] smooth-transition">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
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
