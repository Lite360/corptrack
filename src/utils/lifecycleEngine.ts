import type { ServiceCycle, CorpMember, ClearancePeriod, PublicHoliday } from '../types';

/**
 * Service Cycle & Batch POP Evaluation
 * Evaluates active members against configured service cycle POP dates.
 * Automatic transition: ACTIVE -> ALUMNI when current_date >= expected_pop_date
 */
export function evaluateServiceCyclePop(
  members: CorpMember[],
  serviceCycles: ServiceCycle[],
  currentDateStr: string = new Date().toISOString().split('T')[0]
): { updatedMembers: CorpMember[]; transitionedCount: number } {
  let transitionedCount = 0;
  const currentDate = new Date(currentDateStr);

  const updatedMembers = members.map(member => {
    if (member.status === 'ALUMNI') return member;

    // Match service cycle by deploymentState, deploymentYear, batch, stream
    const cycle = serviceCycles.find(
      c =>
        c.deploymentState.toLowerCase() === member.deploymentState.toLowerCase() &&
        c.deploymentYear === member.deploymentYear &&
        c.batch === member.batch &&
        c.stream === member.stream &&
        c.status === 'ACTIVE'
    );

    if (cycle && cycle.expectedPopDate) {
      const popDate = new Date(cycle.expectedPopDate);
      if (currentDate >= popDate) {
        transitionedCount++;
        return {
          ...member,
          status: 'ALUMNI' as const
        };
      }
    }
    return member;
  });

  return { updatedMembers, transitionedCount };
}

/**
 * Check if a date falls within an active clearance period for a given CDS group
 */
export function isClearancePeriodActive(
  cdsGroupId: string,
  clearancePeriods: ClearancePeriod[],
  dateStr: string = new Date().toISOString().split('T')[0]
): { isActive: boolean; period?: ClearancePeriod } {
  const targetDate = new Date(dateStr);

  const found = clearancePeriods.find(period => {
    if (period.cdsGroupId !== cdsGroupId || period.status !== 'ACTIVE') return false;
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    return targetDate >= start && targetDate <= end;
  });

  return {
    isActive: Boolean(found),
    period: found
  };
}

/**
 * Check if a date is a registered Public Holiday
 */
export function isPublicHolidayActive(
  publicHolidays: PublicHoliday[],
  dateStr: string = new Date().toISOString().split('T')[0]
): { isHoliday: boolean; holiday?: PublicHoliday } {
  const targetDate = new Date(dateStr);

  const found = publicHolidays.find(h => {
    if (!h.active) return false;
    const start = new Date(h.startDate);
    const end = new Date(h.endDate);
    return targetDate >= start && targetDate <= end;
  });

  return {
    isHoliday: Boolean(found),
    holiday: found
  };
}
