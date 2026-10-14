import React, { useState } from 'react';
import { Map as MapIcon, Filter, Clock, AlertTriangle, Layers, Navigation, Droplets, CheckCircle2 } from 'lucide-react';
import { PILOT_CONFIG } from '../config';

// Sample visual pins for Step 1 scaffolding preview
const MOCK_PINS = [
  {
    id: 'pin-1',
    street: '100ft Road, 4th Block',
    depth_cm: 35,
    level: 'red',
    time: '12m ago',
    confidence: 0.94,
    coords: '12.9716, 77.5946',
    passable: { car: false, bike: false, pedestrian: false },
    note: 'Deep water pooling across both lanes.',
  },
  {
    id: 'pin-2',
    street: 'Campus North Entrance',
    depth_cm: 18,
    level: 'amber',
    time: '42m ago',
    confidence: 0.86,
    coords: '12.9780, 77.5980',
    passable: { car: true, bike: false, pedestrian: false },
    note: 'Curb covered with murky runoff.',
  },
  {
    id: 'pin-3',
    street: 'Tech Park Avenue',
    depth_cm: 6,
    level: 'green',
    time: '1h 10m ago',
    confidence: 0.91,
    coords: '12.9650, 77.5890',
    passable: { car: true, bike: true, pedestrian: true },
    note: 'Minor surface water, easily passable.',
  },
];

export default function MapPage() {
  const [filterHours, setFilterHours] = useState(3); // 1 or 3
  const [selectedPin, setSelectedPin] = useState(MOCK_PINS[0]);
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div className="space-y-3 pb-20">
      {/* Filters & Map Control Header */}
      <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <button
            id="filter-1h"
            onClick={() => setFilterHours(1)}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterHours === 1
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 1h
          </button>
          <button
            id="filter-3h"
            onClick={() => setFilterHours(3)}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterHours === 3
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 3h
          </button>
        </div>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            showGrid
              ? 'bg-cyan-950/70 border-cyan-700/60 text-cyan-300'
              : 'bg-slate-950/80 border-slate-800 text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Risk Grid</span>
        </button>
      </div>

      {/* Map View Frame */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex flex-col justify-between p-3">
        {/* Map Background Grid Simulation */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px), linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)`,
            backgroundSize: '24px 24px, 48px 48px, 48px 48px',
          }}
        />

        {/* 500m Grid Risk Cell Overlays (Simulation for Step 1) */}
        {showGrid && (
          <div className="absolute inset-4 grid grid-cols-3 grid-rows-2 gap-2 opacity-50 pointer-events-none">
            <div className="rounded-xl border border-rose-500/50 bg-rose-500/15 p-1 text-[9px] text-rose-300 font-mono">Cell R-01 (Risk 82)</div>
            <div className="rounded-xl border border-amber-500/50 bg-amber-500/15 p-1 text-[9px] text-amber-300 font-mono">Cell A-02 (Risk 54)</div>
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/15 p-1 text-[9px] text-emerald-300 font-mono">Cell G-03 (Risk 18)</div>
            <div className="rounded-xl border border-amber-500/50 bg-amber-500/15 p-1 text-[9px] text-amber-300 font-mono">Cell A-04 (Risk 45)</div>
            <div className="rounded-xl border border-rose-500/50 bg-rose-500/15 p-1 text-[9px] text-rose-300 font-mono">Cell R-05 (Risk 76)</div>
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/15 p-1 text-[9px] text-emerald-300 font-mono">Cell G-06 (Risk 12)</div>
          </div>
        )}

        {/* Simulated Pins */}
        <div className="relative z-10 w-full h-full flex items-center justify-around">
          {MOCK_PINS.map((pin) => (
            <button
              key={pin.id}
              onClick={() => setSelectedPin(pin)}
              className="flex flex-col items-center group cursor-pointer focus:outline-none"
            >
              <div
                className={`relative px-2 py-1 rounded-lg text-xs font-black shadow-lg flex items-center gap-1 border transition-transform group-hover:scale-110 ${
                  pin.level === 'red'
                    ? 'bg-rose-500 text-white border-rose-400 ring-4 ring-rose-500/30 animate-pulse'
                    : pin.level === 'amber'
                    ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-500/30'
                    : 'bg-emerald-500 text-slate-950 border-emerald-300 ring-2 ring-emerald-500/30'
                }`}
              >
                <Droplets className="w-3 h-3" />
                <span>{pin.depth_cm}cm</span>
              </div>
              <div className="w-0.5 h-3 bg-slate-400" />
              <div className="w-2 h-1 rounded-full bg-slate-600 blur-[1px]" />
            </button>
          ))}
        </div>

        {/* Map Legend Overlay */}
        <div className="relative z-10 bg-slate-900/90 backdrop-blur-md rounded-xl p-2 border border-slate-800 text-[10px] flex items-center justify-between text-slate-300">
          <span className="font-semibold text-slate-400 uppercase tracking-wider">Depth Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>&lt;10cm Minor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>10-30cm Caution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>&gt;30cm Danger</span>
          </div>
        </div>
      </div>

      {/* Selected Pin Details (SPEC.md Section 5: tap a pin to see photo, depth, time, confidence) */}
      {selectedPin && (
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                selectedPin.level === 'red' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                selectedPin.level === 'amber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {selectedPin.depth_cm} cm Depth
              </span>
              <h3 className="text-sm font-bold text-white mt-1">{selectedPin.street}</h3>
              <p className="text-[11px] text-slate-400">{selectedPin.note}</p>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
              {selectedPin.time}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">AI Confidence</span>
              <span className="text-xs font-semibold text-cyan-400">
                {Math.round(selectedPin.confidence * 100)}% Verified
              </span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">Car Passable?</span>
              <span className={`text-xs font-semibold ${selectedPin.passable.car ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedPin.passable.car ? 'Yes (Slow)' : 'No (Hazard)'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
