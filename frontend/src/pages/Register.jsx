import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, KeyRound, ArrowRight, Loader2, Mail, CreditCard, Briefcase, Building, Hash } from 'lucide-react';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    inspNumber: '',
    nic: '',
    designation: '',
    department: '',
    email: '',
    username: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await axios.post('http://localhost:5001/api/auth/register', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-xl mb-4 shadow-lg shadow-[var(--primary)]/20">
            BA
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">Create an Account</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">Register as a Business Analyst</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#121214] p-8 rounded-2xl border border-[var(--border)] shadow-sm">
          {error && (
            <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-md border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] smooth-transition" placeholder="John Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">INSP Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <input required type="text" name="inspNumber" value={formData.inspNumber} onChange={handleChange} className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] smooth-transition" placeholder="INSP-1234" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">NIC</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <input required type="text" name="nic" value={formData.nic} onChange={handleChange} className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] smooth-transition" placeholder="123456789V" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] smooth-transition" placeholder="john@slt.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Designation</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <input required type="text" name="designation" value={formData.designation} onChange={handleChange} className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] smooth-transition" placeholder="Business Analyst" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Department</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <input required type="text" name="department" value={formData.department} onChange={handleChange} className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] smooth-transition" placeholder="IT Department" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <input required type="text" name="username" value={formData.username} onChange={handleChange} className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] smooth-transition" placeholder="johndoe" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <input required type="password" name="password" value={formData.password} onChange={handleChange} className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] smooth-transition" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 h-10 px-4 py-2 hover-lift smooth-transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
          
          <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            Already have an account? <Link to="/login" className="text-[var(--foreground)] font-medium hover:underline">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
