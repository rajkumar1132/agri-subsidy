// ============================================================
// Program Officer Dashboard — Subsidy Approval System
// ============================================================
import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import { api } from '../../utils/api';
import { BadgeIndianRupee, CheckCircle, XCircle, Clock, IndianRupee, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

export default function OfficerDashboard() {
  const [section, setSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subsidies, setSubsidies] = useState([]);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarkModal, setRemarkModal] = useState(null); // { id, action: 'approve'|'reject' }
  const [remarks, setRemarks] = useState('');
  const { addToast, ToastContainer } = useToast();

  useEffect(() => { loadData(); }, [section]);

  async function loadData() {
    setLoading(true);
    try {
      const [sub, s, t] = await Promise.all([
        api.getSubsidies(),
        api.getDashboardStats(),
        api.getMonthlyTrends().catch(() => null),
      ]);
      setSubsidies(sub);
      setStats(s);
      setTrends(t);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction() {
    if (!remarkModal) return;
    try {
      if (remarkModal.action === 'approve') {
        await api.approveSubsidy(remarkModal.id, { remarks: remarks || 'Approved by Program Officer' });
        addToast(`Subsidy #${remarkModal.id} approved!`, 'success');
      } else {
        if (!remarks.trim()) { addToast('Remarks required for rejection', 'warning'); return; }
        await api.rejectSubsidy(remarkModal.id, { remarks });
        addToast(`Subsidy #${remarkModal.id} rejected.`, 'info');
      }
      setRemarkModal(null);
      setRemarks('');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  const pending = subsidies.filter(s => s.approval_status === 'PENDING');
  const approved = subsidies.filter(s => s.approval_status === 'APPROVED');
  const rejected = subsidies.filter(s => s.approval_status === 'REJECTED');

  const pieData = [
    { name: 'Approved', value: approved.length, color: '#10b981' },
    { name: 'Pending', value: pending.length, color: '#f59e0b' },
    { name: 'Rejected', value: rejected.length, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const titles = { dashboard: 'Officer Dashboard', approvals: 'Subsidy Approvals', reports: 'Subsidy Reports' };

  if (loading) return <div className="min-h-screen bg-surface-950 lg:ml-[260px]"><Sidebar activeSection={section} onSectionChange={setSection} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-surface-950">
      <Sidebar activeSection={section} onSectionChange={setSection} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[260px]">
        <Topbar title={titles[section]} subtitle="Program Officer Portal" onMenuToggle={() => setSidebarOpen(true)} />
        <ToastContainer />
        <main className="p-6 page-enter">

          {section === 'dashboard' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Clock />} label="Pending" value={pending.length} color="amber" delay={0} />
                <StatCard icon={<CheckCircle />} label="Approved" value={approved.length} color="emerald" delay={1} />
                <StatCard icon={<XCircle />} label="Rejected" value={rejected.length} color="rose" delay={2} />
                <StatCard icon={<IndianRupee />} label="Total Disbursed" value={`₹${(stats.totalSubsidyAmount || 0).toLocaleString()}`} color="primary" delay={3} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Pending Queue */}
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-amber-400">⏳ Pending Approvals ({pending.length})</h3>
                    <button onClick={() => setSection('approvals')} className="text-xs text-primary-400 hover:text-primary-300">View All →</button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {pending.slice(0, 8).map(s => (
                      <div key={s.application_id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-800/40">
                        <div>
                          <p className="text-sm font-medium">{s.rental?.farmer?.user?.name}</p>
                          <p className="text-[10px] text-surface-400">{s.rental?.equipment?.name} · ₹{s.subsidy_amount?.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => { setRemarkModal({ id: s.application_id, action: 'approve' }); setRemarks(''); }}
                                  className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/25 transition-colors">
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => { setRemarkModal({ id: s.application_id, action: 'reject' }); setRemarks(''); }}
                                  className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center hover:bg-rose-500/25 transition-colors">
                            <XCircle size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pie Chart */}
                {pieData.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Subsidy Distribution</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                        <Legend formatter={(value) => <span className="text-surface-300 text-xs">{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {section === 'approvals' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-sm text-surface-400">Showing {pending.length} pending applications</span>
              </div>
              {pending.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <CheckCircle className="mx-auto text-emerald-400 mb-3" size={40} />
                  <p className="text-lg font-semibold text-white">All Caught Up!</p>
                  <p className="text-sm text-surface-400 mt-1">No pending subsidy applications.</p>
                </div>
              ) : (
                pending.map(s => (
                  <div key={s.application_id} className="glass-card-hover p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded">APP #{s.application_id}</span>
                          <span className="font-mono text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded">RENTAL #{s.rental_id}</span>
                          <StatusBadge status="PENDING" />
                        </div>
                        <h4 className="font-semibold text-white text-lg">{s.rental?.farmer?.user?.name}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                          <div><p className="text-[10px] text-surface-500">EQUIPMENT</p><p className="text-xs text-surface-200">{s.rental?.equipment?.name}</p></div>
                          <div><p className="text-[10px] text-surface-500">RENTAL ₹</p><p className="text-xs text-surface-200">₹{s.rental?.total_amount?.toLocaleString()}</p></div>
                          <div><p className="text-[10px] text-surface-500">SUBSIDY ₹</p><p className="text-sm text-emerald-400 font-bold">₹{s.subsidy_amount?.toLocaleString()}</p></div>
                          <div><p className="text-[10px] text-surface-500">APPLIED ON</p><p className="text-xs text-surface-200">{new Date(s.application_date).toLocaleDateString()}</p></div>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-col">
                        <button onClick={() => { setRemarkModal({ id: s.application_id, action: 'approve' }); setRemarks(''); }}
                                className="btn-success text-xs py-2 px-4 flex items-center gap-1.5">
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button onClick={() => { setRemarkModal({ id: s.application_id, action: 'reject' }); setRemarks(''); }}
                                className="btn-danger text-xs py-2 px-4 flex items-center gap-1.5">
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* All subsidies table */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-white mb-3">All Subsidy Applications</h3>
                <div className="table-container overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>ID</th><th>Farmer</th><th>Equipment</th><th>Subsidy ₹</th><th>Status</th><th>Remarks</th><th>Date</th></tr></thead>
                    <tbody>
                      {subsidies.slice(0, 50).map(s => (
                        <tr key={s.application_id}>
                          <td className="font-mono text-xs">#{s.application_id}</td>
                          <td className="font-medium text-sm">{s.rental?.farmer?.user?.name}</td>
                          <td className="text-xs">{s.rental?.equipment?.name}</td>
                          <td className="text-emerald-400 font-semibold">₹{s.subsidy_amount?.toLocaleString()}</td>
                          <td><StatusBadge status={s.approval_status} /></td>
                          <td className="text-xs text-surface-400 max-w-[180px] truncate">{s.remarks || '—'}</td>
                          <td className="text-xs text-surface-400">{new Date(s.application_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {section === 'reports' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {pieData.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Subsidy Status Breakdown</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {trends?.subsidyTrends && (
                  <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Monthly Subsidy Applications</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={trends.subsidyTrends.map(t => ({
                        month: t.month, count: Number(t.application_count), amount: Number(t.approved_amount),
                      })).reverse()}>
                        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                        <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Applications" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-5 text-center">
                  <p className="text-2xl font-bold text-emerald-400">₹{approved.reduce((s, a) => s + a.subsidy_amount, 0).toLocaleString()}</p>
                  <p className="text-xs text-surface-400 mt-1">Total Approved Amount</p>
                </div>
                <div className="glass-card p-5 text-center">
                  <p className="text-2xl font-bold text-amber-400">₹{pending.reduce((s, a) => s + a.subsidy_amount, 0).toLocaleString()}</p>
                  <p className="text-xs text-surface-400 mt-1">Pending Amount</p>
                </div>
                <div className="glass-card p-5 text-center">
                  <p className="text-2xl font-bold text-white">{subsidies.length > 0 ? Math.round((approved.length / subsidies.length) * 100) : 0}%</p>
                  <p className="text-xs text-surface-400 mt-1">Approval Rate</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Approve/Reject Modal */}
        <Modal isOpen={!!remarkModal} onClose={() => { setRemarkModal(null); setRemarks(''); }}
               title={remarkModal?.action === 'approve' ? 'Approve Subsidy' : 'Reject Subsidy'}>
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-surface-800/60">
              <p className="text-xs text-surface-400">Application #{remarkModal?.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Remarks {remarkModal?.action === 'reject' && <span className="text-rose-400">*</span>}
              </label>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)}
                        rows={3} className="input-field resize-none"
                        placeholder={remarkModal?.action === 'approve' ? 'Optional remarks...' : 'Reason for rejection (required)...'} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setRemarkModal(null); setRemarks(''); }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAction}
                      className={`flex-1 ${remarkModal?.action === 'approve' ? 'btn-success' : 'btn-danger'}`}>
                {remarkModal?.action === 'approve' ? '✓ Confirm Approve' : '✕ Confirm Reject'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
