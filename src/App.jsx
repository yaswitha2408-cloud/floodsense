import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DemoProvider } from './context/DemoContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ReportPage from './pages/ReportPage';
import MapPage from './pages/MapPage';
import AlertsPage from './pages/AlertsPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <DemoProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0a1124] to-slate-950 text-slate-100 flex flex-col items-center">
          {/* Mobile-first responsive app shell */}
          <div className="w-full max-w-md min-h-screen flex flex-col bg-slate-950/80 shadow-2xl relative border-x border-slate-800/80">
            <Header />
            <main className="flex-1 p-4 overflow-y-auto">
              <Routes>
                <Route path="/" element={<ReportPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        </div>
      </BrowserRouter>
    </DemoProvider>
  );
}
