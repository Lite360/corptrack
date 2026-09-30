import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ShieldCheck, Smartphone } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginMember } = useAuth();
  const navigate = useNavigate();

  const [stateCode, setStateCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateCode) return;
    setLoading(true);

    const res = await loginMember(stateCode);
    setLoading(false);

    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Authentication Successful',
        text: 'Device verified. Welcome to CorpTrack.',
        timer: 1500,
        showConfirmButton: false
      });
      navigate('/member');
    } else if (res.needsRecovery) {
      Swal.fire({
        icon: 'warning',
        title: 'Device Not Recognized',
        text: 'This State Code is bound to another active device. You must complete account recovery to bind this device.',
        showCancelButton: true,
        confirmButtonText: 'Recover Account',
        confirmButtonColor: '#008751'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/recover?code=${encodeURIComponent(stateCode)}`);
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: res.error || 'Invalid State Code'
      });
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle p-3 mb-2 ct-splash-logo" style={{ width: '70px', height: '70px' }}>
              <ShieldCheck size={36} />
            </div>
            <h2 className="fw-bold text-success m-0">CorpTrack</h2>
            <p className="text-muted small">NYSC CDS Attendance & Service Lifecycle Platform</p>
          </div>

          <div className="card ct-card shadow-sm border-0">
            <div className="card-header bg-success text-white p-3 font-semibold d-flex align-items-center">
              <Smartphone size={20} className="me-2" />
              <span>Corp Member Sign In</span>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleMemberLogin}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">NYSC State Code</label>
                  <input
                    type="text"
                    className="form-control form-control-lg text-uppercase"
                    placeholder="e.g. OS/26A1/1502"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    required
                  />
                  <div className="form-text">Enter your registered State Code to authenticate this device.</div>
                </div>

                <button type="submit" className="btn btn-ct-primary btn-lg w-100 mb-3" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>

                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <Link to="/register" className="text-success text-decoration-none fw-semibold small">
                    First Time Member? Register
                  </Link>
                  <Link to="/recover" className="text-muted text-decoration-none small">
                    Lost Device?
                  </Link>
                </div>
              </form>
            </div>
          </div>

          <div className="text-center mt-4 text-muted small">
            <Link to="/privacy" className="text-muted me-3 text-decoration-none">Privacy Policy</Link>
            <Link to="/terms" className="text-muted text-decoration-none">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

