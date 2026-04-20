// ============================================================
// Login Page — Premium glassmorphism design
// ============================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wheat, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Admin', email: 'admin@agri.gov.in' },
    { label: 'Farmer', email: 'farmer1@agri.in' },
    { label: 'Owner', email: 'owner1@agri.in' },
    { label: 'Verifier', email: 'verifier@agri.gov.in' },
    { label: 'Officer', email: 'officer@agri.gov.in' },
  ];

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow mb-4">
            <Wheat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Agricultural Subsidy</h1>
          <p className="text-surface-400 text-sm mt-1">Smart Equipment Sharing & Management System</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Email Address</label>
              <input type="email" required value={form.email}
                     onChange={e => setForm({ ...form, email: e.target.value })}
                     className="input-field" placeholder="Enter your email" />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={form.password}
                       onChange={e => setForm({ ...form, password: e.target.value })}
                       className="input-field pr-11" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn size={18} /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-surface-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 glass-card p-5">
          <p className="text-xs font-medium text-surface-400 mb-3 uppercase tracking-wider">Quick Demo Login</p>
          <div className="flex flex-wrap gap-2">
            {demoAccounts.map(acc => (
              <button key={acc.email}
                      onClick={() => setForm({ email: acc.email, password: 'password123' })}
                      className="px-3 py-1.5 rounded-lg bg-surface-700/60 text-xs font-medium text-surface-300
                                 hover:bg-primary-600/20 hover:text-primary-300 transition-all duration-200 border border-surface-600/50">
                {acc.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-surface-500 mt-2">All demo passwords: password123</p>
        </div>
      </div>
    </div>
  );
}
