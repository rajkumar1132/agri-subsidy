// ============================================================
// Equipment Owner Dashboard — Equipment CRUD, Rental Management
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
import { Tractor, ClipboardList, IndianRupee, Plus, Pencil, Trash2, Check, CheckCircle } from 'lucide-react';

export default function OwnerDashboard() {
  const [section, setSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipModal, setEquipModal] = useState(false);
  const [editEquip, setEditEquip] = useState(null);
  const [equipForm, setEquipForm] = useState({ name: '', type: 'Tractor', rental_rate: '' });
  const { addToast, ToastContainer } = useToast();

  const types = ['Tractor', 'Harvester', 'Tiller', 'Seeder', 'Sprayer', 'Leveler', 'Harrow', 'Pump', 'Transplanter', 'Baler', 'Mulcher', 'Reaper', 'Thresher', 'Chaff Cutter', 'Trolley', 'Digger'];

  useEffect(() => { loadData(); }, [section]);

  async function loadData() {
    setLoading(true);
    try {
      const [eq, ren] = await Promise.all([api.getMyEquipment(), api.getMyRentals()]);
      setEquipment(eq);
      setRentals(ren);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEquipment(e) {
    e.preventDefault();
    try {
      if (editEquip) {
        await api.updateEquipment(editEquip.equipment_id, equipForm);
        addToast('Equipment updated.', 'success');
      } else {
        await api.addEquipment(equipForm);
        addToast('Equipment added.', 'success');
      }
      setEquipModal(false);
      setEditEquip(null);
      setEquipForm({ name: '', type: 'Tractor', rental_rate: '' });
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleDeleteEquip(id) {
    if (!confirm('Delete this equipment?')) return;
    try {
      await api.deleteEquipment(id);
      addToast('Equipment deleted.', 'success');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleApproveRental(id) {
    try {
      const res = await api.approveRental(id);
      addToast(res.message, 'success');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleCompleteRental(id) {
    try {
      const res = await api.completeRental(id);
      addToast(res.message, 'success');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  const totalRevenue = rentals.filter(r => r.status !== 'REQUESTED').reduce((s, r) => s + r.total_amount, 0);
  const titles = { dashboard: 'My Dashboard', equipment: 'My Equipment', rentals: 'Rental Requests' };

  if (loading) return <div className="min-h-screen bg-surface-950 lg:ml-[260px]"><Sidebar activeSection={section} onSectionChange={setSection} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-surface-950">
      <Sidebar activeSection={section} onSectionChange={setSection} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[260px]">
        <Topbar title={titles[section]} subtitle="Equipment Owner Portal" onMenuToggle={() => setSidebarOpen(true)} />
        <ToastContainer />
        <main className="p-6 page-enter">

          {section === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Tractor />} label="My Equipment" value={equipment.length} color="primary" delay={0} />
                <StatCard icon={<Tractor />} label="In Use" value={equipment.filter(e => e.status === 'IN_USE').length} color="amber" delay={1} />
                <StatCard icon={<ClipboardList />} label="Pending Requests" value={rentals.filter(r => r.status === 'REQUESTED').length} color="sky" delay={2} />
                <StatCard icon={<IndianRupee />} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="emerald" delay={3} />
              </div>

              {/* Pending Rental Requests */}
              {rentals.filter(r => r.status === 'REQUESTED').length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-amber-400 mb-3">⏳ Pending Rental Requests</h3>
                  <div className="space-y-2">
                    {rentals.filter(r => r.status === 'REQUESTED').map(r => (
                      <div key={r.rental_id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <div>
                          <p className="text-sm font-medium">{r.farmer?.user?.name} wants <span className="text-primary-400">{r.equipment?.name}</span></p>
                          <p className="text-xs text-surface-400">{r.duration} days · ₹{r.total_amount?.toLocaleString()}</p>
                        </div>
                        <button onClick={() => handleApproveRental(r.rental_id)} className="btn-success text-xs py-1.5 px-3">
                          <Check size={14} className="inline mr-1" />Approve
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {section === 'equipment' && (
            <div className="space-y-4">
              <button onClick={() => { setEditEquip(null); setEquipForm({ name: '', type: 'Tractor', rental_rate: '' }); setEquipModal(true); }}
                      className="btn-primary text-sm"><Plus size={16} className="inline mr-1" />Add Equipment</button>
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
                    <p className="text-lg font-bold text-emerald-400 mb-3">₹{e.rental_rate}<span className="text-xs text-surface-400 font-normal">/day</span></p>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditEquip(e); setEquipForm({ name: e.name, type: e.type, rental_rate: e.rental_rate }); setEquipModal(true); }}
                              className="btn-secondary text-xs py-1.5 flex-1"><Pencil size={12} className="inline mr-1" />Edit</button>
                      {e.status !== 'IN_USE' && (
                        <button onClick={() => handleDeleteEquip(e.equipment_id)}
                                className="btn-danger text-xs py-1.5 flex-1"><Trash2 size={12} className="inline mr-1" />Delete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'rentals' && (
            <div className="table-container overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Farmer</th><th>Equipment</th><th>Duration</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {rentals.map(r => (
                    <tr key={r.rental_id}>
                      <td className="font-mono text-xs">#{r.rental_id}</td>
                      <td className="font-medium text-sm">{r.farmer?.user?.name}</td>
                      <td className="text-xs">{r.equipment?.name}</td>
                      <td>{r.duration} days</td>
                      <td className="text-emerald-400 font-semibold">₹{r.total_amount?.toLocaleString()}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td className="text-xs text-surface-400">{new Date(r.rental_date).toLocaleDateString()}</td>
                      <td>
                        {r.status === 'REQUESTED' && (
                          <button onClick={() => handleApproveRental(r.rental_id)} className="btn-success text-[10px] py-1 px-2">Approve</button>
                        )}
                        {r.status === 'APPROVED' && (
                          <button onClick={() => handleCompleteRental(r.rental_id)} className="btn-primary text-[10px] py-1 px-2">Complete</button>
                        )}
                        {['COMPLETED', 'VERIFIED'].includes(r.status) && <span className="text-[10px] text-surface-500">Done</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Equipment Add/Edit Modal */}
        <Modal isOpen={equipModal} onClose={() => { setEquipModal(false); setEditEquip(null); }} title={editEquip ? 'Edit Equipment' : 'Add Equipment'}>
          <form onSubmit={handleSaveEquipment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Equipment Name</label>
              <input type="text" required value={equipForm.name}
                     onChange={e => setEquipForm({ ...equipForm, name: e.target.value })}
                     className="input-field" placeholder="e.g. Mahindra 575 DI Tractor" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Type</label>
              <select value={equipForm.type} onChange={e => setEquipForm({ ...equipForm, type: e.target.value })}
                      className="select-field">
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Rental Rate (₹/day)</label>
              <input type="number" required min="1" value={equipForm.rental_rate}
                     onChange={e => setEquipForm({ ...equipForm, rental_rate: e.target.value })}
                     className="input-field" placeholder="e.g. 1500" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setEquipModal(false); setEditEquip(null); }} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">{editEquip ? 'Update' : 'Add Equipment'}</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
