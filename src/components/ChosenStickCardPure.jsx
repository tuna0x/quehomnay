import React from 'react';
import { ScrollText, Sparkles } from 'lucide-react';

export default function ChosenStickCardPure({ fortune, onOpenScroll }) {
  return (
    <div className="w-full max-w-sm mx-auto my-4 px-4 flex flex-col items-center animate-scroll-unroll text-center">
      
      {/* The Floating Sacred Bamboo Stick (Pure CSS & SVG) */}
      <div 
        onClick={onOpenScroll}
        className="relative group cursor-pointer my-2 flex flex-col items-center transition-transform duration-300 hover:scale-105"
      >
        {/* Divine halo aura */}
        <div className="absolute inset-0 bg-gradient-to-t from-gold-bright/30 to-temple-seal/30 rounded-full blur-2xl animate-halo-pulse"></div>

        {/* Pure CSS 3D Bamboo Stick */}
        <div className="relative w-20 sm:w-24 h-72 sm:h-80 rounded-t-lg rounded-b-md border-2 border-[#D4AF37] shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(231,201,120,0.3)] overflow-hidden flex flex-col justify-between items-center p-2.5 bg-gradient-to-r from-[#A88647] via-[#EADBAB] via-45% via-[#FFF6D6] to-[#9E7B3A]">
          
          {/* Top Dipped Vermilion Seal (Khắc Son Đỏ) */}
          <div className="w-full h-14 rounded-t-md bg-gradient-to-b from-[#9E1B1B] via-[#BD2B2B] to-[#751212] border border-[#520909] shadow-inner flex flex-col items-center justify-center p-1">
            <span className="text-[9px] font-serif font-bold text-[#FEF3C7] tracking-widest uppercase">
              Thánh Quẻ
            </span>
            <div className="w-8 h-[1px] bg-[#FEF3C7]/40 my-0.5"></div>
            <span className="text-xs font-serif font-black text-[#FEF3C7] tracking-wider">
              {fortune.muc === 'Thượng' ? 'THƯỢNG' : fortune.muc === 'Trung' ? 'TRUNG' : 'HẠ'}
            </span>
          </div>

          {/* Bamboo Joint Segment 1 */}
          <div className="w-full h-[1.5px] bg-[#6E501F] shadow-[0_1px_0_#FFF3D6] my-1 opacity-75"></div>

          {/* Inscribed Fortune Name in Calligraphic Verticals */}
          <div className="my-auto flex flex-col items-center py-2">
            <span className="font-serif font-black text-sm sm:text-base text-[#2E1F0A] tracking-wider drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] text-center">
              {fortune.ten_que}
            </span>
            <span className="text-[10px] font-serif text-[#63491C] mt-1 italic font-semibold">
              Quẻ Linh Số 68
            </span>
          </div>

          {/* Bamboo Joint Segment 2 */}
          <div className="w-full h-[1.5px] bg-[#6E501F] shadow-[0_1px_0_#FFF3D6] my-1 opacity-75"></div>

          {/* Bottom Root Mark */}
          <div className="w-full text-center pb-1">
            <span className="text-[8px] font-serif font-bold text-[#4F3915] tracking-widest uppercase">
              Chùa Cổ Việt
            </span>
          </div>

          {/* Longitudinal Wood Grain Sheen Lines */}
          <div className="absolute inset-y-0 left-2 w-[1px] bg-black/10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-2 w-[1px] bg-white/25 pointer-events-none"></div>
        </div>

        {/* Callout Pill */}
        <div className="mt-3 px-3.5 py-1 rounded-full bg-temple-red/90 border border-gold-bright shadow-lg flex items-center gap-1.5">
          <Sparkles size={13} className="text-gold-bright animate-pulse" />
          <span className="font-serif font-bold text-xs text-gold-bright">
            {fortune.ten_que} • Giáng Quẻ
          </span>
        </div>
      </div>

      {/* Button to Unroll Scroll */}
      <div className="mt-4 space-y-2">
        <p className="text-xs font-serif text-gold-pale/80 italic">
          Bấm vào đây để mở cuộn giấy giải nghĩa chi tiết
        </p>

        <button
          onClick={onOpenScroll}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#6E1B1B] via-[#C9A24A] to-[#6E1B1B] border border-gold-bright text-lacquer-deep font-serif font-bold text-sm hover:brightness-115 active:scale-95 transition shadow-gold-glow flex items-center justify-center gap-2 mx-auto"
        >
          <ScrollText size={17} className="text-lacquer-deep" />
          <span className="text-paper-light">Mở Cuộn Giấy Luận Giải</span>
        </button>
      </div>

    </div>
  );
}
