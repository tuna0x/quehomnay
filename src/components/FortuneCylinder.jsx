import React, { useEffect } from 'react';
import { playShakeSound } from '../utils/audio';

export default function FortuneCylinder({ isShaking, onClick, disabled }) {
  useEffect(() => {
    let interval;
    if (isShaking) {
      playShakeSound();
      interval = setInterval(() => {
        playShakeSound();
      }, 300);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isShaking]);

  return (
    <div 
      onClick={!disabled && !isShaking ? onClick : undefined}
      className={`relative select-none flex flex-col items-center justify-center my-4 group ${
        disabled ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      {/* Sacred Rotating Trigram / Mandala Ring in Background */}
      <div 
        className={`absolute w-72 h-72 sm:w-84 sm:h-84 rounded-full border border-gold-ancient/20 pointer-events-none transition-all duration-1000 ${
          isShaking 
            ? 'scale-115 border-gold-bright/60 rotate-180 animate-spin shadow-[0_0_50px_rgba(231,201,120,0.3)]' 
            : 'group-hover:scale-105 group-hover:border-gold-ancient/40'
        }`}
        style={{ animationDuration: isShaking ? '3s' : '20s' }}
      >
        {/* Cardinal Dots */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gold-bright shadow-[0_0_8px_#E7C978]"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-gold-bright shadow-[0_0_8px_#E7C978]"></div>
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gold-bright shadow-[0_0_8px_#E7C978]"></div>
        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gold-bright shadow-[0_0_8px_#E7C978]"></div>
        <div className="absolute inset-4 rounded-full border border-dashed border-gold-ancient/15"></div>
      </div>

      {/* Atmospheric Spiritual Glow */}
      <div 
        className={`absolute w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isShaking 
            ? 'bg-gradient-to-t from-gold-bright/40 to-temple-seal/40 scale-125 opacity-100' 
            : 'bg-gradient-to-t from-temple-red/30 to-gold-ancient/20 opacity-40 group-hover:opacity-80'
        }`}
      />

      {/* 3D Ornate Cylinder Graphic */}
      <div 
        className={`relative w-52 sm:w-60 h-64 sm:h-72 flex items-center justify-center transition-transform duration-300 ${
          isShaking ? 'animate-shake scale-105' : 'group-hover:scale-103'
        }`}
      >
        <img
          src="/cylinder.jpg"
          alt="Ống Xăm Linh Thiêng"
          className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
        />

        {/* Shaking energy aura ring */}
        {isShaking && (
          <div className="absolute inset-0 rounded-full border-2 border-gold-bright/70 animate-ping opacity-30 pointer-events-none"></div>
        )}
      </div>

      {/* Ritual Hint & Status */}
      <div className="mt-2 text-center relative z-10">
        {isShaking ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-temple-red/70 border border-gold-bright/60 shadow-gold-glow animate-pulse">
            <span className="w-2 h-2 rounded-full bg-gold-bright animate-ping"></span>
            <span className="text-xs font-serif font-bold text-gold-bright tracking-wider">
              Đang lắc ống xăm... Lòng thành tất ứng
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-gold-pale/70 font-serif tracking-widest uppercase flex items-center gap-1.5 group-hover:text-gold-bright transition">
              <span>✦</span> Chạm để lắc quẻ <span>✦</span>
            </span>
            <span className="text-[10px] text-gold-muted/50 font-serif italic">
              Hoặc nhập điều băn khoăn bên dưới để gieo quẻ riêng
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
