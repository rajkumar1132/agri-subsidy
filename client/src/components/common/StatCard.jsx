export default function StatCard({ icon, label, value, sub, color = 'primary', delay = 0 }) {
  const colors = {
    primary: 'from-primary-600/20 to-primary-500/5 border-primary-500/20',
    emerald: 'from-emerald-600/20 to-emerald-500/5 border-emerald-500/20',
    amber: 'from-amber-600/20 to-amber-500/5 border-amber-500/20',
    rose: 'from-rose-600/20 to-rose-500/5 border-rose-500/20',
    sky: 'from-sky-600/20 to-sky-500/5 border-sky-500/20',
    purple: 'from-purple-600/20 to-purple-500/5 border-purple-500/20',
    teal: 'from-teal-600/20 to-teal-500/5 border-teal-500/20',
  };
  const iconColors = {
    primary: 'text-primary-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    sky: 'text-sky-400',
    purple: 'text-purple-400',
    teal: 'text-teal-400',
  };

  return (
    <div className={`stat-card bg-gradient-to-br ${colors[color]} border`}
         style={{ animationDelay: `${delay * 80}ms` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-surface-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {sub && <p className="text-surface-400 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`text-2xl ${iconColors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
