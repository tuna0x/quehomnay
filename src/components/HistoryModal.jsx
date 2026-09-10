import React from 'react';
import { X, History, Trash2, ChevronRight, Calendar } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, history, onSelectFortune, onClearHistory }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-lacquer-card border border-gold-ancient rounded shadow-2xl p-6 relative corner-knot text-paper-light max-h-[85vh] flex flex-col">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gold-muted hover:text-gold-pale transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded bg-temple-red border border-gold-ancient flex items-center justify-center text-gold-bright">
            <History size={16} />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-gold-bright">Sổ Quẻ Đã Xin</h3>
            <p className="text-[11px] text-gold-muted font-serif">Lưu giữ những thông điệp và lời khuyên từng nhận</p>
          </div>
        </div>

        {/* List of past fortunes */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-2">
          {history.length === 0 ? (
            <div className="py-12 text-center text-gold-muted/60 font-serif text-xs">
              <p>Chưa có quẻ nào trong sổ lưu.</p>
              <p className="mt-1">Hãy thành tâm gieo quẻ hôm nay!</p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectFortune(item);
                  onClose();
                }}
                className="p-3 bg-[#150403] hover:bg-[#200605] border border-gold-ancient/20 hover:border-gold-ancient/60 rounded cursor-pointer transition flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-gold-pale group-hover:text-gold-bright">
                      {item.ten_que}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-serif ${
                      item.muc === 'Thượng' ? 'bg-red-950 text-red-300 border border-red-800' :
                      item.muc === 'Trung' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-stone-900 text-stone-300 border border-stone-700'
                    }`}>
                      {item.muc}
                    </span>
                  </div>
                  <p className="text-[11px] text-gold-muted/80 font-serif italic truncate max-w-[260px]">
                    "{item.loi_que?.replace('\n', ' - ')}"
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-gold-muted/50">
                    <Calendar size={10} />
                    <span>{item.drawDate || 'Gần đây'}</span>
                  </div>
                </div>

                <ChevronRight size={16} className="text-gold-muted/40 group-hover:text-gold-bright group-hover:translate-x-0.5 transition" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gold-ancient/20 flex justify-between items-center text-xs">
          {history.length > 0 ? (
            <button
              onClick={onClearHistory}
              className="text-red-400/70 hover:text-red-300 flex items-center gap-1 font-serif text-[11px] transition"
            >
              <Trash2 size={12} />
              <span>Xóa sổ quẻ</span>
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-lacquer-dark border border-gold-ancient/30 text-gold-pale text-xs font-serif hover:bg-lacquer-dark/80 transition"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
