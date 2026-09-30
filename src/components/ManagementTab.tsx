import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { ShieldAlert, Plus, Calendar } from 'lucide-react';
import type { ClearancePeriod, PublicHoliday } from '../types';

export const ManagementTab: React.FC = () => {
  const { admin } = useAuth();
  
  // Clearance State
  const [clearances, setClearances] = useState<ClearancePeriod[]>([
    {
      id: 'clr_1',
      cdsGroupId: 'cds_1',
      cdsGroupName: 'Education CDS',
      startDate: '2026-10-01',
      endDate: '2026-10-07',
      reason: 'Bi-annual CDS State Inspection & Clearance Week',
      status: 'ACTIVE'
    }
  ]);

  // Public Holiday State
  const [holidays, setHolidays] = useState<PublicHoliday[]>([
    {
      id: 'hol_1',
      name: 'Independence Day',
      startDate: '2026-10-01',
      endDate: '2026-10-01',
      active: true
    },
    {
      id: 'hol_2',
      name: 'Eid-el-Maulud',
      startDate: '2026-10-12',
      endDate: '2026-10-12',
      active: true
    }
  ]);

  // Modal / Form States
  const [clrStartDate, setClrStartDate] = useState('');
  const [clrEndDate, setClrEndDate] = useState('');
  const [clrReason, setClrReason] = useState('');

  const [holName, setHolName] = useState('');
  const [holStartDate, setHolStartDate] = useState('');
  const [holEndDate, setHolEndDate] = useState('');

  const handleAddClearance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clrStartDate || !clrEndDate || !clrReason) return;

    const newClr: ClearancePeriod = {
      id: 'clr_' + Date.now(),
      cdsGroupId: admin?.cdsGroupId || 'cds_1',
      cdsGroupName: admin?.cdsGroupId === 'cds_2' ? 'Health CDS' : 'Education CDS',
      startDate: clrStartDate,
      endDate: clrEndDate,
      reason: clrReason,
      status: 'ACTIVE'
    };

    setClearances([newClr, ...clearances]);
    setClrStartDate('');
    setClrEndDate('');
    setClrReason('');

    Swal.fire({
      icon: 'success',
      title: 'Clearance Period Defined',
      text: 'Members in this CDS group will have attendance automatically suspended during this period without penalty.',
      confirmButtonColor: '#008751'
    });
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holName || !holStartDate) return;

    const newHol: PublicHoliday = {
      id: 'hol_' + Date.now(),
      name: holName,
      startDate: holStartDate,
      endDate: holEndDate || holStartDate,
      active: true
    };

    setHolidays([newHol, ...holidays]);
    setHolName('');
    setHolStartDate('');
    setHolEndDate('');

    Swal.fire({
      icon: 'success',
      title: 'Public Holiday Registered',
      text: 'Attendance checks across all CDS groups will exclude this holiday period.',
      confirmButtonColor: '#008751'
    });
  };

  const toggleHoliday = (id: string) => {
    setHolidays(holidays.map(h => h.id === id ? { ...h, active: !h.active } : h));
  };

  return (
    <div className="row g-4">
      {/* Clearance Period Management */}
      <div className="col-lg-6">
        <div className="card ct-card shadow-sm h-100">
          <div className="card-header ct-card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 text-secondary fw-bold">
              <ShieldAlert size={18} className="me-2 text-warning" /> Group Clearance Periods
            </h5>
            <span className="badge bg-warning text-dark">Group Scoped</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddClearance} className="mb-4 p-3 bg-light rounded border">
              <h6 className="fw-bold mb-3 text-dark">Declare New Clearance Window</h6>
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label small fw-bold">Start Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={clrStartDate}
                    onChange={(e) => setClrStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">End Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={clrEndDate}
                    onChange={(e) => setClrEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Clearance Reason / Memo</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Monthly LGC Clearance"
                  value={clrReason}
                  onChange={(e) => setClrReason(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-ct-primary btn-sm w-100">
                <Plus size={14} className="me-1" /> Add Clearance Window
              </button>
            </form>

            <h6 className="fw-bold text-secondary mb-2">Active & History Clearance Windows</h6>
            <div className="table-responsive">
              <table className="table ct-table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Group</th>
                    <th>Period</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clearances.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-bold">{c.cdsGroupName}</td>
                      <td className="small text-nowrap">{c.startDate} → {c.endDate}</td>
                      <td className="small">{c.reason}</td>
                      <td>
                        <span className="badge badge-status-clearance">
                          {c.status}
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

      {/* Public Holiday Management */}
      <div className="col-lg-6">
        <div className="card ct-card shadow-sm h-100">
          <div className="card-header ct-card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 text-secondary fw-bold">
              <Calendar size={18} className="me-2 text-primary" /> Public Holidays Registry
            </h5>
            <span className="badge bg-primary">Global Registry</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddHoliday} className="mb-4 p-3 bg-light rounded border">
              <h6 className="fw-bold mb-3 text-dark">Register Public Holiday</h6>
              <div className="mb-2">
                <label className="form-label small fw-bold">Holiday Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Workers Day"
                  value={holName}
                  onChange={(e) => setHolName(e.target.value)}
                  required
                />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Start Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={holStartDate}
                    onChange={(e) => setHolStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">End Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={holEndDate}
                    onChange={(e) => setHolEndDate(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-ct-primary btn-sm w-100">
                <Plus size={14} className="me-1" /> Add Public Holiday
              </button>
            </form>

            <h6 className="fw-bold text-secondary mb-2">Registered Public Holidays</h6>
            <div className="table-responsive">
              <table className="table ct-table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Holiday Name</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((h) => (
                    <tr key={h.id}>
                      <td className="fw-bold">{h.name}</td>
                      <td className="small text-nowrap">{h.startDate} {h.endDate !== h.startDate && `→ ${h.endDate}`}</td>
                      <td>
                        <span className={`badge ${h.active ? 'badge-status-holiday' : 'bg-secondary'}`}>
                          {h.active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() => toggleHoliday(h.id)}
                          className={`btn btn-sm ${h.active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        >
                          {h.active ? 'Disable' : 'Enable'}
                        </button>
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
  );
};
