import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Award, Search, Download, CheckCircle, RefreshCw, Calendar } from 'lucide-react';
import type { CorpMember, ServiceCycle } from '../types';
import { exportMemberAttendancePDF } from '../utils/reportExporter';

export const AlumniTab: React.FC = () => {
  // Service Cycles state
  const [cycles] = useState<ServiceCycle[]>([
    {
      id: 'sc_2025A1',
      deploymentState: 'Osun',
      deploymentYear: '2025',
      batch: 'A',
      stream: '1',
      expectedPopDate: '2026-03-01',
      status: 'COMPLETED'
    },
    {
      id: 'sc_2026A1',
      deploymentState: 'Osun',
      deploymentYear: '2026',
      batch: 'A',
      stream: '1',
      expectedPopDate: '2027-02-15',
      status: 'ACTIVE'
    }
  ]);

  // Alumni database state
  const [alumniMembers] = useState<CorpMember[]>([
    {
      id: 'mem_alum_1',
      fullName: 'Chinedu Eze',
      rawStateCode: 'OS/25A1/0412',
      deploymentState: 'Osun',
      deploymentYear: '2025',
      batch: 'A',
      stream: '1',
      memberNumber: '0412',
      cdsGroupId: 'cds_1',
      cdsGroupName: 'Education CDS',
      status: 'ALUMNI',
      registeredAt: '2025-03-01'
    },
    {
      id: 'mem_alum_2',
      fullName: 'Blessing Adebayo',
      rawStateCode: 'OS/25A1/0890',
      deploymentState: 'Osun',
      deploymentYear: '2025',
      batch: 'A',
      stream: '1',
      memberNumber: '0890',
      cdsGroupId: 'cds_2',
      cdsGroupName: 'Health CDS',
      status: 'ALUMNI',
      registeredAt: '2025-03-01'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('ALL');

  // Trigger manual background transition check
  const handleTriggerPopTransition = () => {
    const today = new Date().toISOString().split('T')[0];
    let transitionedCount = 0;

    const members: CorpMember[] = JSON.parse(localStorage.getItem('ct_db_members') || '[]');
    const updatedMembers = members.map(m => {
      // Check matching cycle
      const matchingCycle = cycles.find(c => c.batch === m.batch && c.stream === m.stream && c.deploymentYear === m.deploymentYear);
      if (matchingCycle && today >= matchingCycle.expectedPopDate && m.status === 'ACTIVE') {
        transitionedCount++;
        return { ...m, status: 'ALUMNI' as const };
      }
      return m;
    });

    if (transitionedCount > 0) {
      localStorage.setItem('ct_db_members', JSON.stringify(updatedMembers));
      Swal.fire({
        icon: 'success',
        title: 'POP Lifecycle Evaluated',
        text: `Successfully transitioned ${transitionedCount} active members to ALUMNI status.`,
        confirmButtonColor: '#008751'
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'POP Evaluation Complete',
        text: 'All service cycles are current. No active members have reached their expected POP date yet.',
        confirmButtonColor: '#008751'
      });
    }
  };

  const filteredAlumni = alumniMembers.filter(a => {
    const matchesSearch = a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.rawStateCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = batchFilter === 'ALL' || a.batch === batchFilter;
    return matchesSearch && matchesBatch;
  });

  const handleExportAlumniRecord = (member: CorpMember) => {
    exportMemberAttendancePDF({
      fullName: member.fullName,
      rawStateCode: member.rawStateCode,
      deploymentState: member.deploymentState,
      batch: member.batch,
      stream: member.stream,
      cdsGroupName: member.cdsGroupName || 'Education CDS',
      status: 'ALUMNI (SERVICE COMPLETED)',
      presentCount: 20,
      clearanceCount: 2,
      holidayCount: 1,
      absentCount: 0,
      attendancePercentage: 100,
      expectedPopDate: '2026-03-01'
    });
  };

  return (
    <div className="row g-4">
      {/* Service Cycles & POP Configuration */}
      <div className="col-12">
        <div className="card ct-card shadow-sm mb-4">
          <div className="card-header ct-card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h5 className="mb-0 text-secondary fw-bold">
              <Calendar size={18} className="me-2 text-success" /> Service Cycles & Batch POP Config
            </h5>
            <button
              onClick={handleTriggerPopTransition}
              className="btn btn-ct-primary btn-sm"
            >
              <RefreshCw size={14} className="me-1" /> Run Automatic POP Lifecycle Audit
            </button>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table ct-table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Service Cycle</th>
                    <th>State</th>
                    <th>Batch & Stream</th>
                    <th>Configured POP Date</th>
                    <th>Status</th>
                    <th>Members Count</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-bold text-dark">{c.deploymentYear} Batch {c.batch}{c.stream}</td>
                      <td>{c.deploymentState}</td>
                      <td><span className="badge bg-light text-dark border">Batch {c.batch}, Stream {c.stream}</span></td>
                      <td><code className="fw-bold text-secondary">{c.expectedPopDate}</code></td>
                      <td>
                        <span className={`badge ${c.status === 'COMPLETED' ? 'bg-secondary' : 'bg-success'}`}>
                          {c.status === 'COMPLETED' ? 'PASSED OUT (ALUMNI)' : 'ACTIVE CYCLE'}
                        </span>
                      </td>
                      <td className="fw-bold text-success">
                        {c.status === 'COMPLETED' ? '1,450 Alumni' : '1,502 Active'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Alumni Directory */}
      <div className="col-12">
        <div className="card ct-card shadow-sm">
          <div className="card-header ct-card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h5 className="mb-0 text-secondary fw-bold">
              <Award size={18} className="me-2 text-primary" /> Alumni Registry (Passed Out Corp Members)
            </h5>

            <div className="d-flex align-items-center gap-2">
              <div className="input-group input-group-sm" style={{ width: '220px' }}>
                <span className="input-group-text bg-white"><Search size={14} /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="btn-group btn-group-sm">
                {['ALL', 'A', 'B', 'C'].map((b) => (
                  <button
                    key={b}
                    className={`btn ${batchFilter === b ? 'btn-primary' : 'btn-outline-secondary'}`}
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
                    <th>CDS Group</th>
                    <th>Batch</th>
                    <th>Historical Attendance</th>
                    <th>POP Status</th>
                    <th className="text-end">Certificate / Record</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlumni.map((a) => (
                    <tr key={a.id}>
                      <td className="fw-bold text-dark">{a.fullName}</td>
                      <td><code className="fw-bold text-secondary">{a.rawStateCode}</code></td>
                      <td>{a.cdsGroupName}</td>
                      <td><span className="badge bg-light text-dark border">Batch {a.batch}{a.stream}</span></td>
                      <td><span className="badge bg-success-subtle text-success border border-success">100% (20/20 Sessions)</span></td>
                      <td>
                        <span className="badge bg-secondary">
                          <CheckCircle size={12} className="me-1" /> ALUMNI
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() => handleExportAlumniRecord(a)}
                          className="btn btn-ct-outline btn-sm"
                        >
                          <Download size={14} className="me-1" /> Export Historical PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAlumni.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted">
                        No Alumni records found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
