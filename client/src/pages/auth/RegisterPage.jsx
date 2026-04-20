// ============================================================
// Registration Page
// ============================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wheat, UserPlus, Eye, EyeOff } from 'lucide-react';

const districts = [
  'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
  'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
  'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Pathankot',
  'Patiala', 'Rupnagar', 'SAS Nagar', 'Sangrur', 'SBS Nagar',
  'Sri Muktsar Sahib', 'Tarn Taran',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', contact_no: '', address: '',
    user_type: 'FARMER', aadhaar_no: '', land_area: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate Aadhaar
    if (form.user_type === 'FARMER' && !/^\d{12}$/.test(form.aadhaar_no)) {
      return setError('Aadhaar must be exactly 12 digits.');
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-slide-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg mb-3">
            <Wheat className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Create Account</h1>
          <p className="text-surface-400 text-sm mt-1">Register for the Agricultural Subsidy System</p>
        </div>

        <div className="glass-card p-7">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Register as</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ val: 'FARMER', lbl: '🌾 Farmer' }, { val: 'EQUIPMENT_OWNER', lbl: '🚜 Equipment Owner' }].map(r => (
                  <button key={r.val} type="button"
                          onClick={() => set('user_type', r.val)}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border
                                     ${form.user_type === r.val
                                       ? 'bg-primary-600/20 border-primary-500/30 text-primary-300'
                                       : 'bg-surface-800 border-surface-600 text-surface-400 hover:border-surface-500'}`}>
                    {r.lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Full Name</label>
                <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                       className="input-field" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Contact Number</label>
                <input type="tel" required value={form.contact_no} onChange={e => set('contact_no', e.target.value)}
                       className="input-field" placeholder="98765XXXXX" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                     className="input-field" placeholder="your@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={form.password}
                       onChange={e => set('password', e.target.value)}
                       className="input-field pr-11" placeholder="Min 6 characters" minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">District</label>
              <select value={form.address} onChange={e => set('address', e.target.value)}
                      required className="select-field">
                <option value="">Select district...</option>
                {districts.map(d => <option key={d} value={`${d}, Punjab`}>{d}</option>)}
              </select>
            </div>

            {/* Farmer-specific fields */}
            {form.user_type === 'FARMER' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-700/50">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Aadhaar No.</label>
                  <input type="text" required maxLength={12} value={form.aadhaar_no}
                         onChange={e => set('aadhaar_no', e.target.value.replace(/\D/g, ''))}
                         className="input-field" placeholder="12-digit number" />
                  <p className="text-[10px] text-surface-500 mt-1">Format: 12 digits only</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Land Area (acres)</label>
                  <input type="number" required step="0.01" min="0.1" value={form.land_area}
                         onChange={e => set('land_area', e.target.value)}
                         className="input-field" placeholder="e.g. 5.5" />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><UserPlus size={18} /> Create Account</>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-surface-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
