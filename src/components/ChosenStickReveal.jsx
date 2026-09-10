import React from 'react';
import { Sparkles, ScrollText } from 'lucide-react';

export default function ChosenStickReveal({ fortune, onOpenScroll }) {
  return (
    <div className="w-full max-w-sm mx-auto my-6 px-4 flex flex-col items-center animate-unroll text-center">
      
      {/* Floating Sacred Stick */}
      <div className="relative group cursor-pointer" onClick={onOpenScroll}>
        {/* Divine halo aura */}
        <div className="absolute inset-0 bg-gold-ancient/40 rounded-full blur-2xl animate-pulseGlow"></div>

        {/* 3D Rendered Stick Graphic */}
        <div className="relative w-48 sm:w-56 h-72 sm:h-80 mx-auto transition-transform duration-500 hover:scale-105">
          <img
            src="/stick.jpg"
            alt="Thẻ Xăm Đã Giáng"
            className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(231,201,120,0.4)]"
          />
        </div>

        {/* Level Banner Over Stick */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-temple-red/90 border border-gold-bright shadow-lg backdrop-blur-sm whitespace-nowrap">
          <span className="font-serif font-bold text-xs text-gold-bright tracking-widest">
            {fortune.ten_que} • {fortune.muc === 'Thượng' ? 'Thượng Kiết' : fortune.muc === 'Trung' ? 'Trung Bình' : 'Hạ Thứ'}
          </span>
        </div>
      </div>

      {/* Action to reveal card */}
      <div className="mt-4 space-y-2">
        <p className="text-xs font-serif text-gold-pale/80 italic">
          Thẻ xăm đã giáng thế linh ứng với tâm nguyện của bạn
        </p>

        <button
          onClick={onOpenScroll}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6E1B1B] via-[#C9A24A] to-[#6E1B1B] border border-gold-bright text-lacquer-deep font-serif font-bold text-sm hover:brightness-115 active:scale-95 transition shadow-gold-glow flex items-center justify-center gap-2 mx-auto"
        >
          <ScrollText size={16} className="text-lacquer-deep" />
          <span className="text-paper-light">Chạm Để Mở Cuộn Giấy Luận Giải</span>
        </button>
      </div>

    </div>
  );
}
