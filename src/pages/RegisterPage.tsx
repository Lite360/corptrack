import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { parseStateCode } from '../utils/stateCodeParser';
import type { ParsedStateCode } from '../utils/stateCodeParser';
import { ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerMember } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [rawStateCode, setRawStateCode] = useState('');
  const [cdsGroupId, setCdsGroupId] = useState('cds_1');
  const [parsed, setParsed] = useState<ParsedStateCode | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCodeChange = (val: string) => {
    setRawStateCode(val);
    if (val.trim().length >= 6) {
      setParsed(parseStateCode(val));
    } else {
      setParsed(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseStateCode(rawStateCode);
    if (!p.isValid) {
      Swal.fire('Invalid State Code', p.errorMessage, 'error');
      return;
    }

    setLoading(true);
    const res = await registerMember(fullName, rawStateCode, cdsGroupId);
    setLoading(false);

    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Registration Complete!',
        text: 'Your device has been bound to your Corp Member profile.',
        confirmButtonColor: '#008751'
      }).then(() => {
        navigate('/member');
      });
    } else {
      Swal.fire('Registration Error', res.error || 'Failed to register', 'error');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-success m-0">CorpTrack Registration</h2>
            <p className="text-muted small">Register your NYSC State Code and bind your active device</p>
          </div>

          <div className="card ct-card shadow-sm border-0">
            <div className="card-header ct-card-header bg-white">
              <h5 className="mb-0 text-secondary fw-bold">
                <UserCheck size={20} className="me-2 text-success" /> Member Details
              </h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Full Name</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="e.g. Daniel Okafor"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">NYSC State Code</label>
                  <input
                    type="text"
                    className="form-control form-control-lg text-uppercase"
                    placeholder="e.g. OS/26A1/1502"
                    value={rawStateCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    required
                  />
                  <div className="form-text">Format: State/Year Batch Stream/Number</div>
                </div>

                {/* Parsed Live Verification Badge */}
                {parsed && (
                  <div className={`p-3 mb-3 rounded border ${parsed.isValid ? 'bg-light border-success' : 'bg-light border-danger'}`}>
                    {parsed.isValid ? (
                      <div>
                        <div className="fw-bold text-success mb-1">
                          <ShieldCheck size={16} className="me-1" /> Valid NYSC Format Detected
                        </div>
                        <div className="row g-2 text-muted small">
                          <div className="col-6"><strong>State:</strong> {parsed.deploymentStateName}</div>
                          <div className="col-6"><strong>Year:</strong> {parsed.deploymentYear}</div>
                          <div className="col-6"><strong>Batch:</strong> {parsed.batchStream} (Batch {parsed.batch}, Stream {parsed.stream})</div>
                          <div className="col-6"><strong>Member #:</strong> {parsed.memberNumber}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-danger small">{parsed.errorMessage}</div>
                    )}
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label fw-bold">Assigned CDS Group</label>
                  <select
                    className="form-select form-select-lg"
                    value={cdsGroupId}
                    onChange={(e) => setCdsGroupId(e.target.value)}
                    required
                  >
                    <option value="cds_1">Education CDS (Thursdays)</option>
                    <option value="cds_2">Health & Sanitation CDS (Fridays)</option>
                    <option value="cds_3">Editorial & Publicity CDS (Thursdays)</option>
                    <option value="cds_4">ICT & Digital Skills CDS (Wednesdays)</option>
                  </select>
                </div>

                <div className="alert alert-info border-0 bg-light small mb-4">
                  <strong>Device Security Notice:</strong> Registering will lock this device to your State Code. One member per active device rule strictly enforced.
                </div>

                <button type="submit" className="btn btn-ct-primary btn-lg w-100" disabled={loading || (parsed !== null && !parsed.isValid)}>
                  {loading ? 'Binding Device & Registering...' : <>Complete Registration <ArrowRight size={18} className="ms-1" /></>}
                </button>
              </form>
            </div>
          </div>

          <div className="text-center mt-3">
            <Link to="/login" className="text-muted text-decoration-none small">Already registered? Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
