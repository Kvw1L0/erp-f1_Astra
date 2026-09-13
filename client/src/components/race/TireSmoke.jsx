'use client';

import React from 'react';

export default function TireSmoke() {
  const puffs = [
    { id: 1, delay: 0, size: 14, top: -4 },
    { id: 2, delay: 0.1, size: 18, top: 2 },
    { id: 3, delay: 0.2, size: 22, top: -2 }
  ];

  return (
    <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 pointer-events-none z-0">
      {puffs.map(p => (
        <span
          key={p.id}
          className="absolute rounded-full bg-white/40 blur-sm"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            top: `${p.top}px`,
            animation: 'f1-smoke 0.8s ease-out infinite',
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes f1-smoke {
          0% {
            transform: translate(0, 0) scale(0.6);
            opacity: 0.7;
          }
          100% {
            transform: translate(-30px, -8px) scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
