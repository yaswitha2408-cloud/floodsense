// FloodSense Configuration
// Single pilot city/campus scope as per SPEC.md Section 1

export const PILOT_CONFIG = {
  name: "Bengaluru Tech Corridor",
  shortName: "Bengaluru Central",
  center: {
    lat: 12.9716,
    lng: 77.5946
  },
  defaultZoom: 14,
  bounds: {
    minLat: 12.945,
    maxLat: 12.995,
    minLng: 77.565,
    maxLng: 77.625
  },
  gridCellSizeMeters: 500,
  telegramBotUsername: "FloodSenseAlertsBot",
  telegramBotUrl: "https://t.me/FloodSenseAlertsBot",
  depthThresholds: {
    greenMax: 10,  // < 10cm: Safe / minor
    amberMax: 30   // 10-30cm: Caution
    // > 30cm: Danger / Red
  },
  riskScoreThresholds: {
    greenMax: 35,  // < 35
    amberMax: 65   // 35 - 65
    // > 65: Red
  }
};

export default PILOT_CONFIG;
