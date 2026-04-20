// ============================================================
// App.jsx — Main Application with Routing
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import VerifierDashboard from './pages/verifier/VerifierDashboard';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function DashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;

  const routes = {
    ADMIN: '/admin',
    FARMER: '/farmer',
    EQUIPMENT_OWNER: '/owner',
    VERIFIER: '/verifier',
    PROGRAM_OFFICER: '/officer',
  };
  return <Navigate to={routes[user.user_type] || '/login'} replace />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>
      } />
      <Route path="/farmer" element={
        <ProtectedRoute allowedRoles={['FARMER']}><DashboardLayout><FarmerDashboard /></DashboardLayout></ProtectedRoute>
      } />
      <Route path="/owner" element={
        <ProtectedRoute allowedRoles={['EQUIPMENT_OWNER']}><DashboardLayout><OwnerDashboard /></DashboardLayout></ProtectedRoute>
      } />
      <Route path="/verifier" element={
        <ProtectedRoute allowedRoles={['VERIFIER']}><DashboardLayout><VerifierDashboard /></DashboardLayout></ProtectedRoute>
      } />
      <Route path="/officer" element={
        <ProtectedRoute allowedRoles={['PROGRAM_OFFICER']}><DashboardLayout><OfficerDashboard /></DashboardLayout></ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
