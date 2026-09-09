export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-6 rounded-xl border border-[var(--border)] bg-white dark:bg-[#121214] shadow-sm hover-lift">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Assigned Projects</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">12</span>
            <span className="text-sm text-green-600 font-medium">+2 this week</span>
          </div>
        </div>
        <div className="p-6 rounded-xl border border-[var(--border)] bg-white dark:bg-[#121214] shadow-sm hover-lift">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Pending Tasks</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">8</span>
            <span className="text-sm text-[var(--muted-foreground)] font-medium">3 high priority</span>
          </div>
        </div>
        <div className="p-6 rounded-xl border border-[var(--border)] bg-white dark:bg-[#121214] shadow-sm hover-lift">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Documents Approved</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">24</span>
            <span className="text-sm text-green-600 font-medium">85% rate</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 rounded-xl border border-[var(--border)] bg-white dark:bg-[#121214] shadow-sm min-h-[300px]">
          <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              <div>
                <p className="text-sm font-medium">Uploaded BRD Document</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">2 hours ago • Project Alpha</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <div>
                <p className="text-sm font-medium">Task Completed: User Research</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Yesterday • Project Beta</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-xl border border-[var(--border)] bg-white dark:bg-[#121214] shadow-sm min-h-[300px]">
          <h3 className="text-lg font-semibold mb-6">Upcoming Deadlines</h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/30 hover:bg-[var(--secondary)] smooth-transition">
                <div>
                  <p className="text-sm font-medium">Process Flow Diagram</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">Project Alpha</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Tomorrow
                </span>
             </div>
             <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/30 hover:bg-[var(--secondary)] smooth-transition">
                <div>
                  <p className="text-sm font-medium">UAT Sign-off</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">Project Gamma</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  In 3 days
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
