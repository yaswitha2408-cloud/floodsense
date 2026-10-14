## Problem and Impact
FloodSense supports public safety, emergency response, environmental resilience, and citizen engagement. Heavy rain floods streets within minutes, but warnings cover whole cities. FloodSense gives street-level, AI-verified warnings so people avoid unsafe roads and city teams respond faster.

## How AI Is Used
- Gemini vision: verifies flood photos, estimates water depth, and judges passability for pedestrians, bikes, and cars.
- Gemini text: turns risk scores into plain-language warnings.FloodSense: Street-Level Flood Early Warning
Flood warnings tell you a city will flood. FloodSense tells you which street to avoid, right now.
The Problem
Heavy rain can flood streets within minutes, but official warnings usually cover a whole city or region. People get stranded, injured, or lose vehicles because they cannot tell which specific road or underpass is unsafe.
Our Solution
FloodSense is a mobile-first web app (PWA) that turns citizen photos into street-level flood warnings.
A citizen uploads a photo of a flooded street.
Gemini vision AI checks that it is a real street scene, estimates water depth using reference objects (tyres, curbs, knees), and judges whether pedestrians, bikes, and cars can pass.
Verified reports are combined with rain forecasts and elevation data to build a live risk map.
When a street area turns high-risk, an alert is sent (Telegram) with a plain-language warning.
Key Features
AI-verified flood reports with depth estimate, passability, and confidence score
Live map with colored pins and a street-area risk grid (green / amber / red)
Risk score from forecast rainfall, low elevation, and nearby reports
Plain-language warnings written by Gemini
Telegram alerts
Demo Storm mode that simulates a heavy-rain scenario for presentations
Reports expire after 3 hours so the map stays current
Privacy-first: photos are used only for flood detection, with no accounts and no location history
Tech Stack
Layer
Tools
AI
Gemini API (Google AI Studio)
Front end
React, Vite, Tailwind CSS, PWA
Map
Leaflet + OpenStreetMap
Backend
Vercel serverless functions
Database and storage
Supabase
Weather and elevation
Open-Meteo
Alerts
Telegram Bot API
Built with
Google Antigravity
Project Status
[x] App scaffold: routes, bottom navigation, Demo Storm toggle
[ ] Gemini flood analysis endpoint (/api/analyze) and Report screen
[ ] Saving and loading reports (Supabase)
[ ] Live map with pins and filters
[ ] Risk grid from rain forecast and elevation
[ ] Telegram alerts
(Tick the boxes as features are completed.)
Getting Started
Prerequisites
Node.js (LTS)
A Gemini API key (aistudio.google.com)
A Supabase project
A Telegram bot token (from @BotFather)
Setup
git clone https://github.com/yaswitha2408-cloud/floodsense.git
cd floodsense
npm install
Create a .env file in the project root (never commit it):
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
Run locally:
npm run dev
Then open the local link shown in the terminal (usually http://localhost:5173).
Limitations
Depth estimates from photos are approximate and shown with a confidence score.
The app is advisory and does not replace official flood warnings.
Accuracy improves as more verified reports come in. The forecast and elevation data work even with few reports.
Future Scope
Automatic blurring of faces and number plates
Trust scores for repeat reporters
SMS alerts for low-connectivity areas
Hotspot history to support drainage planning
Integration with city control rooms and flood sensors
Multilingual alerts and voice readout
Team
yaswitha kothapalli
License
Add a license of your choice (for example MIT).
