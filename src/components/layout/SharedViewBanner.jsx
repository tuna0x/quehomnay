import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export default function SharedViewBanner({ sender, onStartOwnDraw }) {
  return (
    <div className="w-full max-w-md mx-4 mb-3 p-3.5 rounded-lg bg-gradient-to-r from-amber-950/70 via-temple-red/60 to-amber-950/70 border-2 border-gold-bright text-center shadow-gold-glow animate-fade-in">
      <div className="flex items-center justify-center gap-1.5 text-xs font-serif font-bold text-gold-bright mb-1">
        <Heart size={14} className="text-red-400 fill-red-400 animate-pulse" />
        <span>Quẻ Bình An Được Gửi Tặng Từ {sender}</span>
      </div>
      <p className="text-[11px] text-paper-light/90 font-serif leading-relaxed mb-2.5">
        Bạn của bạn vừa gieo được quẻ này và gửi tặng bạn cùng chiêm nghiệm!
      </p>
      <button
        onClick={onStartOwnDraw}
        className="w-full py-2 px-4 rounded bg-gradient-to-r from-gold-ancient via-gold-bright to-gold-ancient text-lacquer-deep font-serif font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition shadow-md flex items-center justify-center gap-1.5"
      >
        <Sparkles size={14} />
        <span>Gieo Quẻ Riêng Cho Bạn Hôm Nay</span>
      </button>
    </div>
  );
}
