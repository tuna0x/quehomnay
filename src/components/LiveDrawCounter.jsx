import React, { useState, useEffect, useRef } from 'react';
import { Users, Sparkles, Flame, Clock, Radio } from 'lucide-react';

const STORAGE_KEY_TOTAL_DRAWS = 'qhn_global_draw_count';
const STORAGE_KEY_TODAY_DRAWS = 'qhn_today_draw_count';
const BASE_TOTAL_DRAWS = 128450;
const BASE_TODAY_DRAWS = 3842;

// Vietnamese cities and fortune titles for lively temple activity simulation
const LIVE_CITIES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Huế', 
  'Cần Thơ', 'Hải Phòng', 'Nha Trang', 'Lâm Đồng (Đà Lạt)', 
  'Vũng Tàu', 'Quảng Ninh', 'Bình Dương', 'Bắc Ninh'
];

const LIVE_FORTUNES = [
  'Hàn Mai Nghinh Xuân', 
  'Vân Khai Kiến Nhật', 
  'Bích Thuỷ Triều Sinh', 
  'Kim Kê Báo Hiểu', 
  'Thủy Tĩnh Tâm An', 
  'Phong Đăng Hòa Cốc', 
  'Phúc Lộc Viên Mãn',
  'Ngọc Xuất Lam Điền'
];

export default function LiveDrawCounter({ onDrawEvent }) {
  // Total all-time draws
  const [totalDraws, setTotalDraws] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOTAL_DRAWS);
      return saved ? parseInt(saved, 10) : BASE_TOTAL_DRAWS;
    } catch (e) {
      return BASE_TOTAL_DRAWS;
    }
  });

  // Today's draws count
  const [todayDraws, setTodayDraws] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TODAY_DRAWS);
      return saved ? parseInt(saved, 10) : BASE_TODAY_DRAWS;
    } catch (e) {
      return BASE_TODAY_DRAWS;
    }
  });

  const [activeUsers, setActiveUsers] = useState(218);
  const [recentDrawTicker, setRecentDrawTicker] = useState(null);
  const [floatingPlusOne, setFloatingPlusOne] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // Increment counts & trigger tactile effects
  const triggerIncrement = (fromUserAction = false) => {
    setTotalDraws(prev => {
      const next = prev + 1;
      try {
        localStorage.setItem(STORAGE_KEY_TOTAL_DRAWS, String(next));
      } catch (e) {}
      return next;
    });

    setTodayDraws(prev => {
      const next = prev + 1;
      try {
        localStorage.setItem(STORAGE_KEY_TODAY_DRAWS, String(next));
      } catch (e) {}
      return next;
    });

    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 700);

    if (fromUserAction) {
      setFloatingPlusOne(true);
      setTimeout(() => setFloatingPlusOne(false), 1900);
    }
  };

  // Listen to local draw event from parent
  useEffect(() => {
    if (onDrawEvent && onDrawEvent > 0) {
      triggerIncrement(true);
    }
  }, [onDrawEvent]);

  // Periodic subtle live ticker (simulates bustling temple atmosphere)
  useEffect(() => {
    // Random active users oscillation (205 - 265)
    const userInterval = setInterval(() => {
      setActiveUsers(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.max(190, Math.min(290, prev + delta));
      });
    }, 4500);

    // Occasional simulated draw from other users around Vietnam every 12-18 seconds
    const tickerInterval = setInterval(() => {
      const city = LIVE_CITIES[Math.floor(Math.random() * LIVE_CITIES.length)];
      const fortune = LIVE_FORTUNES[Math.floor(Math.random() * LIVE_FORTUNES.length)];
      
      setRecentDrawTicker({ city, fortune, timeAgo: 'Vừa xong' });
      triggerIncrement(false);

      // Clear after 4.5 seconds
      setTimeout(() => {
        setRecentDrawTicker(null);
      }, 4500);
    }, 14000);

    return () => {
      clearInterval(userInterval);
      clearInterval(tickerInterval);
    };
  }, []);

  // Format count string (e.g. "128.450")
  const formattedCount = totalDraws.toLocaleString('vi-VN');
  const formattedToday = todayDraws.toLocaleString('vi-VN');
  const digitChars = formattedCount.split('');

  return (
    <div className="w-full max-w-lg mx-auto px-3 my-3 flex flex-col items-center select-none relative z-10">
      
      {/* Floating +1 Particle notification when user draws */}
      {floatingPlusOne && (
        <div className="absolute -top-4 right-8 z-30 pointer-events-none animate-float-up flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#8B1E1E] to-[#B82B2B] border-2 border-gold-bright text-gold-bright font-serif font-black text-xs shadow-gold-glow">
          <Sparkles size={13} className="text-gold-bright animate-spin" />
          <span>+1 Lượt Gieo Quẻ!</span>
        </div>
      )}

      {/* Main Classical Tablet: Bảng Ghi Nhận Lượt Quẻ Toàn Mạng */}
      <div className={`w-full relative rounded-xl bg-gradient-to-b from-[#240806]/95 via-[#180403]/95 to-[#100202]/95 border-2 border-gold-ancient/50 p-3.5 sm:p-4 shadow-[0_10px_30px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-500 ${
        isPulsing ? 'border-gold-bright shadow-gold-glow' : ''
      }`}>
        
        {/* Ornate corner decorative accents */}
        <div className="absolute top-1.5 left-2 text-gold-bright/40 text-[10px] select-none">❖</div>
        <div className="absolute top-1.5 right-2 text-gold-bright/40 text-[10px] select-none">❖</div>
        <div className="absolute bottom-1.5 left-2 text-gold-bright/40 text-[10px] select-none">❖</div>
        <div className="absolute bottom-1.5 right-2 text-gold-bright/40 text-[10px] select-none">❖</div>

        {/* Header Ribbon / Title */}
        <div className="flex flex-col items-center justify-center text-center mb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent via-gold-bright/60 to-transparent"></span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-temple-seal shadow-[0_0_8px_#DC2626] animate-pulse"></span>
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] font-serif font-black text-gold-bright">
                Tổng Lượt Bấm Gieo Quẻ
              </span>
            </div>
            <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent via-gold-bright/60 to-transparent"></span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-gold-muted/80 font-serif mt-0.5">
            Hơn 128.000+ thiện tín khắp bốn phương đã thỉnh quẻ khai tâm
          </p>
        </div>

        {/* Grand Golden Digit Display (Odometer style) */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 py-1">
          {digitChars.map((char, idx) => {
            if (char === '.' || char === ',') {
              return (
                <div key={idx} className="flex items-end justify-center px-0.5 pb-1">
                  <span className="text-gold-bright font-black text-lg sm:text-2xl leading-none">.</span>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`relative px-2 py-1.5 sm:px-2.5 sm:py-2 rounded bg-gradient-to-b from-[#2E0B09] via-[#1B0504] to-[#120302] border border-gold-bright/60 shadow-[0_3px_10px_rgba(201,162,74,0.3)] flex flex-col items-center justify-center min-w-[24px] sm:min-w-[32px] transition-transform duration-300 ${
                  isPulsing ? 'scale-105 border-gold-bright' : ''
                }`}
              >
                {/* Horizontal dividing seam of odometer flip */}
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/50 pointer-events-none" />
                <span className="font-mono font-black text-lg sm:text-2xl text-gold-bright gold-text-gradient leading-none tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {char}
                </span>
              </div>
            );
          })}
          
          <div className="ml-1 sm:ml-2 flex flex-col justify-center">
            <span className="text-[10px] sm:text-xs font-serif font-bold text-gold-pale/90 leading-tight">
              Lượt
            </span>
            <span className="text-[9px] font-serif text-gold-ancient/80 leading-tight">
              Thỉnh Quẻ
            </span>
          </div>
        </div>

        {/* Live Sub-metrics Row (Today, Online, Satisfaction) */}
        <div className="mt-3 pt-2.5 border-t border-gold-ancient/20 grid grid-cols-3 gap-2 text-center text-xs font-serif">
          
          {/* Today's total */}
          <div className="flex flex-col items-center justify-center p-1 rounded bg-[#140302]/70 border border-gold-ancient/15">
            <div className="flex items-center gap-1 text-[10px] text-gold-pale/80">
              <Flame size={11} className="text-amber-400" />
              <span>Hôm nay</span>
            </div>
            <span className="font-mono font-bold text-xs sm:text-sm text-gold-bright mt-0.5">
              {formattedToday}
            </span>
          </div>

          {/* Active online right now */}
          <div className="flex flex-col items-center justify-center p-1 rounded bg-[#140302]/70 border border-gold-ancient/15 text-emerald-400">
            <div className="flex items-center gap-1 text-[10px] text-emerald-300/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399] animate-ping"></span>
              <Users size={11} className="text-emerald-400" />
              <span>Trực tuyến</span>
            </div>
            <span className="font-mono font-bold text-xs sm:text-sm text-emerald-300 mt-0.5">
              {activeUsers}
            </span>
          </div>

          {/* Satisfaction / Resonance */}
          <div className="flex flex-col items-center justify-center p-1 rounded bg-[#140302]/70 border border-gold-ancient/15">
            <div className="flex items-center gap-1 text-[10px] text-gold-pale/80">
              <Sparkles size={11} className="text-gold-ancient" />
              <span>Linh ứng</span>
            </div>
            <span className="font-mono font-bold text-xs sm:text-sm text-gold-bright mt-0.5">
              99.2%
            </span>
          </div>

        </div>

        {/* Floating Recent Activity Notification Banner (Subtle Ticker) */}
        {recentDrawTicker && (
          <div className="mt-2.5 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-temple-red/80 via-temple-darkRed/90 to-temple-red/80 border border-gold-bright/40 shadow-gold-glow animate-fade-in text-[11px] font-serif text-paper-light">
            <Radio size={12} className="text-gold-bright animate-pulse shrink-0" />
            <span className="truncate">
              Thiện tín tại <strong>{recentDrawTicker.city}</strong> vừa gieo quẻ <em>"{recentDrawTicker.fortune}"</em>
            </span>
          </div>
        )}

      </div>

    </div>
  );
}
