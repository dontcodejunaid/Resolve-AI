import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Navbar } from './components/Navbar';
import { SimulatedBadge } from './components/SimulatedBadge';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { NewCase } from './pages/NewCase';
import { CaseDetail } from './pages/CaseDetail';
import { CustomerOrders } from './pages/CustomerOrders';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployeeCaseDetail } from './pages/EmployeeCaseDetail';
import { EmployeeApprovals } from './pages/EmployeeApprovals';
import { MerchantDashboard } from './pages/MerchantDashboard';
import { MerchantPolicies } from './pages/MerchantPolicies';
import { MerchantProducts } from './pages/MerchantProducts';
import { DemoLab } from './pages/DemoLab';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFCFA] flex items-center justify-center text-slate-500 font-mono text-sm">
        Authenticating...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'admin') {
    if (user.role === 'employee') return <Navigate to="/employee/dashboard" replace />;
    if (user.role === 'merchant') return <Navigate to="/merchant/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'employee') return <Navigate to="/employee/dashboard" replace />;
  if (user.role === 'merchant') return <Navigate to="/merchant/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#FAFCFA] text-[#0F1711]">
          {/* Top Simulated Environment & Demo Bar */}
          <SimulatedBadge />

          {/* Navigation */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/demo" element={<DemoLab />} />

              {/* Customer Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new-case"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <NewCase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/case/:id"
                element={
                  <ProtectedRoute>
                    <CaseDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerOrders />
                  </ProtectedRoute>
                }
              />

              {/* Employee Routes */}
              <Route
                path="/employee/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['employee', 'merchant']}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/cases/:id"
                element={
                  <ProtectedRoute allowedRoles={['employee', 'merchant']}>
                    <EmployeeCaseDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/approvals"
                element={
                  <ProtectedRoute allowedRoles={['employee', 'merchant']}>
                    <EmployeeApprovals />
                  </ProtectedRoute>
                }
              />

              {/* Merchant Routes */}
              <Route
                path="/merchant/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['merchant']}>
                    <MerchantDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/policies"
                element={
                  <ProtectedRoute allowedRoles={['merchant']}>
                    <MerchantPolicies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/products"
                element={
                  <ProtectedRoute allowedRoles={['merchant']}>
                    <MerchantProducts />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
