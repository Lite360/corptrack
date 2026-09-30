import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { RefreshCw, ShieldAlert } from 'lucide-react';

export const RecoverPage: React.FC = () => {
  const { recoverDevice } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [stateCode, setStateCode] = useState('');
  const [cdsGroupId, setCdsGroupId] = useState('cds_1');
  const [deploymentState, setDeploymentState] = useState('Osun');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) setStateCode(code);
  }, [searchParams]);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await recoverDevice(stateCode, cdsGroupId, deploymentState);
    setLoading(false);

    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Device Recovery Successful',
        text: 'Your old device has been revoked and this device is now bound to your account.',
        confirmButtonColor: '#008751'
      }).then(() => {
        navigate('/member');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: res.error || 'Failed to verify account details'
      });
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-success m-0">Device Recovery</h2>
            <p className="text-muted small">Verify your registration details to revoke old device</p>
          </div>

          <div className="card ct-card shadow-sm border-0">
            <div className="card-header ct-card-header bg-white">
              <h5 className="mb-0 text-secondary fw-bold">
                <ShieldAlert size={20} className="me-2 text-warning" /> Security Verification
              </h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleRecover}>
                <div className="mb-3">
                  <label className="form-label fw-bold">NYSC State Code</label>
                  <input
                    type="text"
                    className="form-control form-control-lg text-uppercase"
                    placeholder="e.g. OS/26A1/1502"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">1. What is your assigned CDS Group?</label>
                  <select
                    className="form-select"
                    value={cdsGroupId}
                    onChange={(e) => setCdsGroupId(e.target.value)}
                    required
                  >
                    <option value="cds_1">Education CDS</option>
                    <option value="cds_2">Health & Sanitation CDS</option>
                    <option value="cds_3">Editorial & Publicity CDS</option>
                    <option value="cds_4">ICT & Digital Skills CDS</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">2. Deployment State</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Osun"
                    value={deploymentState}
                    onChange={(e) => setDeploymentState(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-ct-primary btn-lg w-100" disabled={loading}>
                  {loading ? 'Verifying...' : <>Revoke Old Device & Bind This Device <RefreshCw size={16} className="ms-1" /></>}
                </button>
              </form>
            </div>
          </div>

          <div className="text-center mt-3">
            <Link to="/login" className="text-muted text-decoration-none small">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
