/**
 * Server-side distance calculation (Haversine Formula) in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Attendance eligibility rules check
 */
export interface AttendanceEligibilityCheckResult {
  canAttend: boolean;
  reason?: string;
  distanceMeters?: number;
}

export function evaluateAttendanceEligibility(params: {
  isAuthenticated: boolean;
  isAccountActive: boolean;
  isAlumni: boolean;
  isPopDateReached: boolean;
  memberCdsGroupId: string;
  sessionCdsGroupId: string;
  isSessionOpen: boolean;
  isClearanceActive: boolean;
  isPublicHoliday: boolean;
  alreadySigned: boolean;
  memberLat?: number;
  memberLng?: number;
  sessionLat?: number;
  sessionLng?: number;
  allowedRadiusMeters?: number;
}): AttendanceEligibilityCheckResult {
  const {
    isAuthenticated,
    isAccountActive,
    isAlumni,
    isPopDateReached,
    memberCdsGroupId,
    sessionCdsGroupId,
    isSessionOpen,
    isClearanceActive,
    isPublicHoliday,
    alreadySigned,
    memberLat,
    memberLng,
    sessionLat,
    sessionLng,
    allowedRadiusMeters = 200
  } = params;

  if (!isAuthenticated) return { canAttend: false, reason: 'User session is invalid or unauthenticated' };
  if (!isAccountActive) return { canAttend: false, reason: 'Account is suspended or inactive' };
  if (isAlumni || isPopDateReached) return { canAttend: false, reason: 'Service cycle completed (POP). Alumni cannot sign attendance.' };
  if (memberCdsGroupId !== sessionCdsGroupId) return { canAttend: false, reason: 'Session belongs to a different CDS group' };
  if (!isSessionOpen) return { canAttend: false, reason: 'Attendance session is currently CLOSED' };
  if (isClearanceActive) return { canAttend: false, reason: 'Clearance period active. Attendance is disabled' };
  if (isPublicHoliday) return { canAttend: false, reason: 'Today is a public holiday. Attendance is disabled' };
  if (alreadySigned) return { canAttend: false, reason: 'Attendance has already been recorded for this session' };

  if (
    memberLat === undefined ||
    memberLng === undefined ||
    sessionLat === undefined ||
    sessionLng === undefined
  ) {
    return { canAttend: false, reason: 'Geolocation coordinates are missing' };
  }

  const distance = calculateDistanceMeters(memberLat, memberLng, sessionLat, sessionLng);
  if (distance > allowedRadiusMeters) {
    return {
      canAttend: false,
      reason: `You are ${distance}m away from the venue (Max allowed: ${allowedRadiusMeters}m)`,
      distanceMeters: distance
    };
  }

  return { canAttend: true, distanceMeters: distance };
}

/**
 * Standard Attendance Percentage Formula according to design.md Part 25:
 * Total Scheduled Days - Clearance Days - Holiday Days = Adjusted Total
 * Attendance % = (Present / Adjusted Total) * 100
 */
export function calculateAttendancePercentage(
  presentCount: number,
  scheduledCount: number,
  clearanceCount: number,
  holidayCount: number
): number {
  const adjustedTotal = scheduledCount - clearanceCount - holidayCount;
  if (adjustedTotal <= 0) return 100; // default 100% if no required days
  const percentage = (presentCount / adjustedTotal) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage * 10) / 10));
}
