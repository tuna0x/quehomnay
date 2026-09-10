import React, { forwardRef, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Flame, ShieldAlert, CheckCircle2, Clock, Palette, Hash } from 'lucide-react';
import { playScrollUnrollSound, playSealStampSound } from '../utils/audio';

const LEVEL_DATA = {
  "Thượng": {
    sealText: "THƯỢNG KIẾT",
    badgeLabel: "Đại Cát Hanh Thông",
    energyScore: 96,
    energyColor: "text-amber-700",
    barColor: "bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-300",
    sealBorder: "border-red-700 text-red-700 bg-red-50/80",
    icon: Sparkles
  },
  "Trung": {
    sealText: "TRUNG BÌNH",
    badgeLabel: "Tĩnh Tại Bình An",
    energyScore: 78,
    energyColor: "text-amber-800",
    barColor: "bg-gradient-to-r from-amber-700 via-amber-500 to-amber-400",
    sealBorder: "border-amber-800 text-amber-800 bg-amber-50/80",
    icon: CheckCircle2
  },
  "Hạ": {
    sealText: "HẠ THỨ",
    badgeLabel: "Phòng Thân Chờ Thời",
    energyScore: 62,
    energyColor: "text-stone-800",
    barColor: "bg-gradient-to-r from-stone-700 to-stone-500",
    sealBorder: "border-stone-800 text-stone-800 bg-stone-100/80",
    icon: ShieldAlert
  }
};

const FortuneCard = forwardRef(({ fortune, userName, userQuestion }, ref) => {
  if (!fortune) return null;

  const level = LEVEL_DATA[fortune.muc] || LEVEL_DATA["Trung"];
  const LevelIcon = level.icon;
  const [fillPercent, setFillPercent] = useState(0);

  useEffect(() => {
    playScrollUnrollSound();
    
    const stampTimer = setTimeout(() => {
      playSealStampSound();
    }, 600);

    const barTimer = setTimeout(() => {
      setFillPercent(level.energyScore);
    }, 700);

    try {
      confetti({
        particleCount: fortune.muc === "Thượng" ? 65 : 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E7C978', '#C9A24A', '#C53030', '#F3E8CE', '#FFF']
      });
    } catch (e) {
      // ignore
    }

    return () => {
      clearTimeout(stampTimer);
      clearTimeout(barTimer);
    };
  }, [fortune]);

  const poemLines = fortune.loi_que ? fortune.loi_que.split('\n') : [];

  return (
    <div className="w-full max-w-md mx-auto px-4 my-6 animate-scroll-unroll origin-top overflow-hidden">
      {/* Outer Silk Brocade Mount */}
      <div 
        ref={ref}
        id="fortune-scroll-card"
        className="relative rounded-sm shadow-scroll-deep overflow-hidden border-2 border-[#8B7032]"
        style={{
          background: 'linear-gradient(180deg, #381310 0%, #200605 5%, #200605 95%, #381310 100%)',
          padding: '14px 12px'
        }}
      >
        {/* Top Wooden Scroll Roller with Golden Finials */}
        <div className="w-full h-4 bg-gradient-to-r from-[#8B7032] via-[#E7C978] via-30% via-[#38100D] to-[#8B7032] rounded-sm shadow-md mb-2 flex items-center justify-between px-3 border-y border-[#523C13]">
          <div className="w-2 h-2 rounded-full bg-gold-pale shadow-[0_0_5px_#FFF]"></div>
          <div className="text-[9px] font-serif font-bold tracking-widest uppercase text-gold-pale/90 drop-shadow">
            Quẻ Mệnh Linh Ứng
          </div>
          <div className="w-2 h-2 rounded-full bg-gold-pale shadow-[0_0_5px_#FFF]"></div>
        </div>

        {/* The Authentic Parchment Paper Scroll Content */}
        <div className="paper-scroll relative rounded-[3px] border border-[#C2AE83] p-5 sm:p-6 text-[#2B2318] shadow-inner">
          
          {/* Classical Inner Double Border with Corner Knots */}
          <div className="border border-[#C2AE83] p-4 rounded-[2px] relative">
            <div className="border border-[#A89264]/40 p-3 relative">
              
              {/* Classical Corner Accents */}
              <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#8B7032]/70"></div>
              <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#8B7032]/70"></div>
              <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#8B7032]/70"></div>
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#8B7032]/70"></div>

              {/* Header Details */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[10px] font-serif tracking-widest text-[#6E5E47] uppercase font-black">
                    Linh Thiêm Thánh Quẻ
                  </div>
                  {userName && (
                    <div className="text-[11px] font-serif text-[#4A3E2D] font-semibold italic mt-0.5">
                      Thiện tín: {userName}
                    </div>
                  )}
                  {userQuestion && (
                    <div className="text-[10px] text-[#6E5E47] truncate max-w-[200px] italic">
                      Ý nguyện: "{userQuestion}"
                    </div>
                  )}
                </div>

                {/* Vermilion Stamp with SLAM IMPACT ANIMATION & SOUND */}
                <div className={`vermilion-seal ${level.sealBorder} animate-seal-slam flex flex-col items-center py-1 px-2.5 shadow-md`}>
                  <span className="text-[8px] tracking-tighter uppercase font-serif opacity-80">Chùa Cổ Việt</span>
                  <span className="text-xs font-serif font-black tracking-widest">{level.sealText}</span>
                </div>
              </div>

              {/* Title Section */}
              <div className="text-center my-3.5">
                <div className="inline-block relative px-6 py-1">
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#8B7032] to-transparent"></div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#2B2318] tracking-tight">
                    {fortune.ten_que}
                  </h2>
                  <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#8B7032] to-transparent"></div>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-serif text-[#6E5E47] mt-1.5">
                  <LevelIcon size={13} className="text-temple-seal" />
                  <span className="font-bold">{level.badgeLabel}</span>
                </div>
              </div>

              {/* Vibe / Energy Index Meter */}
              <div className="my-3 p-2 rounded bg-[#EFE1C6]/70 border border-[#D9C79E] text-xs flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-orange-600 animate-pulse" />
                  <span className="font-serif font-bold text-[#4A3E2D] text-[11px]">Chỉ số vượng khí:</span>
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-[140px] ml-3">
                  <div className="flex-1 h-2 rounded-full bg-[#DFCA9E] overflow-hidden shadow-inner">
                    <div 
                      className={`h-full ${level.barColor} transition-all duration-1000 ease-out`} 
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                  <span className="font-mono font-black text-[11px] text-[#2B2318]">
                    {fillPercent}%
                  </span>
                </div>
              </div>

              {/* AUSPICIOUS METADATA: LUCKY COLOR, NUMBER & AUSPICIOUS HOURS */}
              <div className="my-2.5 grid grid-cols-3 gap-1.5 text-[11px] font-serif">
                {/* Lucky Color */}
                <div className="p-1.5 rounded bg-[#FAF4E6] border border-[#D9C79E]/80 flex flex-col items-center text-center">
                  <span className="text-[9px] text-[#6E5E47] uppercase font-bold flex items-center gap-1">
                    <Palette size={10} className="text-[#8B7032]" />
                    <span>Màu may mắn</span>
                  </span>
                  <div className="mt-1 flex items-center gap-1">
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-black/20 shadow-sm"
                      style={{ backgroundColor: fortune.mau_hex || '#D97706' }}
                    ></span>
                    <span className="font-bold text-[#2B2318] text-[10px] truncate max-w-[75px]">
                      {fortune.mau_sac || 'Vàng Kim'}
                    </span>
                  </div>
                </div>

                {/* Lucky Number */}
                <div className="p-1.5 rounded bg-[#FAF4E6] border border-[#D9C79E]/80 flex flex-col items-center text-center">
                  <span className="text-[9px] text-[#6E5E47] uppercase font-bold flex items-center gap-1">
                    <Hash size={10} className="text-[#8B7032]" />
                    <span>Số cát tường</span>
                  </span>
                  <span className="mt-1 font-mono font-black text-xs text-temple-seal tracking-wider">
                    {fortune.con_so || '08, 68'}
                  </span>
                </div>

                {/* Auspicious Hour */}
                <div className="p-1.5 rounded bg-[#FAF4E6] border border-[#D9C79E]/80 flex flex-col items-center text-center">
                  <span className="text-[9px] text-[#6E5E47] uppercase font-bold flex items-center gap-1">
                    <Clock size={10} className="text-[#8B7032]" />
                    <span>Giờ hoàng đạo</span>
                  </span>
                  <span className="mt-1 font-sans font-bold text-[10px] text-[#2B2318] truncate max-w-[85px]">
                    {fortune.gio_cat || '9h - 11h (Tỵ)'}
                  </span>
                </div>
              </div>

              {/* Classical Poem Section (Thơ Cổ Đẹp) */}
              <div className="my-3.5 py-3 px-4 bg-[#Fdfbf7] rounded-[2px] border-y-2 border-[#C2AE83] text-center relative shadow-sm">
                <span className="text-3xl font-serif text-[#8B7032]/25 absolute top-1 left-2">“</span>
                <div className="space-y-1.5 font-serif text-base sm:text-lg text-[#2B2318] font-bold italic leading-relaxed">
                  {poemLines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
                <span className="text-3xl font-serif text-[#8B7032]/25 absolute bottom-0 right-2">”</span>
              </div>

              {/* Interpretation Section (Giải Nghĩa) */}
              <div className="my-3 text-xs sm:text-sm text-[#4A3E2D] leading-relaxed font-sans text-justify bg-[#FAF4E6]/60 p-3 rounded border border-[#DFCA9E]/70 shadow-sm">
                <span className="font-serif font-black text-[#2B2318] mr-1.5">
                  【Luận giải】
                </span>
                {fortune.giai_nghia}
              </div>

              {/* Actionable Advice Section (Lời Khuyên Vũ Trụ) */}
              <div className="mt-3.5 pt-3 border-t border-[#C2AE83]/60 text-xs sm:text-sm text-[#2B2318] leading-relaxed font-sans bg-amber-900/[0.05] p-3 rounded border-l-4 border-l-temple-seal shadow-sm">
                <div className="font-serif font-bold text-temple-seal flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} />
                  <span>Chỉ dẫn hành động cho bạn:</span>
                </div>
                <p className="font-bold text-[#382E21] pl-1">
                  {fortune.loi_khuyen}
                </p>
              </div>

              {/* Signature Footer */}
              <div className="mt-4 pt-2.5 border-t border-[#2B2318]/15 flex justify-between items-center text-[10px] text-[#6E5E47] font-serif">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-temple-seal"></span>
                  <span className="font-bold">quehomnay.com</span>
                </div>
                <span>Tâm thành tất ứng • {new Date().toLocaleDateString('vi-VN')}</span>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Wooden Scroll Roller with Golden Finials */}
        <div className="w-full h-4 bg-gradient-to-r from-[#8B7032] via-[#E7C978] via-30% via-[#38100D] to-[#8B7032] rounded-sm shadow-md mt-2 flex items-center justify-between px-3 border-y border-[#523C13]">
          <div className="w-2 h-2 rounded-full bg-gold-pale shadow-[0_0_5px_#FFF]"></div>
          <div className="text-[9px] font-serif font-bold tracking-widest uppercase text-gold-pale/90 drop-shadow">
            Khởi Niệm Vạn Duyên
          </div>
          <div className="w-2 h-2 rounded-full bg-gold-pale shadow-[0_0_5px_#FFF]"></div>
        </div>

      </div>
    </div>
  );
});

FortuneCard.displayName = 'FortuneCard';
export default FortuneCard;
