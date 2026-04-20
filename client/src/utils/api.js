// ============================================================
// API Utility — Centralized fetch with JWT
// ============================================================
const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('agri_token');
}

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw { status: res.status, message: data.error || 'Request failed', fraud_alert: data.fraud_alert };
  }
  return data;
}

export const api = {
  // Auth
  login: (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => apiFetch('/auth/me'),

  // Equipment
  getEquipment: (params = '') => apiFetch(`/equipment${params ? '?' + params : ''}`),
  getEquipmentTypes: () => apiFetch('/equipment/types'),

  // Farmers
  getFarmers: () => apiFetch('/farmers'),
  getFarmerRentals: (id) => apiFetch(`/farmers/${id}/rentals`),
  getFarmerSubsidies: (id) => apiFetch(`/farmers/${id}/subsidies`),

  // Owner
  getMyEquipment: () => apiFetch('/owners/equipment'),
  addEquipment: (body) => apiFetch('/owners/equipment', { method: 'POST', body: JSON.stringify(body) }),
  updateEquipment: (id, body) => apiFetch(`/owners/equipment/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteEquipment: (id) => apiFetch(`/owners/equipment/${id}`, { method: 'DELETE' }),
  getMyRentals: () => apiFetch('/owners/rentals'),
  approveRental: (id) => apiFetch(`/owners/rentals/${id}/approve`, { method: 'POST' }),
  completeRental: (id) => apiFetch(`/owners/rentals/${id}/complete`, { method: 'POST' }),

  // Rentals
  getRentals: (params = '') => apiFetch(`/rentals${params ? '?' + params : ''}`),
  bookEquipment: (body) => apiFetch('/rentals/book', { method: 'POST', body: JSON.stringify(body) }),

  // Verification
  getPendingVerifications: () => apiFetch('/verify/pending'),
  verifyRental: (id) => apiFetch(`/verify/${id}/confirm`, { method: 'POST' }),
  getVerificationHistory: () => apiFetch('/verify/history'),

  // Subsidies
  getSubsidies: (params = '') => apiFetch(`/subsidies${params ? '?' + params : ''}`),
  applySubsidy: (body) => apiFetch('/subsidies/apply', { method: 'POST', body: JSON.stringify(body) }),
  calculateSubsidy: (rentalId) => apiFetch(`/subsidies/calculate/${rentalId}`),
  approveSubsidy: (id, body) => apiFetch(`/subsidies/${id}/approve`, { method: 'POST', body: JSON.stringify(body) }),
  rejectSubsidy: (id, body) => apiFetch(`/subsidies/${id}/reject`, { method: 'POST', body: JSON.stringify(body) }),

  // Reports
  getDashboardStats: () => apiFetch('/reports/dashboard'),
  getRentalHistory: (params = '') => apiFetch(`/reports/rental-history${params ? '?' + params : ''}`),
  getSubsidyDistribution: () => apiFetch('/reports/subsidy-distribution'),
  getFraudAlerts: () => apiFetch('/reports/fraud-alerts'),
  getMonthlyTrends: () => apiFetch('/reports/monthly-trends'),

  // Admin
  getAllUsers: () => apiFetch('/admin/users'),
  getAuditLog: (params = '') => apiFetch(`/admin/audit-log${params ? '?' + params : ''}`),
  deleteUser: (id) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
  executeQuery: (body) => apiFetch('/admin/query', { method: 'POST', body: JSON.stringify(body) }),
};
