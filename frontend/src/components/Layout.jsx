import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FileText, CheckSquare, Settings, LogOut, Bell, Shield, Menu, X, CheckCircle2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Refresh user profile in background to populate latest fields such as inspNumber
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data) {
          const updatedUser = { ...parsedUser, ...res.data };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }).catch(err => {
        console.error('Error fetching user profile:', err);
      });
    }
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const isSupervisor = user?.role === 'SUPERVISOR' || user?.role === 'ADMIN';
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: isSupervisor ? 'All Projects' : 'My Projects', path: '/dashboard/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Documents', path: '/dashboard/documents', icon: FileText },
  ];

  if (isSupervisor) {
    navItems.push({ name: 'System Settings', path: '/dashboard/settings', icon: Settings });
  }

  return (
    <div className="flex h-screen bg-transparent text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-[var(--primary-foreground)]">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-sky-950/40 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/90 dark:bg-[#06242b]/95 backdrop-blur-xl border-r border-sky-200/60 dark:border-cyan-900/50 shadow-sm
        flex flex-col h-full
        transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-sky-100 dark:border-cyan-900/40">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="bg-white rounded-lg p-1.5 shadow-xs border border-slate-200/80 flex items-center justify-center">
              <img 
                src="/slt-logo.png" 
                alt="SLTMOBITEL Logo" 
                className="h-7 w-auto object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-[var(--foreground)] leading-none">BA Tracker</span>
              <span className="text-[10px] font-medium text-[var(--muted-foreground)] mt-0.5">SLTMOBITEL</span>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-1.5 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto min-h-0">
          <div className="mb-4 px-3">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase">Menu</p>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium smooth-transition
                  ${isActive 
                    ? 'bg-sky-100/70 text-sky-900 dark:bg-cyan-950/60 dark:text-cyan-200 font-semibold shadow-2xs' 
                    : 'text-[var(--muted-foreground)] hover:bg-sky-50/60 hover:text-[var(--foreground)]'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600 dark:text-cyan-400' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-3.5 shrink-0 border-t border-sky-100 dark:border-cyan-900/40 bg-white/50 dark:bg-[#06242b]/50 space-y-2">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-sky-50/80 dark:bg-cyan-950/40 border border-sky-200/70 dark:border-cyan-900/50 shadow-2xs">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-600 to-teal-600 flex items-center justify-center text-xs text-white font-bold shrink-0 shadow-xs">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col min-w-0 flex-1 justify-center">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
                {user?.fullName || 'User'}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {user?.inspNumber && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800 dark:bg-cyan-900/80 dark:text-cyan-200 border border-sky-300/70 dark:border-cyan-700/60 leading-none">
                    {user.inspNumber}
                  </span>
                )}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 leading-none">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="flex w-full items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 border border-transparent hover:border-red-200/60 smooth-transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-sky-200/50 dark:border-cyan-900/40 flex items-center justify-between px-6 sm:px-8 bg-white/70 dark:bg-[#06242b]/70 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="bg-white rounded-md p-1 shadow-xs border border-slate-200/80 flex items-center">
                <img src="/slt-logo.png" alt="SLTMOBITEL" className="h-6 w-auto object-contain" />
              </div>
            </div>
            <h2 className="text-xl font-semibold capitalize tracking-tight flex items-center gap-2">
              {location.pathname.split('/').pop() || 'Dashboard'}
              {isSupervisor && <Shield className="w-4 h-4 text-blue-500" title="Supervisor Privileges" />}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--muted-foreground)]">
                Welcome, <strong className="text-[var(--foreground)] font-semibold">{user?.fullName || 'User'}</strong>
              </span>
              {user?.inspNumber && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-cyan-950/80 dark:text-cyan-300 border border-sky-200/80 dark:border-cyan-800/80 shadow-2xs">
                  {user.inspNumber}
                </span>
              )}
            </div>

            {/* Notification Dropdown Button */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] smooth-transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#121214] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-xs text-[var(--muted-foreground)]">No notifications yet.</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-3 text-xs flex items-start justify-between gap-3 smooth-transition ${!n.isRead ? 'bg-[var(--secondary)]/40' : 'opacity-75'}`}
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-[var(--foreground)]">{n.message}</p>
                            <p className="text-[10px] text-[var(--muted-foreground)]">
                              {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {!n.isRead && (
                            <button 
                              onClick={() => handleMarkAsRead(n.id)}
                              className="text-[var(--primary)] hover:opacity-80 p-1"
                              title="Mark as read"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 border border-white dark:border-gray-800 shadow-sm cursor-pointer hover-lift flex items-center justify-center text-xs text-white font-bold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
