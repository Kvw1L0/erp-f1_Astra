'use client';

import React, { useState } from 'react';

export default function F1CarSvg({ color = '#E10600', number = 1, isBoosted = false }) {
  const [imgError, setImgError] = useState(false);
  const imagePath = `/cars/car-${number}.png`;

  return (
    <div className={`relative inline-block select-none ${isBoosted ? 'filter drop-shadow-[0_0_20px_#00F0FF]' : ''}`}>
      {!imgError ? (
        <img
          src={imagePath}
          alt={`Monoplaza Escudería ${number}`}
          onError={() => setImgError(true)}
          className="h-10 md:h-12 w-auto object-contain max-w-[140px] drop-shadow-md select-none pointer-events-none"
        />
      ) : (
        /* Fallback Vectorial F1 */
        <svg
          viewBox="0 0 160 48"
          className="w-24 md:w-32 h-auto select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Neumático Trasero */}
          <rect x="8" y="4" width="16" height="10" rx="3" fill="#15171E" stroke="#2B3040" strokeWidth="1.5" />
          <rect x="8" y="34" width="16" height="10" rx="3" fill="#15171E" stroke="#2B3040" strokeWidth="1.5" />
          <circle cx="16" cy="9" r="2.5" fill="#FFB800" />
          <circle cx="16" cy="39" r="2.5" fill="#FFB800" />

          {/* Neumático Delantero */}
          <rect x="120" y="6" width="14" height="9" rx="2.5" fill="#15171E" stroke="#2B3040" strokeWidth="1.5" />
          <rect x="120" y="33" width="14" height="9" rx="2.5" fill="#15171E" stroke="#2B3040" strokeWidth="1.5" />
          <circle cx="127" cy="10.5" r="2" fill="#FFB800" />
          <circle cx="127" cy="37.5" r="2" fill="#FFB800" />

          {/* Alerón Trasero */}
          <path d="M 4 8 L 18 8 L 18 40 L 4 40 Z" fill="#111319" stroke="#374151" strokeWidth="1" />
          <rect x="2" y="12" width="4" height="24" rx="1" fill={color} />

          {/* Chasis Principal */}
          <path
            d="M 18 20 
               L 42 15 
               L 75 14 
               L 105 18 
               L 138 22 
               L 148 24 
               L 138 26 
               L 105 30 
               L 75 34 
               L 42 33 
               L 18 28 
               Z"
            fill={color}
          />

          {/* Aleta de tiburón */}
          <path
            d="M 24 24 
               L 60 21 
               L 80 22 
               L 60 27 
               Z"
            fill="#0B0D13"
            opacity="0.85"
          />

          {/* Cockpit & Casco */}
          <ellipse cx="78" cy="24" rx="12" ry="4.5" fill="#0B0D13" stroke="#2D3748" strokeWidth="1" />
          <circle cx="76" cy="24" r="3.2" fill="#F3F4F6" stroke="#111827" strokeWidth="1" />
          <path d="M 76 22.5 Q 79 24 76 25.5" stroke="#FF8000" strokeWidth="1.2" strokeLinecap="round" />

          {/* Halo */}
          <path d="M 72 24 L 84 21 M 72 24 L 84 27" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />

          {/* Alerón Delantero */}
          <path
            d="M 135 24 
               L 154 24 
               L 156 12 
               L 150 12 
               L 142 22 
               L 142 26 
               L 150 36 
               L 156 36 
               L 154 24 
               Z"
            fill="#111319"
            stroke={color}
            strokeWidth="0.8"
          />
          <rect x="152" y="10" width="3" height="28" rx="1" fill={color} />

          {/* Número */}
          <text
            x="112"
            y="26"
            fill="#FFFFFF"
            fontSize="7"
            fontWeight="900"
            fontFamily="monospace"
            textAnchor="middle"
          >
            {number}
          </text>
        </svg>
      )}
    </div>
  );
}
