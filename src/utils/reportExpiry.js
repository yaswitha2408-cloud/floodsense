/**
 * Report Expiry and Filtering Engine per SPEC.md Sections 4 & 6
 * 
 * Rules: reports with status 'active' older than 3 hours are treated as expired
 * and hidden from the map.
 */

export const DEFAULT_EXPIRY_HOURS = 3;

/**
 * Checks whether a single report is currently active and within expiry window
 * @param {object} report
 * @param {string|Date} [referenceTime] Current reference time (defaults to now)
 * @param {number} [maxAgeHours] Maximum age in hours (default: 3)
 * @returns {boolean}
 */
export function isReportActive(report, referenceTime = new Date(), maxAgeHours = DEFAULT_EXPIRY_HOURS) {
  if (!report || typeof report !== 'object') {
    return false;
  }

  // Must have status 'active' (not 'expired' or 'rejected')
  if (report.status !== 'active') {
    return false;
  }

  if (!report.created_at) {
    return false;
  }

  const createdTime = new Date(report.created_at).getTime();
  const refTime = new Date(referenceTime).getTime();

  if (isNaN(createdTime) || isNaN(refTime)) {
    return false;
  }

  // Cannot be created in the far future
  if (createdTime > refTime + 60000) {
    return false;
  }

  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  const ageMs = refTime - createdTime;

  return ageMs <= maxAgeMs;
}

/**
 * Filters a list of reports, returning only active reports within the specified time window
 * @param {Array<object>} reports
 * @param {string|Date} [referenceTime]
 * @param {number} [maxAgeHours]
 * @returns {Array<object>}
 */
export function filterActiveReports(reports, referenceTime = new Date(), maxAgeHours = DEFAULT_EXPIRY_HOURS) {
  if (!Array.isArray(reports)) {
    return [];
  }

  return reports.filter(report => isReportActive(report, referenceTime, maxAgeHours));
}

/**
 * Computes remaining active time for a report in minutes
 * @param {object} report
 * @param {string|Date} [referenceTime]
 * @param {number} [maxAgeHours]
 * @returns {number} Remaining minutes (0 if expired)
 */
export function getRemainingActiveMinutes(report, referenceTime = new Date(), maxAgeHours = DEFAULT_EXPIRY_HOURS) {
  if (!report?.created_at) return 0;

  const createdTime = new Date(report.created_at).getTime();
  const refTime = new Date(referenceTime).getTime();

  if (isNaN(createdTime) || isNaN(refTime)) return 0;

  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  const elapsedMs = refTime - createdTime;
  const remainingMs = maxAgeMs - elapsedMs;

  return Math.max(0, Math.floor(remainingMs / (60 * 1000)));
}
