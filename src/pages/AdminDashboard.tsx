import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { Users, Calendar, MapPin, Plus, Shield, ShieldCheck, Smartphone, ShieldAlert, Award } from 'lucide-react';
import type { CorpMember, AttendanceSession } from '../types';
import { ManagementTab } from '../components/ManagementTab';
import { AlumniTab } from '../components/AlumniTab';

export const AdminDashboard: React.FC = () => {
  const { admin, logout } = useAuth();
  const [members] = useState<CorpMember[]>(() => {
    return JSON.parse(localStorage.getItem('ct_db_members') || '[]');
  });

  const [activeTab, setActiveTab] = useState<'members' | 'sessions' | 'clearance' | 'holidays' | 'audit' | 'alumni'>('members');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');

  // Session creation modal / state
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [radiusMeters, setRadiusMeters] = useState(200);
  const [sessionLat, setSessionLat] = useState(7.7827);
  const [sessionLng, setSessionLng] = useState(4.5418);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [sessions, setSessions] = useState<AttendanceSession[]>([
    {
      id: 'sess_1',
      cdsGroupId: 'cds_1',
      cdsGroupName: 'Education CDS',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '12:00',
      status: 'OPEN',
      latitude: 7.7827,
      longitude: 4.5418,
      radiusMeters: 200,
      createdById: admin?.id || 'admin'
    }
  ]);

  if (!admin) return null;

  const isSuperAdmin = admin.role === 'SUPER_ADMIN';

  const filteredMembers = members.filter(m => {
    if (!isSuperAdmin && admin.cdsGroupId && m.cdsGroupId !== admin.cdsGroupId) return false;
    if (batchFilter !== 'ALL' && m.batch !== batchFilter) return false;
    return true;
  });

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire('Error', 'Browser Geolocation not supported', 'error');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSessionLat(pos.coords.latitude);
        setSessionLng(pos.coords.longitude);
        setGettingLocation(false);
        Swal.fire({
          icon: 'success',
          title: 'Coordinates Updated',
          text: `Latitude: ${pos.coords.latitude.toFixed(5)}, Longitude: ${pos.coords.longitude.toFixed(5)}`,
          timer: 1500,
          showConfirmButton: false
        });
      },
      () => {
        setGettingLocation(false);
        Swal.fire('GPS Error', 'Failed to retrieve current location.', 'error');
      }
    );
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSess: AttendanceSession = {
      id: 'sess_' + Date.now(),
      cdsGroupId: admin.cdsGroupId || 'cds_1',
      cdsGroupName: admin.cdsGroupId === 'cds_2' ? 'Health CDS' : 'Education CDS',
      date: sessionDate,
      startTime,
      endTime,
      status: 'OPEN',
      latitude: sessionLat,
      longitude: sessionLng,
      radiusMeters,
      createdById: admin.id
    };

    setSessions([newSess, ...sessions]);
    Swal.fire('Session Created', 'CDS attendance session is now OPEN for members.', 'success');
  };

  const handleResetDevice = (_memberId: string, memberName: string) => {
    Swal.fire({
      title: 'Reset Device Lock?',
      text: `Are you sure you want to reset the bound device for ${memberName}? They will be forced to re-verify on their next login.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Reset Device'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Device Reset', `Device lock for ${memberName} has been cleared.`, 'success');
      }
    });
  };

  return (
    <div className="container-fluid py-4 px-4">
      {/* Top Admin Header */}
      <div className="card ct-card mb-4 bg-white">
        <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-success text-white rounded p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
              <Shield size={28} />
            </div>
            <div>
              <h4 className="fw-bold m-0 text-secondary">{admin.name}</h4>
              <div className="text-muted small">
                <span className="badge bg-secondary me-2">{admin.role.replace('_', ' ')}</span>
                {admin.cdsGroupId && <strong className="text-dark">Scoped CDS Group: Education CDS</strong>}
              </div>
            </div>
          </div>
          <div>
            <button onClick={logout} className="btn btn-outline-danger btn-sm">
              Log Out Admin
            </button>
          </div>
        </div>
      </div>

      {/* Admin Quick Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card ct-card p-3 border-start border-success border-4">
            <div className="text-muted small text-uppercase fw-bold">Total Members</div>
            <div className="h3 fw-bold text-dark m-0">{members.length}</div>
            <div className="text-success small mt-1"><Users size={14} className="me-1" /> Active System Users</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card ct-card p-3 border-start border-primary border-4">
            <div className="text-muted small text-uppercase fw-bold">Active Sessions</div>
            <div className="h3 fw-bold text-dark m-0">{sessions.filter(s => s.status === 'OPEN').length}</div>
            <div className="text-primary small mt-1"><Calendar size={14} className="me-1" /> OPEN Sessions</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card ct-card p-3 border-start border-warning border-4">
            <div className="text-muted small text-uppercase fw-bold">Active Clearance</div>
            <div className="h3 fw-bold text-dark m-0">0</div>
            <div className="text-warning small mt-1"><ShieldCheck size={14} className="me-1" /> Group Clearance Active</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card ct-card p-3 border-start border-info border-4">
            <div className="text-muted small text-uppercase fw-bold">Alumni Transitioned</div>
            <div className="h3 fw-bold text-dark m-0">0</div>
            <div className="text-info small mt-1">POP Records Retained</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-pills mb-4 gap-2 bg-white p-2 rounded shadow-sm border">
        <li className="nav-item">
          <button
            className={`nav-link font-semibold ${activeTab === 'members' ? 'active bg-success' : 'text-dark'}`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={16} className="me-1" /> Members Management
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link font-semibold ${activeTab === 'sessions' ? 'active bg-success' : 'text-dark'}`}
            onClick={() => setActiveTab('sessions')}
          >
            <Calendar size={16} className="me-1" /> Attendance Sessions
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link font-semibold ${activeTab === 'clearance' ? 'active bg-success' : 'text-dark'}`}
            onClick={() => setActiveTab('clearance')}
          >
            <ShieldAlert size={16} className="me-1" /> Clearance & Public Holidays
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link font-semibold ${activeTab === 'alumni' ? 'active bg-success' : 'text-dark'}`}
            onClick={() => setActiveTab('alumni')}
          >
            <Award size={16} className="me-1" /> Alumni & POP Lifecycles
          </button>
        </li>
      </ul>

      {/* Members Management Tab */}
      {activeTab === 'members' && (
        <div className="card ct-card shadow-sm">
          <div className="card-header ct-card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h5 className="mb-0 text-secondary fw-bold">Registered Corp Members</h5>

            {/* Quick Filters */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-bold">Batch Filter:</span>
              <div className="btn-group btn-group-sm">
                {['ALL', 'A', 'B', 'C'].map((b) => (
                  <button
                    key={b}
                    className={`btn ${batchFilter === b ? 'btn-success' : 'btn-outline-secondary'}`}
                    onClick={() => setBatchFilter(b)}
                  >
                    {b === 'ALL' ? 'ALL' : `Batch ${b}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table ct-table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>State Code</th>
                    <th>State</th>
                    <th>Batch / Stream</th>
                    <th>CDS Group</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr key={m.id}>
                      <td className="fw-bold text-dark">{m.fullName}</td>
                      <td><code className="fw-bold text-success">{m.rawStateCode}</code></td>
                      <td>{m.deploymentState}</td>
                      <td><span className="badge bg-light text-dark border">Batch {m.batch}{m.stream}</span></td>
                      <td>{m.cdsGroupName || 'Education CDS'}</td>
                      <td>
                        <span className={`badge ${m.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="small text-muted">{m.registeredAt}</td>
                      <td className="text-end">
                        <button
                          onClick={() => handleResetDevice(m.id, m.fullName)}
                          className="btn btn-outline-warning btn-sm me-1"
                          title="Reset Device Binding"
                        >
                          <Smartphone size={14} className="me-1" /> Reset Device
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-muted">
                        No Corp Members found for the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="row g-4">
          <div className="col-md-5">
            <div className="card ct-card shadow-sm">
              <div className="card-header ct-card-header">
                <h5 className="mb-0 text-secondary fw-bold">Create Attendance Session</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateSession}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Session Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-bold">Start Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-bold">End Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Allowed Radius (Meters)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={radiusMeters}
                      onChange={(e) => setRadiusMeters(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="mb-3 p-3 bg-light rounded border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold small">Venue Location (GPS)</span>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="btn btn-ct-outline btn-sm"
                        disabled={gettingLocation}
                      >
                        <MapPin size={14} className="me-1" /> Use Current Location
                      </button>
                    </div>
                    <div className="row g-2 text-muted small">
                      <div className="col-6">Latitude: <strong>{sessionLat.toFixed(5)}</strong></div>
                      <div className="col-6">Longitude: <strong>{sessionLng.toFixed(5)}</strong></div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-ct-primary w-100">
                    <Plus size={18} className="me-1" /> Open Attendance Session
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-7">
            <div className="card ct-card shadow-sm">
              <div className="card-header ct-card-header">
                <h5 className="mb-0 text-secondary fw-bold">Attendance Sessions History</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table ct-table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>CDS Group</th>
                        <th>Time Window</th>
                        <th>Radius</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s) => (
                        <tr key={s.id}>
                          <td className="fw-bold">{s.date}</td>
                          <td>{s.cdsGroupName}</td>
                          <td>{s.startTime} - {s.endTime}</td>
                          <td>{s.radiusMeters}m</td>
                          <td>
                            <span className={`badge ${s.status === 'OPEN' ? 'bg-success' : 'bg-danger'}`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clearance & Public Holidays Tab */}
      {activeTab === 'clearance' && <ManagementTab />}

      {/* Alumni & POP Lifecycles Tab */}
      {activeTab === 'alumni' && <AlumniTab />}
    </div>
  );
};
