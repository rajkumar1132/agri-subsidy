// ============================================================
// Admin Dashboard — Full system overview with stats, charts, tables
// ============================================================
import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import { api } from '../../utils/api';
import { Users, Tractor, ClipboardList, BadgeIndianRupee, ShieldCheck, TrendingUp, AlertTriangle, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#6366f1', '#06b6d4'];

export default function AdminDashboard() {
  const [section, setSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [subsidies, setSubsidies] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => { loadData(); }, [section]);

  async function loadData() {
    setLoading(true);
    try {
      if (section === 'dashboard' || !stats) {
        const [s, t, f] = await Promise.all([
          api.getDashboardStats(),
          api.getMonthlyTrends().catch(() => null),
          api.getFraudAlerts().catch(() => []),
        ]);
        setStats(s);
        setTrends(t);
        setFraudAlerts(f);
      }
      if (section === 'users') setUsers(await api.getAllUsers());
      if (section === 'equipment') setEquipment(await api.getEquipment());
      if (section === 'rentals') setRentals(await api.getRentals());
      if (section === 'subsidies') setSubsidies(await api.getSubsidies());
      if (section === 'audit') setAuditLogs(await api.getAuditLog());
      if (section === 'reports') {
        const [t, f] = await Promise.all([
          api.getMonthlyTrends().catch(() => null),
          api.getFraudAlerts().catch(() => []),
        ]);
        setTrends(t);
        setFraudAlerts(f);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const titles = { dashboard: 'Dashboard', users: 'User Management', equipment: 'Equipment', rentals: 'Rentals', subsidies: 'Subsidies', reports: 'Reports & Analytics', audit: 'Audit Log' };
  const subtitles = { dashboard: 'System-wide overview', users: 'Manage all registered users', equipment: 'All registered equipment', rentals: 'All rental transactions', subsidies: 'All subsidy applications', reports: 'Charts and trends', audit: 'System activity trail' };

  return (
    <div className="min-h-screen bg-surface-950">
      <Sidebar activeSection={section} onSectionChange={setSection} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[260px] min-h-screen">
        <Topbar title={titles[section]} subtitle={subtitles[section]} onMenuToggle={() => setSidebarOpen(true)} />
        <ToastContainer />
        <main className="p-6 page-enter">
          {loading ? <LoadingSpinner /> : (
            <>
              {section === 'dashboard' && stats && <DashboardSection stats={stats} trends={trends} fraudAlerts={fraudAlerts} />}
              {section === 'users' && <UsersSection users={users} />}
              {section === 'equipment' && <EquipmentSection equipment={equipment} />}
              {section === 'rentals' && <RentalsSection rentals={rentals} />}
              {section === 'subsidies' && <SubsidiesSection subsidies={subsidies} />}
              {section === 'reports' && <ReportsSection trends={trends} stats={stats} />}
              {section === 'audit' && <AuditSection logs={auditLogs} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function DashboardSection({ stats, trends, fraudAlerts }) {
  const cards = [
    { icon: <Users />, label: 'Total Farmers', value: stats.totalFarmers, color: 'emerald' },
    { icon: <Tractor />, label: 'Total Equipment', value: stats.totalEquipment, sub: `${stats.availableEquipment} available`, color: 'primary' },
    { icon: <ClipboardList />, label: 'Total Rentals', value: stats.totalRentals, sub: `${stats.activeRentals} active`, color: 'sky' },
    { icon: <ShieldCheck />, label: 'Verified Rentals', value: stats.verifiedRentals, color: 'teal' },
    { icon: <BadgeIndianRupee />, label: 'Pending Subsidies', value: stats.pendingSubsidies, color: 'amber' },
    { icon: <BadgeIndianRupee />, label: 'Approved Subsidies', value: stats.approvedSubsidies, color: 'emerald' },
    { icon: <IndianRupee />, label: 'Subsidy Disbursed', value: `₹${(stats.totalSubsidyAmount || 0).toLocaleString()}`, color: 'purple' },
    { icon: <TrendingUp />, label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, color: 'primary' },
  ];

  const pieData = [
    { name: 'Approved', value: stats.approvedSubsidies, color: '#10b981' },
    { name: 'Pending', value: stats.pendingSubsidies, color: '#f59e0b' },
    { name: 'Rejected', value: stats.rejectedSubsidies, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const rentalTrends = trends?.rentalTrends?.map(t => ({
    month: t.month, rentals: Number(t.rental_count), revenue: Number(t.total_revenue)
  })).reverse() || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => <StatCard key={i} {...c} delay={i} />)}
      </div>

      {/* Fraud Alerts */}
      {fraudAlerts?.length > 0 && (
        <div className="glass-card p-5 border-rose-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-rose-400" size={18} />
            <h3 className="text-sm font-semibold text-rose-400">Fraud Alerts ({fraudAlerts.length})</h3>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {fraudAlerts.slice(0, 5).map(a => (
              <div key={a.log_id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
                <span className="text-xs">🚨</span>
                <span className="text-xs text-rose-300 flex-1">{a.details}</span>
                <span className="text-[10px] text-surface-500">{new Date(a.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {rentalTrends.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Monthly Rental Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={rentalTrends}>
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="rentals" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {pieData.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Subsidy Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
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
  );
}

function UsersSection({ users }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? users : users.filter(u => u.user_type === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['all', 'FARMER', 'EQUIPMENT_OWNER', 'VERIFIER', 'PROGRAM_OFFICER', 'ADMIN'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                             ${filter === f ? 'bg-primary-600/20 border-primary-500/30 text-primary-300' : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white'}`}>
            {f === 'all' ? 'All Users' : f.replace('_', ' ')}
          </button>
        ))}
      </div>
      <div className="table-container overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Contact</th><th>Aadhaar</th><th>Land (acres)</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.user_id}>
                <td className="font-mono text-xs">#{u.user_id}</td>
                <td className="font-medium">{u.name}</td>
                <td className="text-surface-400 text-xs">{u.email}</td>
                <td><StatusBadge status={u.user_type} /></td>
                <td className="text-xs">{u.contact_no}</td>
                <td className="font-mono text-xs">{u.farmer?.aadhaar_no || '—'}</td>
                <td>{u.farmer?.land_area || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EquipmentSection({ equipment }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? equipment : equipment.filter(e => e.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['all', 'AVAILABLE', 'IN_USE'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                             ${filter === f ? 'bg-primary-600/20 border-primary-500/30 text-primary-300' : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white'}`}>
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>
      <div className="table-container overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Equipment</th><th>Type</th><th>Rate/Day</th><th>Status</th><th>Owner</th></tr></thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.equipment_id}>
                <td className="font-mono text-xs">#{e.equipment_id}</td>
                <td className="font-medium">{e.name}</td>
                <td><span className="px-2 py-0.5 rounded-md bg-surface-700/60 text-xs text-surface-300">{e.type}</span></td>
                <td className="text-emerald-400 font-semibold">₹{e.rental_rate}</td>
                <td><StatusBadge status={e.status} /></td>
                <td className="text-xs text-surface-400">{e.owner?.user?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RentalsSection({ rentals }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? rentals : rentals.filter(r => r.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['all', 'REQUESTED', 'APPROVED', 'COMPLETED', 'VERIFIED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                             ${filter === f ? 'bg-primary-600/20 border-primary-500/30 text-primary-300' : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white'}`}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>
      <div className="table-container overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Farmer</th><th>Equipment</th><th>Duration</th><th>Amount</th><th>Status</th><th>Verified</th><th>Date</th></tr></thead>
          <tbody>
            {filtered.slice(0, 100).map(r => (
              <tr key={r.rental_id}>
                <td className="font-mono text-xs">#{r.rental_id}</td>
                <td className="font-medium">{r.farmer?.user?.name}</td>
                <td className="text-xs">{r.equipment?.name}</td>
                <td>{r.duration} days</td>
                <td className="text-emerald-400 font-semibold">₹{r.total_amount?.toLocaleString()}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>{r.verified ? <span className="text-emerald-400">✓ Yes</span> : <span className="text-surface-500">✕ No</span>}</td>
                <td className="text-xs text-surface-400">{new Date(r.rental_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubsidiesSection({ subsidies }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? subsidies : subsidies.filter(s => s.approval_status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['all', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                             ${filter === f ? 'bg-primary-600/20 border-primary-500/30 text-primary-300' : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white'}`}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>
      <div className="table-container overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>App ID</th><th>Farmer</th><th>Equipment</th><th>Rental ₹</th><th>Subsidy ₹</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {filtered.slice(0, 100).map(s => (
              <tr key={s.application_id}>
                <td className="font-mono text-xs">#{s.application_id}</td>
                <td className="font-medium">{s.rental?.farmer?.user?.name}</td>
                <td className="text-xs">{s.rental?.equipment?.name}</td>
                <td className="text-xs">₹{s.rental?.total_amount?.toLocaleString()}</td>
                <td className="text-emerald-400 font-semibold">₹{s.subsidy_amount?.toLocaleString()}</td>
                <td><StatusBadge status={s.approval_status} /></td>
                <td className="text-xs text-surface-400">{new Date(s.application_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsSection({ trends, stats }) {
  const rentalTrends = trends?.rentalTrends?.map(t => ({
    month: t.month, rentals: Number(t.rental_count), revenue: Number(t.total_revenue)
  })).reverse() || [];

  const subsidyTrends = trends?.subsidyTrends?.map(t => ({
    month: t.month, count: Number(t.application_count), amount: Number(t.approved_amount)
  })).reverse() || [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Rental Revenue by Month</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rentalTrends}>
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Subsidy Applications by Month</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={subsidyTrends}>
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AuditSection({ logs }) {
  const actionColors = {
    FRAUD_ATTEMPT: 'text-rose-400 bg-rose-500/10',
    DUPLICATE_SUBSIDY_ATTEMPT: 'text-rose-400 bg-rose-500/10',
    SUBSIDY_APPROVED: 'text-emerald-400 bg-emerald-500/10',
    SUBSIDY_REJECTED: 'text-rose-400 bg-rose-500/10',
    RENTAL_VERIFIED: 'text-primary-400 bg-primary-500/10',
    USER_LOGIN: 'text-sky-400 bg-sky-500/10',
    USER_REGISTERED: 'text-purple-400 bg-purple-500/10',
    default: 'text-surface-300 bg-surface-700/50',
  };

  return (
    <div className="table-container overflow-x-auto">
      <table className="data-table">
        <thead><tr><th>ID</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th><th>Timestamp</th></tr></thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.log_id}>
              <td className="font-mono text-xs">#{l.log_id}</td>
              <td className="text-xs">{l.user?.name}</td>
              <td>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${actionColors[l.action] || actionColors.default}`}>
                  {l.action}
                </span>
              </td>
              <td className="text-xs text-surface-400">{l.entity_type} #{l.entity_id}</td>
              <td className="text-xs text-surface-400 max-w-xs truncate">{l.details}</td>
              <td className="text-xs text-surface-500">{new Date(l.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
