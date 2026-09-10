import React, { useState, useEffect } from 'react';
import { Clock, Eye, RotateCcw, Sparkles, Gift } from 'lucide-react';
import { getTimeUntilMidnight } from '../utils/storage';

export default function DailyLimitBanner({ 
  onViewTodayFortune, 
  onTestReset,
  onOpenInviteModal 
}) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="w-full max-w-md mx-auto px-4 my-4">
      <div className="bg-gradient-to-b from-lacquer-card to-[#150403] border border-gold-ancient/40 p-5 rounded-lg shadow-2xl text-center relative corner-knot">
        
        {/* Header indicator */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-temple-red/40 border border-gold-ancient/30 text-gold-bright text-xs font-serif mb-2.5">
          <Sparkles size={13} />
          <span>Hôm nay bạn đã dùng hết lượt rút</span>
        </div>

        <h3 className="text-lg font-serif font-bold text-gold-pale mb-1.5">
          Vạn sự khởi phát từ tâm
        </h3>

        <p className="text-xs text-gold-pale/70 max-w-xs mx-auto leading-relaxed mb-3">
          Mỗi ngày chỉ nên gieo một quẻ để lắng đọng chiêm nghiệm. Hoặc bạn có thể mời bạn bè để nhận thêm lượt!
        </p>

        {/* Global Community Draw Badge */}
        <div className="mb-4 inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-[#110302] border border-gold-ancient/25 text-[11px] font-serif text-gold-pale/80">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-bright animate-pulse"></span>
          <span>Đã có <strong className="text-gold-bright">128.450+ lượt bấm quẻ</strong> toàn mạng hôm nay</span>
        </div>

        {/* PROMINENT INVITE BUTTON FOR EXTRA DRAW (+1 LƯỢT) */}
        <div className="mb-4">
          <button
            onClick={onOpenInviteModal}
            className="w-full py-3 px-4 rounded-md bg-gradient-to-r from-[#6E1B1B] via-[#C9A24A] to-[#6E1B1B] border-2 border-gold-bright text-lacquer-deep font-serif font-black text-sm hover:brightness-115 active:scale-[0.98] transition shadow-gold-glow flex items-center justify-center gap-2 group"
          >
            <Gift size={18} className="text-lacquer-deep animate-bounce" />
            <span className="text-paper-light">Mời Bạn Bè — Nhận Thêm +1 Lượt Gieo Quẻ</span>
          </button>
        </div>

        {/* Countdown to midnight */}
        <div className="bg-[#120302] border border-gold-ancient/20 rounded p-3 mb-4 inline-block mx-auto">
          <div className="flex items-center justify-center gap-2 text-gold-muted text-xs mb-1 font-serif">
            <Clock size={13} />
            <span>Lượt miễn phí mới sẽ mở sau:</span>
          </div>
          <div className="flex items-center justify-center gap-2 font-mono text-base font-bold text-gold-bright">
            <span className="bg-lacquer-dark px-2 py-0.5 rounded border border-gold-ancient/30">{formatNumber(timeLeft.hours)}</span>
            <span>:</span>
            <span className="bg-lacquer-dark px-2 py-0.5 rounded border border-gold-ancient/30">{formatNumber(timeLeft.minutes)}</span>
            <span>:</span>
            <span className="bg-lacquer-dark px-2 py-0.5 rounded border border-gold-ancient/30">{formatNumber(timeLeft.seconds)}</span>
          </div>
        </div>

        {/* Secondary Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center items-center pt-1 border-t border-gold-ancient/15">
          <button
            onClick={onViewTodayFortune}
            className="w-full sm:w-auto px-4 py-2 rounded bg-temple-red/60 hover:bg-temple-red border border-gold-ancient/40 text-gold-bright font-serif text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <Eye size={14} />
            <span>Xem lại quẻ hôm nay</span>
          </button>

          <button
            onClick={onTestReset}
            className="w-full sm:w-auto px-3 py-2 rounded bg-lacquer-dark/80 hover:bg-lacquer-card border border-gold-ancient/30 text-gold-muted hover:text-gold-pale font-serif text-[11px] flex items-center justify-center gap-1.5 transition"
            title="Chỉ dùng khi kiểm thử tính năng"
          >
            <RotateCcw size={12} />
            <span>Đặt lại lượt (Demo test)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
