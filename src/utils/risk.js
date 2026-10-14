/**
 * Risk Calculation Engine per SPEC.md Section 6
 * 
 * Risk score (0-100) = 0.5 * rainScore + 0.25 * lowElevationScore + 0.25 * reportScore
 * - rainScore: scaled from forecast mm/h (0 at 0, 100 at 20+ mm/h)
 * - lowElevationScore: cell elevation relative to the area's min/max (lowest = 100)
 * - reportScore: based on verified active reports inside or near the cell, weighted by depth and confidence
 * - Levels: green <35, amber 35-65, red >65
 */

/**
 * Calculates rain score scaled from 0 at 0 mm/h to 100 at 20+ mm/h
 * @param {number} rainMmPerHour
 * @returns {number} 0-100
 */
export function calculateRainScore(rainMmPerHour) {
  if (typeof rainMmPerHour !== 'number' || isNaN(rainMmPerHour) || rainMmPerHour <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, (rainMmPerHour / 20) * 100));
}

/**
 * Calculates low elevation score relative to area's min and max elevation (lowest elevation gets 100)
 * @param {number} cellElevation 
 * @param {number} minElevation 
 * @param {number} maxElevation 
 * @returns {number} 0-100
 */
export function calculateLowElevationScore(cellElevation, minElevation, maxElevation) {
  if (
    typeof cellElevation !== 'number' ||
    typeof minElevation !== 'number' ||
    typeof maxElevation !== 'number' ||
    isNaN(cellElevation)
  ) {
    return 50; // Neutral fallback
  }

  if (maxElevation <= minElevation) {
    return 50; // Uniform elevation across area
  }

  // Clamped relative position: lowest elevation gets 100, highest gets 0
  const clampedElev = Math.min(Math.max(cellElevation, minElevation), maxElevation);
  const score = ((maxElevation - clampedElev) / (maxElevation - minElevation)) * 100;
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculates report score based on active verified reports inside or near cell
 * @param {Array<{depth_cm?: number, confidence?: number, is_flood?: boolean}>} reports 
 * @returns {number} 0-100
 */
export function calculateReportScore(reports = []) {
  if (!Array.isArray(reports) || reports.length === 0) {
    return 0;
  }

  // Filter flood reports with positive confidence
  const floodReports = reports.filter(r => r && r.is_flood !== false && (r.depth_cm || 0) > 0);
  if (floodReports.length === 0) {
    return 0;
  }

  // Weight each report by depth and confidence (>=50cm depth is 100 score)
  let totalWeightedScore = 0;
  for (const report of floodReports) {
    const depth = Math.max(0, report.depth_cm || 0);
    const confidence = typeof report.confidence === 'number' ? Math.min(Math.max(report.confidence, 0), 1) : 0.7;
    const depthScore = Math.min(100, (depth / 50) * 100);
    totalWeightedScore += depthScore * confidence;
  }

  // Cap combined report score at 100
  return Math.min(100, Math.round(totalWeightedScore));
}

/**
 * Determines risk category from score
 * @param {number} score 
 * @returns {'green' | 'amber' | 'red'}
 */
export function getRiskLevel(score) {
  if (score < 35) return 'green';
  if (score <= 65) return 'amber';
  return 'red';
}

/**
 * Computes overall risk score (0-100) and level
 * Formula: 0.5 * rainScore + 0.25 * lowElevationScore + 0.25 * reportScore
 * @param {object} params
 * @param {number} params.rainMmPerHour
 * @param {number} params.cellElevation
 * @param {number} params.minElevation
 * @param {number} params.maxElevation
 * @param {Array} [params.reports]
 * @returns {{ score: number, level: 'green' | 'amber' | 'red', rainScore: number, lowElevationScore: number, reportScore: number }}
 */
export function calculateCellRisk({
  rainMmPerHour = 0,
  cellElevation = 0,
  minElevation = 0,
  maxElevation = 0,
  reports = []
}) {
  const rainScore = calculateRainScore(rainMmPerHour);
  const lowElevationScore = calculateLowElevationScore(cellElevation, minElevation, maxElevation);
  const reportScore = calculateReportScore(reports);

  const rawScore = (0.5 * rainScore) + (0.25 * lowElevationScore) + (0.25 * reportScore);
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));
  const level = getRiskLevel(score);

  return {
    score,
    level,
    rainScore: Math.round(rainScore),
    lowElevationScore: Math.round(lowElevationScore),
    reportScore: Math.round(reportScore),
  };
}
