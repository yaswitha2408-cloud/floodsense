FloodSense: Hyperlocal Flood Early Warning
1. Goal
Scope: ONE pilot city/campus (configurable in src/config.js). Build only what is listed here.
2. Tech Stack (all free tiers)
Front end: React + Vite + Tailwind CSS, installable PWA
Map: Leaflet + OpenStreetMap tiles (no Google Maps)
Backend: Vercel serverless functions in /api
Database + image storage: Supabase (Postgres + Storage)
AI: Gemini API (key in .env as GEMINI_API_KEY, used ONLY in /api, never in front-end code)
Weather: Open-Meteo hourly precipitation API (no key)
Elevation: Open-Meteo elevation API (no key)
Alerts: Telegram Bot API (token in .env)
3. Environment variables (.env, never commit)
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
Add .env to .gitignore. Provide .env.example with empty values.
4. Data Model (Supabase)
Table reports:
id (uuid, pk), created_at (timestamptz, default now())
lat (float), lng (float)
image_url (text)
is_flood (bool), depth_cm (int), reference_object (text)
passable_pedestrian (bool), passable_bike (bool), passable_car (bool)
confidence (float 0-1)
status (text: 'active' | 'expired' | 'rejected')
note (text, optional)
Rules: reports with status 'active' older than 3 hours are treated as expired and hidden from the map.
Table alerts_log: id, cell_id, risk_level, message, created_at.
5. Screens
Report (/): camera capture (<input type="file" accept="image/*" capture="environment">), auto geolocation, "Analyze" button, show AI result in an editable preview (depth, passability, note), "Submit" button.
Map (/map): Leaflet map. Colored pins by depth (green <10cm, amber 10-30cm, red >30cm). Risk grid overlay (green/amber/red cells). Tap a pin to see photo, depth, time, confidence. Filter: "last 1h / 3h".
Alerts (/alerts): list of current high-risk cells with the AI-written warning text and time. Button to open Telegram bot link.
About (/about): short privacy note: "Photos are used only for flood detection. Faces and number plates are not stored or analyzed."
Bottom tab navigation, mobile-first layout, clean modern UI, blue/teal water theme.
6. API Endpoints (/api)
POST /api/analyze
Input: { imageBase64, mimeType }
Calls Gemini (vision) with structured JSON output. Prompt:
"You are a flood assessment assistant. Look at this street photo. Decide if it shows real street flooding. Estimate water depth in cm using reference objects (car tyre ~65cm tall, curb ~15cm, knee ~50cm, ankle ~10cm). Say which reference you used. Say whether pedestrians, bikes and cars could pass. If the image is not a real street scene, looks edited, or is unclear, set is_flood to false and lower the confidence. Return JSON only."
Response schema:
{
  "is_flood": boolean,
  "depth_cm": integer,
  "reference_object": string,
  "passable_for": { "pedestrian": boolean, "bike": boolean, "car": boolean },
  "confidence": number
}
Validate the output. On any failure, return { is_flood:false, confidence:0, error:"analysis_failed" } so the UI shows "Could not analyze, try another photo". Reject images over 4 MB. Resize on the client before upload.
POST /api/reports
Saves a report to Supabase (uploads image to Storage first). If confidence < 0.4, save with status 'rejected'.
GET /api/reports?hours=3
Returns active reports within the time window.
GET /api/risk
Build a grid (about 500 m cells) over the pilot area.
For each cell: fetch hourly rain forecast for the next 6 hours (batch the Open-Meteo calls, cache 15 minutes) and cell elevation.
Risk score (0-100) = 0.5 * rainScore + 0.25 * lowElevationScore + 0.25 * reportScore
rainScore: scaled from forecast mm/h (0 at 0, 100 at 20+ mm/h)
lowElevationScore: cell elevation relative to the area's min/max (lowest = 100)
reportScore: based on verified active reports inside or near the cell, weighted by depth and confidence
Levels: green <35, amber 35-65, red >65.
For red cells, ask Gemini (text only) for a one-sentence plain-language warning using the cell's street name, rain forecast and recent report depth. Cache the text per cell for 15 minutes.
Return [{ cellId, bounds, score, level, warning }].
POST /api/notify (called by risk logic or manually)
Sends the warning to Telegram when a cell turns red. Do not send more than one alert per cell per hour (use alerts_log).
7. Demo Mode (important)
scripts/seed.js: inserts 25 realistic fake reports across the pilot area with varied depths and times.
A "Demo storm" toggle in the app header replaces live rain forecast with a built-in heavy-rain scenario so the risk map and alerts work regardless of real weather.
Demo data must be clearly labeled in the UI when demo mode is on.
8. Non-functional requirements
Works on a phone browser over slow networks: compress images client-side to about 1024 px width.
Handle loading, empty and error states on every screen.
Cache Gemini and weather calls to stay inside free rate limits.
Do not store raw location history beyond report coordinates.
Accessible: large tap targets, readable contrast, alt text on photos.
9. Build order (one step at a time, verify each before moving on)
Scaffold the Vite + React + Tailwind PWA, routes, and bottom navigation.
Implement /api/analyze with Gemini and the Report screen (without saving).
Connect Supabase: save and fetch reports.
Build the Map screen with pins and filters.
Implement /api/risk and the grid overlay.
Add the Alerts screen and Telegram notifications.
Add the seed script and Demo storm toggle.
Add the About page, polish the UI, write README, and add the Vercel config.
10. Definition of done
A judge can: open the app on a phone, snap a flood photo, see AI-estimated depth and passability, submit it, watch it appear on the map, see nearby cells turn amber or red during the demo storm, and see a plain-language alert in the Alerts tab and Telegram.
11. Rules for the coding agent
Only change files related to the current step.
Never put API keys in front-end code or commit them.
After each step, run the app, test the flow in the browser, and fix errors before reporting done.
Keep the code simple and commented so the team can explain it.