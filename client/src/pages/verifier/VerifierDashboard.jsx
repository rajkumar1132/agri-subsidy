// ============================================================
// Verifier Dashboard — Rental verification queue
// ============================================================
import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import { api } from '../../utils/api';
import { ShieldCheck, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function VerifierDashboard() {
  const [section, setSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => { loadData(); }, [section]);

  async function loadData() {
    setLoading(true);
    try {
      const [p, h] = await Promise.all([
        api.getPendingVerifications(),
        api.getVerificationHistory(),
      ]);
      setPending(p);
      setHistory(h);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(rentalId) {
    try {
      const res = await api.verifyRental(rentalId);
      addToast(res.message, 'success');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  const titles = { dashboard: 'Verification Dashboard', pending: 'Pending Verifications', history: 'Verification History' };

  if (loading) return <div className="min-h-screen bg-surface-950 lg:ml-[260px]"><Sidebar activeSection={section} onSectionChange={setSection} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-surface-950">
      <Sidebar activeSection={section} onSectionChange={setSection} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[260px]">
        <Topbar title={titles[section]} subtitle="Data Entry Staff Portal" onMenuToggle={() => setSidebarOpen(true)} />
        <ToastContainer />
        <main className="p-6 page-enter">

          {section === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard icon={<Clock />} label="Pending Verifications" value={pending.length} color="amber" delay={0} />
                <StatCard icon={<CheckCircle2 />} label="Total Verified" value={history.length} color="emerald" delay={1} />
                <StatCard icon={<ShieldCheck />} label="Today's Queue" value={pending.filter(p => {
                  const d = new Date(p.updated_at);
                  const today = new Date();
                  return d.toDateString() === today.toDateString();
                }).length} color="primary" delay={2} />
              </div>

              {/* Verification Queue Preview */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Verification Queue</h3>
                  <button onClick={() => setSection('pending')} className="text-xs text-primary-400 hover:text-primary-300">View All →</button>
                </div>
                {pending.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="mx-auto text-emerald-400 mb-2" size={32} />
                    <p className="text-surface-400 text-sm">All rentals have been verified!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pending.slice(0, 5).map(r => (
                      <div key={r.rental_id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-800/40 border border-surface-700/30">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-surface-500">#{r.rental_id}</span>
                            <span className="text-sm font-medium">{r.farmer?.user?.name}</span>
                          </div>
                          <p className="text-xs text-surface-400 mt-0.5">
                            {r.equipment?.name} · {r.duration} days · ₹{r.total_amount?.toLocaleString()}
                          </p>
                        </div>
                        <button onClick={() => handleVerify(r.rental_id)}
                                className="btn-success text-xs py-1.5 px-3 flex items-center gap-1">
                          <ShieldCheck size={14} /> Verify
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Important Notice */}
              <div className="glass-card p-5 border-amber-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-400">Verification Guidelines</h4>
                    <ul className="text-xs text-surface-400 mt-2 space-y-1 list-disc list-inside">
                      <li>Verify ONLY after confirming equipment was actually used</li>
                      <li>Cross-check with farmer and equipment owner records</li>
                      <li>Only VERIFIED rentals can proceed to subsidy application</li>
                      <li>All verification actions are logged in the audit trail</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'pending' && (
            <div className="space-y-3">
              {pending.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <CheckCircle2 className="mx-auto text-emerald-400 mb-3" size={40} />
                  <p className="text-lg font-semibold text-white">Queue Empty</p>
                  <p className="text-sm text-surface-400 mt-1">No pending verifications at the moment.</p>
                </div>
              ) : (
                pending.map(r => (
                  <div key={r.rental_id} className="glass-card-hover p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded">RENTAL #{r.rental_id}</span>
                          <StatusBadge status={r.status} />
                        </div>
                        <h4 className="font-semibold text-white">{r.farmer?.user?.name}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                          <div><p className="text-[10px] text-surface-500">EQUIPMENT</p><p className="text-xs text-surface-200">{r.equipment?.name}</p></div>
                          <div><p className="text-[10px] text-surface-500">TYPE</p><p className="text-xs text-surface-200">{r.equipment?.type}</p></div>
                          <div><p className="text-[10px] text-surface-500">DURATION</p><p className="text-xs text-surface-200">{r.duration} days</p></div>
                          <div><p className="text-[10px] text-surface-500">AMOUNT</p><p className="text-xs text-emerald-400 font-semibold">₹{r.total_amount?.toLocaleString()}</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div><p className="text-[10px] text-surface-500">CONTACT</p><p className="text-xs text-surface-200">{r.farmer?.user?.contact_no}</p></div>
                          <div><p className="text-[10px] text-surface-500">OWNER</p><p className="text-xs text-surface-200">{r.equipment?.owner?.user?.name}</p></div>
                        </div>
                      </div>
                      <button onClick={() => handleVerify(r.rental_id)}
                              className="btn-success py-2.5 px-5 flex items-center gap-2">
                        <ShieldCheck size={18} /> Confirm & Verify
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {section === 'history' && (
            <div className="table-container overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Rental ID</th><th>Farmer</th><th>Equipment</th><th>Duration</th><th>Amount</th><th>Status</th><th>Verified</th></tr></thead>
                <tbody>
                  {history.map(r => (
                    <tr key={r.rental_id}>
                      <td className="font-mono text-xs">#{r.rental_id}</td>
                      <td className="font-medium text-sm">{r.farmer?.user?.name}</td>
                      <td className="text-xs">{r.equipment?.name}</td>
                      <td>{r.duration} days</td>
                      <td className="text-emerald-400 font-semibold">₹{r.total_amount?.toLocaleString()}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td><span className="text-emerald-400 text-xs font-bold">✓ Verified</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
