export interface CorpMember {
  id: string;
  fullName: string;
  rawStateCode: string;
  deploymentState: string;
  deploymentYear: string;
  batch: 'A' | 'B' | 'C';
  stream: '1' | '2';
  memberNumber: string;
  cdsGroupId: string;
  cdsGroupName?: string;
  status: 'ACTIVE' | 'ALUMNI' | 'SUSPENDED';
  deviceId?: string;
  registeredAt: string;
}

export interface CdsGroup {
  id: string;
  name: string;
  normalAttendanceDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  assignedAdminId?: string;
  assignedAdminName?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AttendanceSession {
  id: string;
  cdsGroupId: string;
  cdsGroupName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: 'SCHEDULED' | 'OPEN' | 'CLOSED';
  latitude: number;
  longitude: number;
  radiusMeters: number;
  createdById: string;
  startedAt?: string;
  endedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  memberId: string;
  signInTime: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  status: 'PRESENT' | 'EXCUSED';
}

export interface ClearancePeriod {
  id: string;
  cdsGroupId: string;
  cdsGroupName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface PublicHoliday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface ServiceCycle {
  id: string;
  deploymentState: string;
  deploymentYear: string;
  batch: 'A' | 'B' | 'C';
  stream: '1' | '2';
  expectedPopDate: string; // YYYY-MM-DD
  status: 'ACTIVE' | 'COMPLETED';
}

export interface MemberDevice {
  id: string;
  memberId: string;
  deviceBindingHash: string;
  deviceName: string;
  platform: string;
  firstSeenAt: string;
  lastSeenAt: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  role: 'SUPER_ADMIN' | 'CDS_ADMIN';
  cdsGroupId?: string;
  status: 'ACTIVE' | 'DISABLED';
}
