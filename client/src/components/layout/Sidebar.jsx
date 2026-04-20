// ============================================================
// Sidebar — Role-adaptive navigation
// ============================================================
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Tractor, ClipboardList, BadgeIndianRupee, ShieldCheck, 
         FileCheck, Users, BarChart3, LogOut, ScrollText, Settings, Database } from 'lucide-react';

const navItems = {
  ADMIN: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'equipment', label: 'Equipment', icon: Tractor },
    { id: 'rentals', label: 'Rentals', icon: ClipboardList },
    { id: 'subsidies', label: 'Subsidies', icon: BadgeIndianRupee },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'audit', label: 'Audit Log', icon: ScrollText },
    { id: 'sql_console', label: 'SQL Console', icon: Database },
  ],
  FARMER: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'equipment', label: 'Browse Equipment', icon: Tractor },
    { id: 'rentals', label: 'My Rentals', icon: ClipboardList },
    { id: 'subsidies', label: 'Subsidies', icon: BadgeIndianRupee },
  ],
  EQUIPMENT_OWNER: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'equipment', label: 'My Equipment', icon: Tractor },
    { id: 'rentals', label: 'Rental Requests', icon: ClipboardList },
  ],
  VERIFIER: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pending', label: 'Pending Verifications', icon: ShieldCheck },
    { id: 'history', label: 'Verification History', icon: FileCheck },
  ],
  PROGRAM_OFFICER: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'approvals', label: 'Subsidy Approvals', icon: BadgeIndianRupee },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ],
};

const roleLabels = {
  ADMIN: 'Administrator',
  FARMER: 'Farmer',
  EQUIPMENT_OWNER: 'Equipment Owner',
  VERIFIER: 'Data Entry Staff',
  PROGRAM_OFFICER: 'Program Officer',
};

const roleColors = {
  ADMIN: 'bg-primary-500',
  FARMER: 'bg-emerald-500',
  EQUIPMENT_OWNER: 'bg-amber-500',
  VERIFIER: 'bg-sky-500',
  PROGRAM_OFFICER: 'bg-purple-500',
};

export default function Sidebar({ activeSection, onSectionChange, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const items = navItems[user?.user_type] || [];
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-[260px] bg-surface-900/95 backdrop-blur-xl border-r border-surface-700/50
                         flex flex-col z-50 transition-transform duration-300
                         ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-surface-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-lg">
              🌾
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">Agri Subsidy</h1>
              <p className="text-[10px] text-surface-400 font-medium">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button key={item.id}
                onClick={() => { onSectionChange(item.id); onClose?.(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                            ${isActive
                              ? 'bg-primary-600/20 text-primary-300 border border-primary-500/20 shadow-sm'
                              : 'text-surface-400 hover:text-white hover:bg-surface-800/80'}`}>
                <Icon size={18} className={isActive ? 'text-primary-400' : ''} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User info + Logout */}
        <div className="px-3 py-4 border-t border-surface-700/50 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className={`w-9 h-9 rounded-lg ${roleColors[user?.user_type]} flex items-center justify-center text-white text-xs font-bold`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-surface-400">{roleLabels[user?.user_type]}</p>
            </div>
          </div>
          <button onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                             text-rose-400 hover:bg-rose-500/10 transition-all duration-200">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
