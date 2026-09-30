import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CorpMember, AdminUser, MemberDevice, ServiceCycle, ClearancePeriod, PublicHoliday } from '../types';
import { evaluateServiceCyclePop, isClearancePeriodActive, isPublicHolidayActive } from '../utils/lifecycleEngine';

interface AuthContextType {
  member: CorpMember | null;
  admin: AdminUser | null;
  currentDevice: MemberDevice | null;
  serviceCycles: ServiceCycle[];
  clearancePeriods: ClearancePeriod[];
  publicHolidays: PublicHoliday[];
  loginMember: (stateCode: string, deviceName?: string) => Promise<{ success: boolean; error?: string; needsRecovery?: boolean }>;
  registerMember: (fullName: string, stateCode: string, cdsGroupId: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  recoverDevice: (stateCode: string, cdsGroupId: string, deploymentState: string) => Promise<{ success: boolean; error?: string }>;
  checkPopStatus: () => void;
  addServiceCycle: (cycle: Omit<ServiceCycle, 'id'>) => void;
  addClearancePeriod: (period: Omit<ClearancePeriod, 'id'>) => void;
  addPublicHoliday: (holiday: Omit<PublicHoliday, 'id'>) => void;
  checkClearanceStatus: (cdsGroupId: string, dateStr?: string) => { isActive: boolean; period?: ClearancePeriod };
  checkHolidayStatus: (dateStr?: string) => { isHoliday: boolean; holiday?: PublicHoliday };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [member, setMember] = useState<CorpMember | null>(() => {
    const saved = localStorage.getItem('ct_member');
    return saved ? JSON.parse(saved) : null;
  });

  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('ct_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentDevice, setCurrentDevice] = useState<MemberDevice | null>(() => {
    const saved = localStorage.getItem('ct_device');
    return saved ? JSON.parse(saved) : null;
  });

  const [serviceCycles, setServiceCycles] = useState<ServiceCycle[]>(() => {
    const saved = localStorage.getItem('ct_db_cycles');
    return saved ? JSON.parse(saved) : [
      {
        id: 'cycle_1',
        deploymentState: 'Osun',
        deploymentYear: '2026',
        batch: 'A',
        stream: '1',
        expectedPopDate: '2027-02-15',
        status: 'ACTIVE'
      },
      {
        id: 'cycle_2',
        deploymentState: 'Osun',
        deploymentYear: '2025',
        batch: 'B',
        stream: '2',
        expectedPopDate: '2026-09-01', // Already passed POP date for testing
        status: 'ACTIVE'
      }
    ];
  });

  const [clearancePeriods, setClearancePeriods] = useState<ClearancePeriod[]>(() => {
    const saved = localStorage.getItem('ct_db_clearance');
    return saved ? JSON.parse(saved) : [];
  });

  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>(() => {
    const saved = localStorage.getItem('ct_db_holidays');
    return saved ? JSON.parse(saved) : [
      {
        id: 'hol_1',
        name: 'Independence Day',
        startDate: '2026-10-01',
        endDate: '2026-10-01',
        active: true
      }
    ];
  });

  useEffect(() => {
    if (member) localStorage.setItem('ct_member', JSON.stringify(member));
    else localStorage.removeItem('ct_member');
  }, [member]);

  useEffect(() => {
    if (admin) localStorage.setItem('ct_admin', JSON.stringify(admin));
    else localStorage.removeItem('ct_admin');
  }, [admin]);

  useEffect(() => {
    if (currentDevice) localStorage.setItem('ct_device', JSON.stringify(currentDevice));
    else localStorage.removeItem('ct_device');
  }, [currentDevice]);

  useEffect(() => {
    localStorage.setItem('ct_db_cycles', JSON.stringify(serviceCycles));
  }, [serviceCycles]);

  useEffect(() => {
    localStorage.setItem('ct_db_clearance', JSON.stringify(clearancePeriods));
  }, [clearancePeriods]);

  useEffect(() => {
    localStorage.setItem('ct_db_holidays', JSON.stringify(publicHolidays));
  }, [publicHolidays]);

  // Seed Members & Devices & Auto POP Transition on Load
  useEffect(() => {
    const seedMembers: CorpMember[] = [
      {
        id: 'mem_1',
        fullName: 'Daniel Okafor',
        rawStateCode: 'OS/26A1/1502',
        deploymentState: 'Osun',
        deploymentYear: '2026',
        batch: 'A',
        stream: '1',
        memberNumber: '1502',
        cdsGroupId: 'cds_1',
        cdsGroupName: 'Education CDS',
        status: 'ACTIVE',
        deviceId: 'dev_hash_123',
        registeredAt: '2026-03-01'
      },
      {
        id: 'mem_2',
        fullName: 'Amina Bello',
        rawStateCode: 'OS/25B2/0841',
        deploymentState: 'Osun',
        deploymentYear: '2025',
        batch: 'B',
        stream: '2',
        memberNumber: '0841',
        cdsGroupId: 'cds_2',
        cdsGroupName: 'Health CDS',
        status: 'ACTIVE',
        registeredAt: '2025-09-01'
      }
    ];

    let currentMembers: CorpMember[] = JSON.parse(localStorage.getItem('ct_db_members') || 'null') || seedMembers;

    // Run automatic service cycle POP transition check
    const { updatedMembers } = evaluateServiceCyclePop(currentMembers, serviceCycles);
    localStorage.setItem('ct_db_members', JSON.stringify(updatedMembers));

    // Update session member state if logged in member transitioned
    if (member) {
      const refreshed = updatedMembers.find(m => m.id === member.id);
      if (refreshed && refreshed.status !== member.status) {
        setMember(refreshed);
      }
    }

    const seedDevices: MemberDevice[] = [
      {
        id: 'dev_1',
        memberId: 'mem_1',
        deviceBindingHash: 'dev_hash_123',
        deviceName: 'Pixel 8 / Chrome',
        platform: 'Android',
        firstSeenAt: '2026-03-01',
        lastSeenAt: '2026-09-30',
        status: 'ACTIVE'
      }
    ];
    if (!localStorage.getItem('ct_db_devices')) {
      localStorage.setItem('ct_db_devices', JSON.stringify(seedDevices));
    }
  }, []);

  const loginMember = async (stateCode: string, deviceName = 'Browser Client') => {
    const members: CorpMember[] = JSON.parse(localStorage.getItem('ct_db_members') || '[]');
    const devices: MemberDevice[] = JSON.parse(localStorage.getItem('ct_db_devices') || '[]');

    const found = members.find(m => m.rawStateCode.toUpperCase() === stateCode.trim().toUpperCase());
    if (!found) {
      return { success: false, error: 'State Code not registered on CorpTrack' };
    }

    // Check device binding
    const currentDeviceHash = localStorage.getItem('ct_client_device_token') || 'dev_hash_123';
    const boundDevice = devices.find(d => d.memberId === found.id && d.status === 'ACTIVE');

    if (boundDevice && boundDevice.deviceBindingHash !== currentDeviceHash) {
      return { success: false, error: 'Device not recognized', needsRecovery: true };
    }

    if (!boundDevice) {
      const newDev: MemberDevice = {
        id: 'dev_' + Date.now(),
        memberId: found.id,
        deviceBindingHash: currentDeviceHash,
        deviceName,
        platform: navigator.platform,
        firstSeenAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        status: 'ACTIVE'
      };
      devices.push(newDev);
      localStorage.setItem('ct_db_devices', JSON.stringify(devices));
      setCurrentDevice(newDev);
    } else {
      setCurrentDevice(boundDevice);
    }

    setMember(found);
    return { success: true };
  };

  const registerMember = async (fullName: string, stateCode: string, cdsGroupId: string) => {
    const { parseStateCode } = await import('../utils/stateCodeParser');
    const parsed = parseStateCode(stateCode);

    if (!parsed.isValid) {
      return { success: false, error: parsed.errorMessage };
    }

    const members: CorpMember[] = JSON.parse(localStorage.getItem('ct_db_members') || '[]');
    if (members.some(m => m.rawStateCode.toUpperCase() === parsed.raw.toUpperCase())) {
      return { success: false, error: 'State code already registered' };
    }

    const newMember: CorpMember = {
      id: 'mem_' + Date.now(),
      fullName,
      rawStateCode: parsed.raw,
      deploymentState: parsed.deploymentStateName!,
      deploymentYear: parsed.deploymentYear!,
      batch: parsed.batch!,
      stream: parsed.stream!,
      memberNumber: parsed.memberNumber!,
      cdsGroupId,
      cdsGroupName: cdsGroupId === 'cds_1' ? 'Education CDS' : 'Health CDS',
      status: 'ACTIVE',
      registeredAt: new Date().toISOString().split('T')[0]
    };

    members.push(newMember);
    localStorage.setItem('ct_db_members', JSON.stringify(members));

    const deviceHash = 'dev_hash_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('ct_client_device_token', deviceHash);
    const newDevice: MemberDevice = {
      id: 'dev_' + Date.now(),
      memberId: newMember.id,
      deviceBindingHash: deviceHash,
      deviceName: 'Primary Device',
      platform: navigator.platform,
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      status: 'ACTIVE'
    };
    const devices: MemberDevice[] = JSON.parse(localStorage.getItem('ct_db_devices') || '[]');
    devices.push(newDevice);
    localStorage.setItem('ct_db_devices', JSON.stringify(devices));

    setMember(newMember);
    setCurrentDevice(newDevice);
    return { success: true };
  };

  const recoverDevice = async (stateCode: string, cdsGroupId: string, deploymentState: string) => {
    const members: CorpMember[] = JSON.parse(localStorage.getItem('ct_db_members') || '[]');
    const found = members.find(m => m.rawStateCode.toUpperCase() === stateCode.trim().toUpperCase());

    if (!found) {
      return { success: false, error: 'State Code not found' };
    }

    let matchCount = 0;
    if (found.cdsGroupId === cdsGroupId) matchCount++;
    if (found.deploymentState.toLowerCase() === deploymentState.trim().toLowerCase()) matchCount++;

    if (matchCount < 2) {
      return { success: false, error: 'Security verification failed. Please check your assigned CDS group and state.' };
    }

    let devices: MemberDevice[] = JSON.parse(localStorage.getItem('ct_db_devices') || '[]');
    devices = devices.map(d => d.memberId === found.id ? { ...d, status: 'REVOKED' } : d);

    const newHash = 'dev_hash_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('ct_client_device_token', newHash);

    const newDev: MemberDevice = {
      id: 'dev_' + Date.now(),
      memberId: found.id,
      deviceBindingHash: newHash,
      deviceName: 'Recovered Device',
      platform: navigator.platform,
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      status: 'ACTIVE'
    };
    devices.push(newDev);
    localStorage.setItem('ct_db_devices', JSON.stringify(devices));

    setMember(found);
    setCurrentDevice(newDev);
    return { success: true };
  };

  const loginAdmin = async (username: string, pass: string) => {
    if (username.toLowerCase() === 'superadmin' && pass === 'admin123') {
      const superAdmin: AdminUser = {
        id: 'admin_super',
        name: 'Super Administrator',
        username: 'superadmin',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE'
      };
      setAdmin(superAdmin);
      return { success: true };
    }

    if (username.toLowerCase() === 'president_edu' && pass === 'cds123') {
      const cdsAdmin: AdminUser = {
        id: 'admin_cds_1',
        name: 'CDS President (Education)',
        username: 'president_edu',
        role: 'CDS_ADMIN',
        cdsGroupId: 'cds_1',
        status: 'ACTIVE'
      };
      setAdmin(cdsAdmin);
      return { success: true };
    }

    return { success: false, error: 'Invalid admin credentials' };
  };

  const logout = () => {
    setMember(null);
    setAdmin(null);
    setCurrentDevice(null);
  };

  const checkPopStatus = () => {
    const currentMembers: CorpMember[] = JSON.parse(localStorage.getItem('ct_db_members') || '[]');
    const { updatedMembers } = evaluateServiceCyclePop(currentMembers, serviceCycles);
    localStorage.setItem('ct_db_members', JSON.stringify(updatedMembers));
    if (member) {
      const refreshed = updatedMembers.find(m => m.id === member.id);
      if (refreshed) setMember(refreshed);
    }
  };

  const addServiceCycle = (cycle: Omit<ServiceCycle, 'id'>) => {
    const newCycle: ServiceCycle = { ...cycle, id: 'cycle_' + Date.now() };
    setServiceCycles(prev => [...prev, newCycle]);
    checkPopStatus();
  };

  const addClearancePeriod = (period: Omit<ClearancePeriod, 'id'>) => {
    const newPeriod: ClearancePeriod = { ...period, id: 'clr_' + Date.now() };
    setClearancePeriods(prev => [...prev, newPeriod]);
  };

  const addPublicHoliday = (holiday: Omit<PublicHoliday, 'id'>) => {
    const newHoliday: PublicHoliday = { ...holiday, id: 'hol_' + Date.now() };
    setPublicHolidays(prev => [...prev, newHoliday]);
  };

  const checkClearanceStatus = (cdsGroupId: string, dateStr?: string) => {
    return isClearancePeriodActive(cdsGroupId, clearancePeriods, dateStr);
  };

  const checkHolidayStatus = (dateStr?: string) => {
    return isPublicHolidayActive(publicHolidays, dateStr);
  };

  return (
    <AuthContext.Provider
      value={{
        member,
        admin,
        currentDevice,
        serviceCycles,
        clearancePeriods,
        publicHolidays,
        loginMember,
        registerMember,
        loginAdmin,
        logout,
        recoverDevice,
        checkPopStatus,
        addServiceCycle,
        addClearancePeriod,
        addPublicHoliday,
        checkClearanceStatus,
        checkHolidayStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

