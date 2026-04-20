import { useState, useEffect, useCallback } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    error: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
    warning: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    info: 'bg-primary-500/15 border-primary-500/30 text-primary-300',
    fraud: 'bg-red-600/20 border-red-500/40 text-red-300',
  };
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ', fraud: '🚨' };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md px-5 py-4 rounded-xl border backdrop-blur-xl shadow-lg
                     flex items-start gap-3 transition-all duration-300
                     ${colors[type]} ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <span className="text-lg flex-shrink-0">{icons[type]}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
              className="text-surface-400 hover:text-white transition-colors flex-shrink-0">✕</button>
    </div>
  );
}

// Toast container hook
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t, i) => (
        <div key={t.id} style={{ transform: `translateY(${i * 4}px)` }}>
          <Toast message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        </div>
      ))}
    </div>
  );

  return { addToast, ToastContainer };
}
