// ============================================================
// Farmer Dashboard — Equipment browsing, bookings, subsidies
// ============================================================
import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Tractor, ClipboardList, BadgeIndianRupee, ShieldCheck, Calendar } from 'lucide-react';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [section, setSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [subsidies, setSubsidies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [subsidyModal, setSubsidyModal] = useState(false);
  const [bookForm, setBookForm] = useState({ equipment_id: '', duration: 3 });
  const [subsidyRentalId, setSubsidyRentalId] = useState('');
  const [subsidyPreview, setSubsidyPreview] = useState(null);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => { loadData(); }, [section]);

  async function loadData() {
    setLoading(true);
    try {
      const [eq, ren, sub] = await Promise.all([
        api.getEquipment(),
        api.getRentals(),
        api.getSubsidies(),
      ]);
      setEquipment(eq);
      setRentals(ren);
      setSubsidies(sub);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleBook(e) {
    e.preventDefault();
    try {
      const res = await api.bookEquipment({
        equipment_id: parseInt(bookForm.equipment_id),
        duration: parseInt(bookForm.duration),
      });
      addToast(res.message, 'success');
      setBookingModal(false);
      setBookForm({ equipment_id: '', duration: 3 });
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleSubsidyPreview(rentalId) {
    setSubsidyRentalId(rentalId);
    if (!rentalId) { setSubsidyPreview(null); return; }
    try {
      const preview = await api.calculateSubsidy(rentalId);
      setSubsidyPreview(preview);
    } catch (err) {
      setSubsidyPreview(null);
    }
  }

  async function handleApplySubsidy(e) {
    e.preventDefault();
    try {
      const res = await api.applySubsidy({ rental_id: parseInt(subsidyRentalId) });
      addToast(res.message, 'success');
      setSubsidyModal(false);
      setSubsidyRentalId('');
      setSubsidyPreview(null);
      loadData();
    } catch (err) {
      addToast(err.message, err.fraud_alert ? 'fraud' : 'error');
    }
  }

  const available = equipment.filter(e => e.status === 'AVAILABLE');
  const verifiedRentals = rentals.filter(r => r.status === 'VERIFIED' && !r.subsidyApplication);
  const selectedEquip = equipment.find(e => e.equipment_id === parseInt(bookForm.equipment_id));

  const titles = { dashboard: 'My Dashboard', equipment: 'Browse Equipment', rentals: 'My Rentals', subsidies: 'My Subsidies' };

  if (loading) return <div className="min-h-screen bg-surface-950 lg:ml-[260px]"><Sidebar activeSection={section} onSectionChange={setSection} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-surface-950">
      <Sidebar activeSection={section} onSectionChange={setSection} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[260px]">
        <Topbar title={titles[section]} subtitle="Farmer Portal" onMenuToggle={() => setSidebarOpen(true)} />
        <ToastContainer />
        <main className="p-6 page-enter">

          {/* ── DASHBOARD ── */}
          {section === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<ClipboardList />} label="Total Rentals" value={rentals.length} color="primary" delay={0} />
                <StatCard icon={<ShieldCheck />} label="Verified" value={rentals.filter(r => r.verified).length} color="teal" delay={1} />
                <StatCard icon={<BadgeIndianRupee />} label="Subsidy Claims" value={subsidies.length} color="amber" delay={2} />
                <StatCard icon={<BadgeIndianRupee />} label="Approved" value={subsidies.filter(s => s.approval_status === 'APPROVED').length} color="emerald" delay={3} />
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                <button onClick={() => setSection('equipment')}
                        className="glass-card-hover p-6 text-left group">
                  <Tractor className="text-primary-400 mb-3" size={28} />
                  <h3 className="font-semibold text-white">Browse & Book Equipment</h3>
                  <p className="text-xs text-surface-400 mt-1">{available.length} equipment available for rent</p>
                </button>
                <button onClick={() => { if (verifiedRentals.length > 0) setSubsidyModal(true); else addToast('No verified rentals eligible for subsidy', 'warning'); }}
                        className="glass-card-hover p-6 text-left group">
                  <BadgeIndianRupee className="text-emerald-400 mb-3" size={28} />
                  <h3 className="font-semibold text-white">Apply for Subsidy</h3>
                  <p className="text-xs text-surface-400 mt-1">{verifiedRentals.length} verified rentals eligible</p>
                </button>
              </div>

              {/* Recent Rentals */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Recent Rentals</h3>
                <div className="space-y-2">
                  {rentals.slice(0, 5).map(r => (
                    <div key={r.rental_id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-800/40">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-surface-500">#{r.rental_id}</span>
                        <span className="text-sm font-medium">{r.equipment?.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-emerald-400">₹{r.total_amount?.toLocaleString()}</span>
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── EQUIPMENT BROWSE ── */}
          {section === 'equipment' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-surface-400">{available.length} equipment available</p>
                <button onClick={() => setBookingModal(true)} className="btn-primary text-sm">+ Book Equipment</button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.map(e => (
                  <div key={e.equipment_id} className="glass-card-hover p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-white text-sm">{e.name}</h4>
                        <span className="text-xs text-surface-400">{e.type}</span>
                      </div>
                      <StatusBadge status={e.status} />
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-surface-400">Rate per day</p>
                        <p className="text-lg font-bold text-emerald-400">₹{e.rental_rate}</p>
                      </div>
                      <p className="text-[10px] text-surface-500">{e.owner?.user?.name}</p>
                    </div>
                    {e.status === 'AVAILABLE' && (
                      <button onClick={() => { setBookForm({ equipment_id: e.equipment_id, duration: 3 }); setBookingModal(true); }}
                              className="btn-primary w-full mt-3 text-xs py-2">Book Now</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MY RENTALS ── */}
          {section === 'rentals' && (
            <div className="table-container overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Equipment</th><th>Type</th><th>Duration</th><th>Amount</th><th>Status</th><th>Verified</th><th>Date</th><th>Subsidy</th></tr></thead>
                <tbody>
                  {rentals.map(r => (
                    <tr key={r.rental_id}>
                      <td className="font-mono text-xs">#{r.rental_id}</td>
                      <td className="font-medium text-sm">{r.equipment?.name}</td>
                      <td className="text-xs text-surface-400">{r.equipment?.type}</td>
                      <td>{r.duration} days</td>
                      <td className="text-emerald-400 font-semibold">₹{r.total_amount?.toLocaleString()}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>{r.verified ? <span className="text-emerald-400 text-xs">✓</span> : <span className="text-surface-500 text-xs">✕</span>}</td>
                      <td className="text-xs text-surface-400">{new Date(r.rental_date).toLocaleDateString()}</td>
                      <td>
                        {r.subsidyApplication ? (
                          <StatusBadge status={r.subsidyApplication.approval_status} />
                        ) : r.status === 'VERIFIED' ? (
                          <button onClick={() => { setSubsidyRentalId(r.rental_id); handleSubsidyPreview(r.rental_id); setSubsidyModal(true); }}
                                  className="text-xs text-primary-400 hover:text-primary-300 font-medium">Apply →</button>
                        ) : <span className="text-xs text-surface-500">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── MY SUBSIDIES ── */}
          {section === 'subsidies' && (
            <div className="space-y-4">
              <button onClick={() => { if (verifiedRentals.length > 0) setSubsidyModal(true); else addToast('No eligible verified rentals', 'warning'); }}
                      className="btn-primary text-sm">+ Apply for Subsidy</button>
              <div className="table-container overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>App ID</th><th>Rental</th><th>Equipment</th><th>Subsidy ₹</th><th>Status</th><th>Remarks</th><th>Date</th></tr></thead>
                  <tbody>
                    {subsidies.map(s => (
                      <tr key={s.application_id}>
                        <td className="font-mono text-xs">#{s.application_id}</td>
                        <td className="font-mono text-xs">#{s.rental_id}</td>
                        <td className="text-sm">{s.rental?.equipment?.name}</td>
                        <td className="text-emerald-400 font-bold">₹{s.subsidy_amount?.toLocaleString()}</td>
                        <td><StatusBadge status={s.approval_status} /></td>
                        <td className="text-xs text-surface-400 max-w-[200px] truncate">{s.remarks || '—'}</td>
                        <td className="text-xs text-surface-400">{new Date(s.application_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* ── BOOKING MODAL ── */}
        <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="Book Equipment">
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Select Equipment</label>
              <select value={bookForm.equipment_id} onChange={e => setBookForm({ ...bookForm, equipment_id: e.target.value })}
                      required className="select-field">
                <option value="">Choose available equipment...</option>
                {available.map(e => (
                  <option key={e.equipment_id} value={e.equipment_id}>{e.name} ({e.type}) — ₹{e.rental_rate}/day</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Duration (days)</label>
              <input type="number" min="1" max="90" value={bookForm.duration}
                     onChange={e => setBookForm({ ...bookForm, duration: e.target.value })}
                     required className="input-field" />
            </div>
            {selectedEquip && bookForm.duration > 0 && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-300">Estimated Total</span>
                  <span className="text-emerald-400 font-bold text-lg">₹{(selectedEquip.rental_rate * bookForm.duration).toLocaleString()}</span>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setBookingModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Confirm Booking</button>
            </div>
          </form>
        </Modal>

        {/* ── SUBSIDY MODAL ── */}
        <Modal isOpen={subsidyModal} onClose={() => { setSubsidyModal(false); setSubsidyPreview(null); }} title="Apply for Subsidy">
          <form onSubmit={handleApplySubsidy} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Select Verified Rental</label>
              <select value={subsidyRentalId} onChange={e => handleSubsidyPreview(e.target.value)}
                      required className="select-field">
                <option value="">Choose a verified rental...</option>
                {verifiedRentals.map(r => (
                  <option key={r.rental_id} value={r.rental_id}>
                    #{r.rental_id} — {r.equipment?.name} — ₹{r.total_amount?.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            {subsidyPreview && (
              <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-surface-400">Farmer</span><span className="text-white">{subsidyPreview.farmer_name}</span></div>
                <div className="flex justify-between text-xs"><span className="text-surface-400">Land Area</span><span className="text-white">{subsidyPreview.land_area} acres</span></div>
                <div className="flex justify-between text-xs"><span className="text-surface-400">Category</span><span className="text-primary-400 font-medium">{subsidyPreview.category}</span></div>
                <div className="flex justify-between text-xs"><span className="text-surface-400">Rental Amount</span><span className="text-white">₹{subsidyPreview.rental_amount?.toLocaleString()}</span></div>
                <hr className="border-surface-600" />
                <div className="flex justify-between"><span className="text-surface-300 text-sm font-medium">Subsidy Amount</span><span className="text-emerald-400 font-bold text-xl">₹{subsidyPreview.subsidy_amount?.toLocaleString()}</span></div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setSubsidyModal(false); setSubsidyPreview(null); }} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={!subsidyRentalId} className="btn-success flex-1">Submit Application</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
