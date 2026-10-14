import React from 'react';
import { ShieldCheck, Info, Cpu, CloudRain, MapPin, Database, Sparkles, CheckCircle2 } from 'lucide-react';
import { PILOT_CONFIG } from '../config';

export default function AboutPage() {
  return (
    <div className="space-y-4 pb-20">
      {/* Title */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Info className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">About FloodSense</h2>
            <p className="text-xs text-slate-400">Hyperlocal flood early warning system</p>
          </div>
        </div>
      </div>

      {/* Mandatory Privacy Note from SPEC.md Section 5 */}
      <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-2xl shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">Privacy & Data Ethics</h3>
            <p className="text-sm font-semibold text-emerald-100 mt-1 leading-relaxed">
              &ldquo;Photos are used only for flood detection. Faces and number plates are not stored or analyzed.&rdquo;
            </p>
            <p className="text-xs text-emerald-300/80 mt-1">
              Location coordinates are strictly retained for active water depth verification and expire after 3 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Pilot Scope Card */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-sm backdrop-blur-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          Active Pilot Deployment
        </h3>
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Pilot Zone:</span>
            <span className="text-white font-medium">{PILOT_CONFIG.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Coordinates:</span>
            <span className="text-slate-300 font-mono">{PILOT_CONFIG.center.lat}, {PILOT_CONFIG.center.lng}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Grid Resolution:</span>
            <span className="text-cyan-400 font-semibold">{PILOT_CONFIG.gridCellSizeMeters}m square cells</span>
          </div>
        </div>
      </div>

      {/* How it Works / Tech Architecture */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-sm backdrop-blur-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          How FloodSense Works
        </h3>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="flex gap-2.5 items-start bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-cyan-500/40">1</span>
            <p><b className="text-white">Crowdsourced Street Photos:</b> Citizens snap flooded streets with reference objects (tyres, curbs, knee).</p>
          </div>

          <div className="flex gap-2.5 items-start bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-cyan-500/40">2</span>
            <p><b className="text-white">Gemini Vision AI:</b> Accurately estimates water depth in cm and flags passability for pedestrians, bikes, and cars.</p>
          </div>

          <div className="flex gap-2.5 items-start bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-cyan-500/40">3</span>
            <p><b className="text-white">Multi-Factor Risk Model:</b> Combines Open-Meteo precipitation forecasts, terrain elevation, and verified reports.</p>
          </div>

          <div className="flex gap-2.5 items-start bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-cyan-500/40">4</span>
            <p><b className="text-white">Instant Telegram Broadcasts:</b> Sends concise natural-language warnings to commuters before they get stranded.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
