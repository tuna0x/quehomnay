import React from 'react';

export default function LotusCandle({ side = 'left' }) {
  return (
    <div className={`hidden sm:flex flex-col items-center pointer-events-none select-none transition-opacity duration-500 opacity-80 hover:opacity-100 ${
      side === 'left' ? '-mr-2' : '-ml-2'
    }`}>
      {/* Animated Flickering Flame */}
      <div className="relative flex flex-col items-center mb-1">
        {/* Flame glow halo */}
        <div className="absolute -top-3 w-10 h-10 rounded-full bg-orange-500/20 blur-md animate-pulse"></div>
        <div className="absolute -top-1 w-6 h-6 rounded-full bg-yellow-400/30 blur-sm animate-ping" style={{ animationDuration: '2.5s' }}></div>

        {/* Flame SVG */}
        <svg width="18" height="28" viewBox="0 0 20 32" className="drop-shadow-[0_0_8px_rgba(255,165,0,0.8)] animate-pulseGlow">
          <defs>
            <linearGradient id={`flameGrad_${side}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="30%" stopColor="#EA580C" />
              <stop offset="70%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
            <linearGradient id={`flameCore_${side}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="25%" stopColor="#F97316" />
              <stop offset="80%" stopColor="#FEF9C3" />
            </linearGradient>
          </defs>
          {/* Outer flame */}
          <path
            d="M10 0 C14 8, 19 14, 19 21 C19 27, 15 31, 10 31 C5 31, 1 27, 1 21 C1 14, 6 8, 10 0 Z"
            fill={`url(#flameGrad_${side})`}
          />
          {/* Inner hot core */}
          <path
            d="M10 10 C12 15, 14 18, 14 23 C14 27, 12 29, 10 29 C8 29, 6 27, 6 23 C6 18, 8 15, 10 10 Z"
            fill={`url(#flameCore_${side})`}
          />
        </svg>

        {/* Candle wick */}
        <div className="w-[1.5px] h-2 bg-[#261208] -mt-1 z-10"></div>
      </div>

      {/* Lotus Pedestal Lamp (Đèn Hoa Sen Bằng Đồng Thếp Vàng) */}
      <svg width="60" height="42" viewBox="0 0 80 56" className="drop-shadow-lg">
        <defs>
          <linearGradient id={`bronzeGrad_${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#574116" />
            <stop offset="35%" stopColor="#C9A24A" />
            <stop offset="50%" stopColor="#FFF1C5" />
            <stop offset="65%" stopColor="#C9A24A" />
            <stop offset="100%" stopColor="#4A3610" />
          </linearGradient>
          <linearGradient id={`petalGrad_${side}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#6E1B1B" />
            <stop offset="40%" stopColor="#991B1B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Back Petals */}
        <path d="M22 28 C25 15, 35 12, 40 18 C45 12, 55 15, 58 28 Z" fill="#781D1D" stroke="#C9A24A" strokeWidth="0.8" />
        
        {/* Center Cup for Candle */}
        <ellipse cx="40" cy="22" rx="14" ry="4" fill="#3D120E" stroke="#C9A24A" strokeWidth="1" />

        {/* Front Lotus Petals */}
        <path d="M40 38 C32 30, 24 22, 28 15 C33 22, 37 30, 40 38 Z" fill={`url(#petalGrad_${side})`} stroke="#E7C978" strokeWidth="1" />
        <path d="M40 38 C48 30, 56 22, 52 15 C47 22, 43 30, 40 38 Z" fill={`url(#petalGrad_${side})`} stroke="#E7C978" strokeWidth="1" />
        <path d="M40 40 C34 32, 34 22, 40 13 C46 22, 46 32, 40 40 Z" fill="#B91C1C" stroke="#FFF1C5" strokeWidth="1.2" />

        {/* Bronze Base */}
        <path d="M35 38 L45 38 L48 48 L32 48 Z" fill={`url(#bronzeGrad_${side})`} />
        <ellipse cx="40" cy="48" rx="20" ry="5" fill={`url(#bronzeGrad_${side})`} stroke="#574116" strokeWidth="1" />
        <ellipse cx="40" cy="51" rx="24" ry="4" fill="#362308" />
      </svg>
    </div>
  );
}
