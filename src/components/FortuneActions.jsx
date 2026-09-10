import React, { useState } from 'react';
import { Download, Share2, Copy, Check, RotateCcw, Link as LinkIcon } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function FortuneActions({ 
  fortuneRef, 
  fortune, 
  onReset, 
  canDrawAgain,
  userName = '',
  userQuestion = '' 
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // Generate Unique Shareable URL with Encoded Fortune
  const getShareableFortuneUrl = () => {
    try {
      const payload = {
        t: fortune.ten_que,
        m: fortune.muc,
        l: fortune.loi_que,
        g: fortune.giai_nghia,
        k: fortune.loi_khuyen,
        c: fortune.mau_sac,
        h: fortune.mau_hex,
        n: fortune.con_so,
        gh: fortune.gio_cat,
        u: userName || '',
        q: userQuestion || ''
      };
      const jsonStr = JSON.stringify(payload);
      // Safe UTF-8 to Base64
      const b64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1);
      }));
      return `${window.location.origin}/?q=${b64}`;
    } catch (e) {
      console.error("Error creating share URL:", e);
      return window.location.href;
    }
  };

  // Save card as PNG image
  const handleDownloadImage = async () => {
    if (!fortuneRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(fortuneRef.current, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `que-hom-nay-${fortune.ten_que.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Lỗi xuất ảnh:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy full text
  const handleCopyText = async () => {
    if (!fortune) return;
    const shareUrl = getShareableFortuneUrl();
    const text = `🎋 Quẻ hôm nay của ${userName || 'tôi'}: ${fortune.ten_que} [${fortune.muc}]\n\n"${fortune.loi_que}"\n\nGiải quẻ: ${fortune.giai_nghia}\n\nLời khuyên: ${fortune.loi_khuyen}\n🎨 Màu may mắn: ${fortune.mau_sac || 'Vàng Kim'} • Số may mắn: ${fortune.con_so || '08, 68'}\n\nXem quẻ của tôi & gieo quẻ của bạn tại: ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.error('Không thể copy:', e);
    }
  };

  // Copy unique link
  const handleCopyLink = async () => {
    const shareUrl = getShareableFortuneUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2500);
    } catch (e) {
      console.error('Không thể copy link:', e);
    }
  };

  // Mobile Web Share
  const handleShare = async () => {
    const shareUrl = getShareableFortuneUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quẻ hôm nay: ${fortune.ten_que} [${fortune.muc}]`,
          text: `Tôi vừa rút được quẻ "${fortune.ten_que}" [${fortune.muc}]: "${fortune.loi_que}". Cùng gieo quẻ xem thông điệp của bạn nhé!`,
          url: shareUrl,
        });
      } catch (err) {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 mt-3 mb-8 space-y-3">
      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Download Image Button */}
        <button
          onClick={handleDownloadImage}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-md bg-gradient-to-r from-gold-ancient to-gold-bright text-lacquer-deep font-serif font-bold text-xs sm:text-sm hover:brightness-110 active:scale-98 transition shadow-md disabled:opacity-50"
        >
          {isExporting ? (
            <div className="w-4 h-4 border-2 border-lacquer-deep border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download size={16} />
          )}
          <span>{isExporting ? "Đang xuất ảnh..." : "Lưu ảnh Story"}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-md bg-lacquer-card border border-gold-ancient/40 text-gold-pale hover:text-gold-bright hover:border-gold-bright font-serif text-xs sm:text-sm active:scale-98 transition shadow-md"
        >
          <Share2 size={16} />
          <span>Chia sẻ quẻ</span>
        </button>
      </div>

      {/* Secondary Actions Row */}
      <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-serif text-gold-muted/80 pt-1 border-t border-gold-ancient/15">
        {/* Copy Unique Link */}
        <button 
          onClick={handleCopyLink}
          className="hover:text-gold-bright underline underline-offset-4 decoration-gold-muted/40 transition flex items-center gap-1"
        >
          {isLinkCopied ? <Check size={12} className="text-emerald-400" /> : <LinkIcon size={12} />}
          <span className={isLinkCopied ? "text-emerald-400 font-bold" : ""}>
            {isLinkCopied ? "Đã chép link quẻ!" : "Sao chép link quẻ riêng"}
          </span>
        </button>

        {/* Copy Text */}
        <button 
          onClick={handleCopyText}
          className="hover:text-gold-bright underline underline-offset-4 decoration-gold-muted/40 transition flex items-center gap-1"
        >
          {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span className={isCopied ? "text-emerald-400 font-bold" : ""}>
            {isCopied ? "Đã chép lời thơ!" : "Sao chép toàn văn"}
          </span>
        </button>

        {/* Draw Another */}
        {canDrawAgain && (
          <button 
            onClick={onReset}
            className="hover:text-gold-bright underline underline-offset-4 decoration-gold-muted/40 transition flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>Gieo quẻ khác</span>
          </button>
        )}
      </div>
    </div>
  );
}
