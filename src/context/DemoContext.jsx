import React, { createContext, useContext, useState, useEffect } from 'react';

const DemoContext = createContext();

export function DemoProvider({ children }) {
  const [isDemoStorm, setIsDemoStorm] = useState(() => {
    try {
      return localStorage.getItem('floodsense_demo_storm') === 'true';
    } catch {
      return false;
    }
  });

  const toggleDemoStorm = () => {
    setIsDemoStorm(prev => {
      const next = !prev;
      try {
        localStorage.setItem('floodsense_demo_storm', String(next));
      } catch (err) {
        console.warn('Failed to save demo storm state', err);
      }
      return next;
    });
  };

  return (
    <DemoContext.Provider value={{ isDemoStorm, toggleDemoStorm }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
