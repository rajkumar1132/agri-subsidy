import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title, subtitle, onMenuToggle }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/60 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onMenuToggle}
                  className="lg:hidden w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center
                             text-surface-400 hover:text-white transition-colors">
            <Menu size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/60 border border-surface-700/50">
            <span className="text-[10px] text-surface-400">Logged in as</span>
            <span className="text-xs font-semibold text-primary-400">{user?.name?.split(' ')[0]}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
