import React from 'react';
import { Waves, Zap, CloudRain, AlertCircle } from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { PILOT_CONFIG } from '../config';

export default function Header() {
  const { isDemoStorm, toggleDemoStorm } = useDemo();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Pilot City */}
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white shadow-md shadow-cyan-500/20">
            <Waves className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-bold tracking-tight text-white m-0">FloodSense</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 leading-tight">
              <span>{PILOT_CONFIG.shortName}</span>
            </p>
          </div>
        </div>

        {/* Demo Storm Toggle */}
        <button
          id="demo-storm-toggle"
          onClick={toggleDemoStorm}
          aria-label="Toggle Demo Storm"
          className={`relative group flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
            isDemoStorm
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/20'
              : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
          }`}
        >
          {isDemoStorm ? (
            <CloudRain className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
          )}
          <span className="font-semibold">{isDemoStorm ? 'Demo Storm: ON' : 'Demo Storm'}</span>
        </button>
      </div>

      {/* Demo Mode Notice Banner when active */}
      {isDemoStorm && (
        <div className="bg-amber-500/10 border-t border-b border-amber-500/30 px-4 py-1 text-center">
          <p className="text-[11px] font-medium text-amber-300 flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulated heavy rain scenario active (Demo Mode)</span>
          </p>
        </div>
      )}
    </header>
  );
}
