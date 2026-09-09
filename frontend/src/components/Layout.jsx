import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckSquare, Settings, LogOut, Bell, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: CheckSquare },
    { name: 'Documents', href: '/dashboard/documents', icon: FileText },
    // Only show settings to Supervisor/Admin
    ...(user?.role === 'SUPERVISOR' || user?.role === 'ADMIN' ? [{ name: 'Settings', href: '/dashboard/settings', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      <aside className="w-64 border-r border-[var(--border)] flex flex-col bg-[var(--background)] sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold tracking-tighter shadow-sm">
              BA
            </div>
            <span className="font-semibold tracking-tight text-lg">Task Tracker</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md smooth-transition ${
                  isActive
                    ? 'bg-[var(--secondary)] text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]/50 hover:text-[var(--foreground)]'
                }`}
              >
                <item.icon
                  className={`flex-shrink-0 mr-3 h-5 w-5 smooth-transition ${
                    isActive ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <button onClick={handleLogout} className="flex w-full items-center px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] rounded-md hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 smooth-transition">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-8 bg-white/50 dark:bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-semibold capitalize tracking-tight flex items-center gap-2">
            {location.pathname.split('/').pop() || 'Dashboard'}
            {user?.role === 'SUPERVISOR' && <Shield className="w-5 h-5 text-blue-500" title="Supervisor Privileges" />}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[var(--muted-foreground)] hidden sm:block">
              Welcome, {user?.fullName || 'User'}
            </span>
            <button className="p-2 rounded-full text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] smooth-transition">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 border border-white dark:border-gray-800 shadow-sm cursor-pointer hover-lift flex items-center justify-center text-xs text-white font-bold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
