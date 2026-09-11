import React from 'react';
import { Sparkles, Gift } from 'lucide-react';

export default function Footer({ onOpenInvite }) {
  return (
    <footer className="relative z-10 w-full max-w-xl mx-auto py-6 px-4 border-t border-gold-ancient/15 text-center text-xs text-gold-muted/70 font-serif">
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-gold-ancient/50"></span>
        <span>Tâm thành tất ứng • Thiện niệm khởi sinh</span>
        <span className="w-1.5 h-1.5 rounded-full bg-gold-ancient/50"></span>
      </div>
      <p className="text-[11px] text-gold-muted/50">
        Quẻ Hôm Nay — Gieo quẻ đầu ngày, cầu an lạc & chiêm nghiệm cát hung.
      </p>
      {onOpenInvite && (
        <div className="mt-3 flex justify-center items-center">
          <button 
            onClick={onOpenInvite}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lacquer-dark/90 border border-gold-ancient/30 text-gold-pale hover:text-gold-bright hover:border-gold-bright transition text-[11px] font-serif shadow-sm"
          >
            <Gift size={12} className="text-gold-bright" />
            <span>Lan tỏa duyên lành (+1 lượt gieo quẻ)</span>
          </button>
        </div>
      )}
    </footer>
  );
}
