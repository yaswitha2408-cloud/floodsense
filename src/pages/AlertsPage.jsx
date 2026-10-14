import React from 'react';
import { Bell, AlertTriangle, Send, ExternalLink, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { PILOT_CONFIG } from '../config';
import { useDemo } from '../context/DemoContext';

const SAMPLE_ALERTS = [
  {
    id: 'cell-r01',
    cellId: 'Cell-R01 (East Campus Underpass)',
    riskLevel: 'HIGH (Score 84/100)',
    levelColor: 'rose',
    time: '8 minutes ago',
    rainForecast: '26 mm/h heavy downpour',
    avgDepth: '38 cm',
    aiWarning: 'Dangerous standing water (approx 38cm) under East Campus Underpass following intense 26mm/h rain; low-clearance vehicles must avoid.',
  },
  {
    id: 'cell-r05',
    cellId: 'Cell-R05 (100ft Road Intersection)',
    riskLevel: 'HIGH (Score 78/100)',
    levelColor: 'rose',
    time: '24 minutes ago',
    rainForecast: '21 mm/h rain',
    avgDepth: '32 cm',
    aiWarning: 'Severe water accumulation near storm drains at 100ft Road intersection; pedestrian crossing blocked, proceed with extreme caution.',
  },
  {
    id: 'cell-a02',
    cellId: 'Cell-A02 (Main Gate Corridor)',
    riskLevel: 'MODERATE (Score 58/100)',
    levelColor: 'amber',
    time: '45 minutes ago',
    rainForecast: '14 mm/h steady rain',
    avgDepth: '18 cm',
    aiWarning: 'Moderate sidewalk pooling near Main Gate; bicycles and pedestrians advised to use elevated walkway.',
  },
];

export default function AlertsPage() {
  const { isDemoStorm } = useDemo();

  return (
    <div className="space-y-4 pb-20">
      {/* Header card with Telegram connection button */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/60 p-4 rounded-2xl border border-cyan-800/40 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Hyperlocal Flood Alerts</h2>
              <p className="text-xs text-slate-300">Live AI warnings for high-risk flood cells.</p>
            </div>
          </div>
        </div>

        {/* Telegram Push Bot Link (SPEC.md requirement: Button to open Telegram bot link) */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Instant Telegram Alerts</span>
            <span className="text-[11px] text-slate-400">Receive red-cell push warnings on your phone</span>
          </div>
          <a
            id="btn-telegram-bot"
            href={PILOT_CONFIG.telegramBotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open Telegram Bot</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Demo status alert banner if demo storm is on */}
      {isDemoStorm && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Showing simulated storm warnings triggered by demo heavy-rain scenario.</span>
        </div>
      )}

      {/* High-Risk Cells List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-rose-400" />
            Current Active Risk Cells ({SAMPLE_ALERTS.length})
          </h3>
          <span className="text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">
            Updated just now
          </span>
        </div>

        {SAMPLE_ALERTS.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border shadow-md transition-all ${
              alert.levelColor === 'rose'
                ? 'bg-slate-900/85 border-rose-500/40 hover:border-rose-500/60'
                : 'bg-slate-900/85 border-amber-500/40 hover:border-amber-500/60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      alert.levelColor === 'rose'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    }`}
                  >
                    {alert.riskLevel}
                  </span>
                  <span className="text-[11px] text-slate-400">{alert.time}</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1.5">{alert.cellId}</h4>
              </div>
            </div>

            {/* AI Warning Text (SPEC.md Section 5 & 6) */}
            <div className="mt-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Plain-Language Advisory</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{alert.aiWarning}"
              </p>
            </div>

            {/* Metrics */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
              <span>Rain Forecast: <b className="text-slate-200">{alert.rainForecast}</b></span>
              <span>Avg Depth: <b className="text-rose-400 font-bold">{alert.avgDepth}</b></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
