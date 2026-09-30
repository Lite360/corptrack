import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ShieldCheck, KeyRound, Building2 } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) return;
    setLoading(true);

    const res = await loginAdmin(adminUsername, adminPassword);
    setLoading(false);

    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Admin Session Established',
        timer: 1200,
        showConfirmButton: false
      });
      navigate('/admin');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: res.error || 'Invalid credentials'
      });
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-dark text-white rounded-circle p-3 mb-2 ct-splash-logo" style={{ width: '70px', height: '70px' }}>
              <Building2 size={36} />
            </div>
            <h2 className="fw-bold text-dark m-0">CorpTrack Admin Portal</h2>
            <p className="text-muted small">Authorized Administrative & CDS Management Access Only</p>
          </div>

          <div className="card ct-card shadow-sm border-0">
            <div className="card-header bg-dark text-white p-3 font-semibold d-flex align-items-center">
              <ShieldCheck size={20} className="me-2 text-warning" />
              <span>Administrative Authentication</span>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleAdminLogin}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">Admin Username</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-secondary">Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-dark btn-lg w-100" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Sign In to Portal'}
                </button>
                <div className="mt-3 text-center">
                  <span className="badge bg-light text-dark border p-2">
                    <KeyRound size={14} className="me-1" /> Argon2id Password Encrypted
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
