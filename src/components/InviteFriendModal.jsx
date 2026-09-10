import React, { useState } from 'react';
import { X, Gift, Copy, Check, Share2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { grantInviteBonus } from '../utils/storage';
import { playBellSound } from '../utils/audio';

export default function InviteFriendModal({ isOpen, onClose, onBonusGranted }) {
  const [copied, setCopied] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?ref=duyen-lanh` 
    : 'https://quehomnay.com?ref=duyen-lanh';

  const shareMessage = `🎋 Cùng mình gieo một quẻ đầu ngày để xem thông điệp vũ trụ gửi đến bạn nhé! Quẻ do AI chùa Việt sinh riêng: ${shareUrl}`;

  const handleClaimBonus = () => {
    grantInviteBonus();
    setBonusClaimed(true);
    playBellSound();

    try {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#E7C978', '#C9A24A', '#C53030', '#FFF']
      });
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      onBonusGranted();
      onClose();
      setBonusClaimed(false);
    }, 1200);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      handleClaimBonus();
    } catch (err) {
      console.error("Copy error:", err);
      handleClaimBonus();
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Quẻ Hôm Nay — Xin Xăm Gieo Quẻ Khởi Tâm An',
          text: 'Cùng mình gieo một quẻ đầu ngày để xem thông điệp vũ trụ gửi đến bạn nhé! Quẻ do AI chùa Việt sinh riêng.',
          url: shareUrl,
        });
        handleClaimBonus();
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-lacquer-card via-[#1D0605] to-[#120302] border border-gold-bright rounded-lg shadow-2xl p-6 relative corner-knot text-paper-light">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gold-muted hover:text-gold-pale transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header with Gift Icon */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-temple-red to-[#450C0A] border-2 border-gold-bright flex items-center justify-center text-gold-bright shadow-gold-glow">
            <Gift size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-serif font-black text-gold-bright">
              Lan Tỏa Duyên Lành (+1 Lượt)
            </h3>
            <p className="text-[11px] text-gold-muted font-serif">
              Mời bạn bè cùng gieo quẻ nhận thêm cơ hội
            </p>
          </div>
        </div>

        {/* Reward explanation */}
        <div className="space-y-3.5 my-4 text-xs">
          <div className="p-3 bg-amber-950/30 border border-gold-ancient/30 rounded text-gold-pale/90 leading-relaxed font-serif text-[11px] flex items-start gap-2">
            <Sparkles size={16} className="text-gold-bright shrink-0 mt-0.5" />
            <span>
              Mỗi ngày mặc định bạn có <strong>1 lượt xin quẻ miễn phí</strong>. Gửi tặng link cho 1 người bạn để nhận ngay <strong>+1 lượt gieo quẻ mới</strong> trong ngày hôm nay!
            </span>
          </div>

          {/* Invitation Link Box */}
          <div>
            <label className="block text-[11px] font-serif text-gold-pale mb-1">
              Đường dẫn chia sẻ của bạn:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-[#0F0202] border border-gold-ancient/30 rounded px-3 py-2 text-xs text-gold-pale/80 font-mono focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 rounded bg-lacquer-dark border border-gold-ancient/40 text-gold-pale hover:text-gold-bright hover:border-gold-bright font-serif text-xs transition flex items-center gap-1 shrink-0"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? "Đã chép" : "Sao chép"}</span>
              </button>
            </div>
          </div>

          {/* Status Message when bonus claimed */}
          {bonusClaimed && (
            <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-500/50 text-center text-xs font-serif font-bold text-emerald-300 animate-bounce">
              ✦ Chúc mừng bạn đã được tặng +1 lượt gieo quẻ hôm nay! ✦
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-gold-ancient/20">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded bg-lacquer-dark/80 border border-gold-ancient/30 text-gold-pale text-xs font-serif hover:bg-lacquer-dark transition"
          >
            Để sau
          </button>

          <button
            onClick={handleNativeShare}
            className="px-5 py-2 rounded-md bg-gradient-to-r from-temple-red via-[#B82B2B] to-temple-red border border-gold-bright text-gold-bright text-xs font-serif font-bold hover:brightness-115 transition flex items-center gap-1.5 shadow-gold-glow"
          >
            <Share2 size={14} />
            <span>Gửi Bạn Bè & Nhận +1 Lượt</span>
          </button>
        </div>

      </div>
    </div>
  );
}
