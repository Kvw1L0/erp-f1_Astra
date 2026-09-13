'use client';

import React from 'react';

export default function SkidSparks({ count = 8 }) {
  const sparks = Array.from({ length: count }, (_, i) => ({
    id: i,
    delay: i * 0.08,
    duration: 0.35 + Math.random() * 0.25,
    topOffset: (Math.random() - 0.5) * 14,
    size: 2 + Math.random() * 3,
    color: i % 2 === 0 ? '#FFE066' : '#FF7A00'
  }));

  return (
    <div className="absolute left-[-24px] bottom-1 pointer-events-none z-0 overflow-visible">
      {sparks.map(s => (
        <span
          key={s.id}
          className="absolute rounded-full filter drop-shadow-[0_0_6px_#FFA500]"
          style={{
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.color,
            top: `${s.topOffset}px`,
            left: 0,
            animation: `f1-spark ${s.duration}s infinite linear`,
            animationDelay: `${s.delay}s`,
            opacity: 0.9
          }}
        />
      ))}
      <style jsx>{`
        @keyframes f1-spark {
          0% {
            transform: translate(0, 0) scale(1.2);
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translate(-38px, 6px) scale(0.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
