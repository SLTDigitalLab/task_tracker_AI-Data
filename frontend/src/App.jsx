import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Documents from './pages/Documents';
import Layout from './components/Layout';

function Landing() {
// ... existing landing page code ... (I will keep it untouched by updating only the relevant parts)
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
      <nav className="glass sticky top-0 z-50 border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg p-1.5 shadow-xs border border-slate-200/80 flex items-center">
            <img src="/slt-logo.png" alt="SLTMOBITEL Logo" className="h-7 w-auto object-contain" />
          </div>
          <span className="font-semibold text-lg tracking-tight">BA Tracker</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/login" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] smooth-transition">Sign in</Link>
          <Link to="/login" className="px-4 py-2 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] smooth-transition hover:opacity-90 shadow-sm">Get Started</Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center text-center space-y-8 pt-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-[var(--border)] px-3 py-1 text-sm bg-[var(--secondary)]/50 text-[var(--muted-foreground)]">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
            Now in beta
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance leading-tight">
            Streamline your project workflow
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl text-balance">
            Centralized task assignment, document submission, and performance tracking for Business Analysts at SLT.
          </p>
          <div className="pt-4 flex gap-4">
            <Link to="/login" className="px-6 py-3 rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] font-medium smooth-transition hover:opacity-90 shadow-md hover-lift">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard Routes with Layout */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="documents" element={<Documents />} />
          <Route path="settings" element={<div className="p-4 border border-dashed border-[var(--border)] rounded-xl text-center text-[var(--muted-foreground)]">Settings module coming soon</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
