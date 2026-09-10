import React, { useState } from 'react';
import { X, Key, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { getSavedApiKey, saveApiKey } from '../utils/storage';

export default function ApiKeyModal({ isOpen, onClose }) {
  const [key, setKey] = useState(getSavedApiKey());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiKey(key);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setKey('');
    saveApiKey('');
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-lacquer-card border border-gold-ancient rounded shadow-2xl p-6 relative corner-knot text-paper-light">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gold-muted hover:text-gold-pale transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded bg-temple-red border border-gold-ancient flex items-center justify-center text-gold-bright">
            <Key size={16} />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-gold-bright">Cài đặt Gemini AI Key</h3>
            <p className="text-[11px] text-gold-muted font-serif">Kết nối trí tuệ nhân tạo sinh quẻ riêng biệt</p>
          </div>
        </div>

        {/* Key input */}
        <div className="space-y-3 my-4 text-xs">
          <p className="text-gold-pale/80 leading-relaxed">
            Nếu có Google Gemini API Key, bạn có thể dán vào đây để AI tự sáng tác câu thơ và luận giải theo đúng tên & câu hỏi của bạn.
          </p>

          <div>
            <label className="block text-[11px] font-serif text-gold-pale mb-1">
              Google Gemini API Key:
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#120302] border border-gold-ancient/30 focus:border-gold-bright rounded px-3 py-2 text-sm text-paper-light placeholder-gold-muted/40 focus:outline-none focus:ring-1 focus:ring-gold-bright/50 transition font-mono"
            />
          </div>

          <div className="p-3 bg-amber-950/20 border border-gold-ancient/20 rounded flex items-start gap-2 text-[11px] text-gold-pale/70">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Key chỉ được lưu trữ an toàn trong trình duyệt (<code className="text-gold-bright">localStorage</code>) của bạn và không gửi đi bất kỳ máy chủ nào khác.
            </span>
          </div>

          <div className="text-[11px] text-gold-muted flex items-center justify-between pt-1">
            <span>Chưa có key? Lấy miễn phí tại:</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-bright hover:underline flex items-center gap-1 font-serif"
            >
              <span>Google AI Studio</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <p className="text-[10px] text-gold-muted/60 italic">
            * Nếu không điền key, ứng dụng vẫn hoạt động 100% nhờ Kho quẻ cổ truyền thông minh tích hợp sẵn.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end items-center gap-2 pt-2 border-t border-gold-ancient/20">
          {key && (
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded bg-transparent hover:bg-lacquer-dark text-gold-muted text-xs font-serif transition"
            >
              Xóa key
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-lacquer-dark border border-gold-ancient/30 text-gold-pale text-xs font-serif hover:bg-lacquer-dark/80 transition"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-gradient-to-r from-temple-red to-temple-cinnabar border border-gold-ancient text-gold-bright text-xs font-serif font-semibold hover:brightness-110 transition flex items-center gap-1.5 shadow"
          >
            {saved ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span>Đã lưu!</span>
              </>
            ) : (
              <span>Lưu cài đặt</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
