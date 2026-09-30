import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { evaluateAttendanceEligibility } from '../utils/attendanceEngine';
import Swal from 'sweetalert2';
import { MapPin, Calendar, CheckCircle2, Download, Shield, Smartphone, FileText } from 'lucide-react';
import { exportMemberAttendancePDF, exportElementAsPNG } from '../utils/reportExporter';

export const MemberDashboard: React.FC = () => {
  const { member, currentDevice, logout } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [signedToday, setSignedToday] = useState(false);

  if (!member) return null;

  // Mock active session in member's CDS group
  const mockActiveSession = {
    id: 'sess_101',
    cdsGroupId: 'cds_1',
    cdsGroupName: 'Education CDS',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00',
    status: 'OPEN' as const,
    latitude: 7.7827, // Osogbo coordinates demo
    longitude: 4.5418,
    radiusMeters: 200
  };

  const handleSignIn = () => {
    setSigningIn(true);

    if (!navigator.geolocation) {
      setSigningIn(false);
      Swal.fire('Location Error', 'Browser Geolocation API is not supported on your device', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const result = evaluateAttendanceEligibility({
          isAuthenticated: true,
          isAccountActive: member.status === 'ACTIVE',
          isAlumni: member.status === 'ALUMNI',
          isPopDateReached: false,
          memberCdsGroupId: member.cdsGroupId,
          sessionCdsGroupId: mockActiveSession.cdsGroupId,
          isSessionOpen: mockActiveSession.status === 'OPEN',
          isClearanceActive: false,
          isPublicHoliday: false,
          alreadySigned: signedToday,
          memberLat: pos.coords.latitude,
          memberLng: pos.coords.longitude,
          sessionLat: mockActiveSession.latitude,
          sessionLng: mockActiveSession.longitude,
          allowedRadiusMeters: mockActiveSession.radiusMeters
        });

        setSigningIn(false);

        if (result.canAttend) {
          setSignedToday(true);
          Swal.fire({
            icon: 'success',
            title: 'Attendance Verified!',
            html: `You signed in successfully.<br/><b>Verified Distance:</b> ${result.distanceMeters}m from venue`,
            confirmButtonColor: '#008751'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Attendance Rejected',
            text: result.reason,
            confirmButtonColor: '#008751'
          });
        }
      },
      (_err) => {
        setSigningIn(false);
        Swal.fire('GPS Location Required', 'Please enable location permissions to sign CDS attendance.', 'warning');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleExportPDF = () => {
    exportMemberAttendancePDF({
      fullName: member.fullName,
      rawStateCode: member.rawStateCode,
      deploymentState: member.deploymentState,
      batch: member.batch,
      stream: member.stream,
      cdsGroupName: member.cdsGroupName || 'Education CDS',
      status: member.status,
      presentCount: 15,
      clearanceCount: 2,
      holidayCount: 1,
      absentCount: 0,
      attendancePercentage: 100,
      expectedPopDate: '2027-02-15'
    });
  };

  const handleExportPNG = () => {
    exportElementAsPNG('member-cert-card', `CorpTrack_Certificate_${member.rawStateCode.replace(/\//g, '_')}.png`);
  };

  return (
    <div className="container py-4" id="member-cert-card">
      {/* Header Profile Bar */}
      <div className="card ct-card mb-4 bg-white">
        <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h4 className="fw-bold m-0 text-secondary">{member.fullName}</h4>
              <span className="badge bg-success text-white">{member.status}</span>
            </div>
            <div className="text-muted small">
              <strong className="text-dark">State Code:</strong> {member.rawStateCode} | <strong className="text-dark">CDS Group:</strong> {member.cdsGroupName || 'Education CDS'} | <strong className="text-dark">Batch:</strong> {member.batch}{member.stream} ({member.deploymentYear})
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button onClick={logout} className="btn btn-outline-danger btn-sm">
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Overview */}
      <div className="row g-4 mb-4">
        {/* Attendance Percentage Summary */}
        <div className="col-md-4">
          <div className="card ct-card h-100">
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <h6 className="text-muted uppercase small fw-bold mb-2">Overall Attendance Rate</h6>
              <div className="display-4 fw-bold text-success mb-2">100%</div>
              <p className="text-muted small mb-0">15 Present / 15 Eligible Sessions</p>
              <div className="mt-3">
                <span className="badge badge-status-present me-1">15 Present</span>
                <span className="badge badge-status-clearance me-1">2 Clearance</span>
                <span className="badge badge-status-holiday">1 Holiday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Attendance Session Action */}
        <div className="col-md-8">
          <div className="card ct-card h-100">
            <div className="card-header ct-card-header d-flex justify-content-between align-items-center">
              <span className="fw-bold"><Calendar size={18} className="me-2 text-success" /> Today's CDS Session</span>
              <span className={`badge ${signedToday ? 'bg-success' : 'bg-warning text-dark'}`}>
                {signedToday ? 'RECORDED' : 'OPEN FOR SIGN-IN'}
              </span>
            </div>
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 className="fw-bold text-secondary mb-1">{mockActiveSession.cdsGroupName} Meeting</h5>
                <p className="text-muted small mb-3">
                  <MapPin size={16} className="me-1 text-danger" /> Primary Secretariat Ground (Allowed Radius: {mockActiveSession.radiusMeters}m)
                </p>
                <div className="row text-center bg-light rounded p-2 mb-3">
                  <div className="col-4">
                    <div className="text-muted small">Date</div>
                    <div className="fw-bold small">{mockActiveSession.date}</div>
                  </div>
                  <div className="col-4">
                    <div className="text-muted small">Window</div>
                    <div className="fw-bold small">{mockActiveSession.startTime} - {mockActiveSession.endTime}</div>
                  </div>
                  <div className="col-4">
                    <div className="text-muted small">Verification</div>
                    <div className="fw-bold small text-success">GPS Enforced</div>
                  </div>
                </div>
              </div>

              {signedToday ? (
                <div className="alert alert-success d-flex align-items-center mb-0" role="alert">
                  <CheckCircle2 size={24} className="me-2" />
                  <div>
                    <strong>Attendance Recorded!</strong> Your attendance for today's CDS session has been verified and permanently logged.
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="btn btn-ct-primary btn-lg w-100 py-3"
                  disabled={signingIn}
                >
                  {signingIn ? 'Checking GPS Location & Distance...' : 'Sign CDS Attendance Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Device & History Details */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card ct-card">
            <div className="card-header ct-card-header">
              <span className="fw-bold"><Smartphone size={18} className="me-2 text-primary" /> Active Bound Device</span>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small">Device Identifier:</span>
                <span className="font-monospace small fw-bold">{currentDevice?.deviceName || 'Primary Registered Device'}</span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small">Platform:</span>
                <span className="small">{navigator.platform}</span>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-muted small">Binding Status:</span>
                <span className="badge bg-light text-success border border-success">
                  <Shield size={12} className="me-1" /> Active Single Device Lock
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card ct-card">
            <div className="card-header ct-card-header d-flex justify-content-between align-items-center">
              <span className="fw-bold">Export & Official Records</span>
            </div>
            <div className="card-body d-flex align-items-center justify-content-around">
              <button onClick={handleExportPDF} className="btn btn-ct-outline d-flex align-items-center gap-2">
                <FileText size={16} /> Export PDF Report
              </button>
              <button onClick={handleExportPNG} className="btn btn-ct-outline d-flex align-items-center gap-2">
                <Download size={16} /> Export PNG Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
