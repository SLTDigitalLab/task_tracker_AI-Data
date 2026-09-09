import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, User, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (username && password) {
      setLoading(true);
      try {
        const { data } = await axios.post('http://localhost:5001/api/auth/login', { username, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-xl mb-4 shadow-lg shadow-[var(--primary)]/20">
            BA
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">Welcome back</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-[#121214] p-8 rounded-2xl border border-[var(--border)] shadow-sm">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-md border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent smooth-transition"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <input
                  type="password"
                  className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent smooth-transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 h-10 px-4 py-2 hover-lift"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
          
          <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            Don't have an account? <Link to="/register" className="text-[var(--foreground)] font-medium hover:underline">Create Account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
