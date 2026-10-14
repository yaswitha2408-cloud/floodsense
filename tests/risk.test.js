import { describe, it, expect } from 'vitest';
import {
  calculateRainScore,
  calculateLowElevationScore,
  calculateReportScore,
  getRiskLevel,
  calculateCellRisk,
} from '../src/utils/risk.js';

describe('Risk Score Engine (SPEC.md Section 6)', () => {
  describe('calculateRainScore', () => {
    it('returns 0 for 0 mm/h or negative rain', () => {
      expect(calculateRainScore(0)).toBe(0);
      expect(calculateRainScore(-5)).toBe(0);
      expect(calculateRainScore(null)).toBe(0);
    });

    it('scales linearly from 0 at 0 mm/h to 100 at 20+ mm/h', () => {
      expect(calculateRainScore(10)).toBe(50);
      expect(calculateRainScore(5)).toBe(25);
      expect(calculateRainScore(20)).toBe(100);
    });

    it('caps rain score at 100 for heavy rain exceeding 20 mm/h', () => {
      expect(calculateRainScore(35)).toBe(100);
      expect(calculateRainScore(75)).toBe(100);
    });
  });

  describe('calculateLowElevationScore', () => {
    it('gives 100 score to the lowest elevation in the area', () => {
      expect(calculateLowElevationScore(900, 900, 950)).toBe(100);
    });

    it('gives 0 score to the highest elevation in the area', () => {
      expect(calculateLowElevationScore(950, 900, 950)).toBe(0);
    });

    it('scales intermediate elevations proportionally', () => {
      expect(calculateLowElevationScore(925, 900, 950)).toBe(50);
    });

    it('handles uniform elevation gracefully with neutral score', () => {
      expect(calculateLowElevationScore(920, 920, 920)).toBe(50);
    });
  });

  describe('calculateReportScore', () => {
    it('returns 0 when there are no reports or empty array', () => {
      expect(calculateReportScore([])).toBe(0);
      expect(calculateReportScore(null)).toBe(0);
    });

    it('ignores non-flood reports or 0cm depth reports', () => {
      const reports = [
        { is_flood: false, depth_cm: 0, confidence: 0.9 },
        { is_flood: true, depth_cm: 0, confidence: 0.8 },
      ];
      expect(calculateReportScore(reports)).toBe(0);
    });

    it('calculates score based on depth and confidence', () => {
      // Single report: 25cm depth (50% of 50cm scale) * 0.8 confidence = 40 score
      const reports = [{ is_flood: true, depth_cm: 25, confidence: 0.8 }];
      expect(calculateReportScore(reports)).toBe(40);
    });

    it('caps combined report score at 100', () => {
      const severeReports = [
        { is_flood: true, depth_cm: 45, confidence: 0.9 },
        { is_flood: true, depth_cm: 60, confidence: 0.95 },
      ];
      expect(calculateReportScore(severeReports)).toBe(100);
    });
  });

  describe('getRiskLevel', () => {
    it('categorizes scores correctly per SPEC.md (green <35, amber 35-65, red >65)', () => {
      expect(getRiskLevel(0)).toBe('green');
      expect(getRiskLevel(34)).toBe('green');
      expect(getRiskLevel(35)).toBe('amber');
      expect(getRiskLevel(50)).toBe('amber');
      expect(getRiskLevel(65)).toBe('amber');
      expect(getRiskLevel(66)).toBe('red');
      expect(getRiskLevel(100)).toBe('red');
    });
  });

  describe('calculateCellRisk (Integrated formula)', () => {
    it('calculates low risk (green) for dry conditions and high ground', () => {
      const result = calculateCellRisk({
        rainMmPerHour: 0,
        cellElevation: 950,
        minElevation: 900,
        maxElevation: 950,
        reports: [],
      });

      expect(result.score).toBe(0);
      expect(result.level).toBe('green');
      expect(result.rainScore).toBe(0);
      expect(result.lowElevationScore).toBe(0);
      expect(result.reportScore).toBe(0);
    });

    it('weights formula exactly as 0.5 * rain + 0.25 * lowElev + 0.25 * report', () => {
      // rain: 10 mm/h -> rainScore = 50 -> 0.5 * 50 = 25
      // lowElev: midpoint -> 50 -> 0.25 * 50 = 12.5
      // report: 25cm depth * 0.8 conf -> 40 -> 0.25 * 40 = 10
      // Total = 25 + 12.5 + 10 = 47.5 -> rounded to 48 (amber)
      const result = calculateCellRisk({
        rainMmPerHour: 10,
        cellElevation: 925,
        minElevation: 900,
        maxElevation: 950,
        reports: [{ is_flood: true, depth_cm: 25, confidence: 0.8 }],
      });

      expect(result.score).toBe(48);
      expect(result.level).toBe('amber');
    });

    it('triggers high risk (red) during heavy storm scenario', () => {
      const result = calculateCellRisk({
        rainMmPerHour: 28, // rainScore = 100 -> 50 points
        cellElevation: 905, // low ground (~90%) -> 22.5 points
        minElevation: 900,
        maxElevation: 950,
        reports: [{ is_flood: true, depth_cm: 40, confidence: 0.9 }], // ~72 -> 18 points
      });

      expect(result.score).toBeGreaterThan(65);
      expect(result.level).toBe('red');
    });
  });
});
