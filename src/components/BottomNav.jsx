import React from 'react';
import { NavLink } from 'react-router-dom';
import { Camera, Map, Bell, Info } from 'lucide-react';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Report',
    icon: Camera,
    id: 'nav-report',
  },
  {
    to: '/map',
    label: 'Map',
    icon: Map,
    id: 'nav-map',
  },
  {
    to: '/alerts',
    label: 'Alerts',
    icon: Bell,
    id: 'nav-alerts',
    hasBadge: true,
  },
  {
    to: '/about',
    label: 'About',
    icon: Info,
    id: 'nav-about',
  },
];

export default function BottomNav() {
  return (
    <nav
      id="bottom-navigation"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_20px_rgba(0,0,0,0.4)]"
    >
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {NAV_ITEMS.map(({ to, label, icon: Icon, id, hasBadge }) => (
          <NavLink
            key={to}
            to={to}
            id={id}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 min-w-[64px] ${
                isActive
                  ? 'text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-cyan-500/15 shadow-sm shadow-cyan-500/20 scale-105' : ''
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'text-cyan-400 scale-110' : 'text-slate-400'
                    }`}
                  />
                  {hasBadge && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900 animate-pulse" />
                  )}
                </div>
                <span
                  className={`text-[11px] tracking-tight transition-all duration-200 ${
                    isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>

                {isActive && (
                  <span className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-sm shadow-cyan-400/50" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
