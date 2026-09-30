import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RecoverPage } from './pages/RecoverPage';
import { MemberDashboard } from './pages/MemberDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ShieldCheck } from 'lucide-react';

const ProtectedMemberRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { member } = useAuth();
  if (!member) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin } = useAuth();
  if (!admin) return <Navigate to="/access" replace />;
  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-vh-100 d-flex flex-column bg-light">
          {/* Main Top Navigation Header */}
          <header className="ct-navbar py-2 px-3 shadow-sm">
            <div className="container-fluid d-flex justify-content-between align-items-center">
              <a href="/login" className="navbar-brand">
                <ShieldCheck size={24} />
                <span>CorpTrack</span>
                <span className="ct-badge-nysc ms-2">NYSC CDS Portal</span>
              </a>
              <div className="text-white small d-none d-sm-block">
                Official Attendance & Service Lifecycle Platform
              </div>
            </div>
          </header>

          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/access" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/recover" element={<RecoverPage />} />
              
              <Route
                path="/member"
                element={
                  <ProtectedMemberRoute>
                    <MemberDashboard />
                  </ProtectedMemberRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
            </Routes>
          </main>

          <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
            <div className="container">
              CorpTrack Platform © 2026 — Developed by Elite developers | State Code: OS/25C/1502
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
