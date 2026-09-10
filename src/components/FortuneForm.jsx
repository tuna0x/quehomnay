import React, { useState } from 'react';
import { Sparkles, Compass, Heart, Briefcase, Coins, Feather, HelpCircle, Gift } from 'lucide-react';

const TOPIC_PRESETS = [
  { label: 'Tình duyên & Crush', icon: Heart, prompt: 'Băn khoăn về chuyện tình cảm, người ấy và nhân duyên' },
  { label: 'Công việc & Thi cử', icon: Briefcase, prompt: 'Định hướng công việc, dự án mới và bước tiến sự nghiệp' },
  { label: 'Tiền tài & Vận may', icon: Coins, prompt: 'Tài lộc, thời cơ chi tiêu và tài chính sắp tới' },
  { label: 'Tâm an & Chữa lành', icon: Feather, prompt: 'Tìm kiếm sự tĩnh tại, an yên và buông bỏ âu lo' },
  { label: 'Ngã rẽ & Quyết định', icon: Compass, prompt: 'Đứng trước lựa chọn quan trọng, nên tiến hay lùi' },
];

const QUICK_QUESTIONS = [
  'Hôm nay tôi nên tiến bước hay chậm lại quan sát?',
  'Dự định mới trong lòng tôi có gặp thuận lợi không?',
  'Làm sao để tâm trí an yên trước những biến động?',
  'Nhân duyên hiện tại có phải là điều tốt đẹp lâu dài?'
];

export default function FortuneForm({
  name,
  setName,
  question,
  setQuestion,
  onSubmit,
  isShaking,
  disabled,
  extraDraws = 0,
  onOpenInviteModal
}) {
  const maxChars = 200;
  const [showQuickTips, setShowQuickTips] = useState(false);

  const handleSelectPreset = (preset) => {
    if (disabled || isShaking) return;
    setQuestion(preset.prompt);
  };

  const handlePickQuestion = (q) => {
    if (disabled || isShaking) return;
    setQuestion(q);
    setShowQuickTips(false);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="w-full max-w-md mx-auto px-4 mt-2 mb-6"
    >
      <div className="bg-gradient-to-b from-lacquer-card/95 via-[#1D0605]/90 to-[#140403]/95 backdrop-blur-md border border-gold-ancient/40 p-5 rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.8)] relative corner-knot text-paper-light">
        
        {/* Extra Draws Banner if user earned any */}
        {extraDraws > 0 && (
          <div className="mb-3.5 p-2 rounded bg-amber-950/50 border border-gold-bright/60 flex items-center justify-between text-xs text-gold-bright font-serif animate-pulse">
            <div className="flex items-center gap-1.5">
              <Gift size={14} className="text-gold-bright" />
              <span>Đang có <strong>+{extraDraws} lượt gieo quẻ</strong> từ lời mời bạn bè!</span>
            </div>
            <span className="text-[10px] text-paper-light/80 italic font-mono">Được gia hộ</span>
          </div>
        )}

        {/* Form Title */}
        <div className="flex items-center justify-between border-b border-gold-ancient/20 pb-3 mb-4">
          <div>
            <h3 className="font-serif font-bold text-sm text-gold-bright flex items-center gap-1.5">
              <Sparkles size={14} className="text-gold-ancient" />
              <span>Thành Tâm Khấn Nguyện</span>
            </h3>
            <p className="text-[11px] text-gold-muted/80 font-serif">
              Tâm khởi niệm lành, quẻ tự khắc ứng nghiệm
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenInviteModal}
              title="Mời bạn nhận thêm lượt"
              className="text-[10px] text-gold-bright hover:brightness-125 flex items-center gap-1 transition px-2 py-1 rounded bg-temple-red/60 border border-gold-bright/40 font-serif font-semibold"
            >
              <Gift size={11} />
              <span>+1 Lượt</span>
            </button>
            <button
              type="button"
              onClick={() => setShowQuickTips(!showQuickTips)}
              className="text-[10px] text-gold-pale/70 hover:text-gold-bright flex items-center gap-1 transition px-2 py-1 rounded bg-lacquer-dark border border-gold-ancient/20"
            >
              <HelpCircle size={11} />
              <span>Gợi ý</span>
            </button>
          </div>
        </div>

        {/* Quick Question Picker Dropdown */}
        {showQuickTips && (
          <div className="mb-4 p-3 bg-[#110302] border border-gold-bright/30 rounded text-xs space-y-2 animate-fadeIn">
            <span className="text-[11px] text-gold-bright font-serif font-semibold block">
              Chọn nhanh câu hỏi thường gặp:
            </span>
            <div className="space-y-1.5">
              {QUICK_QUESTIONS.map((q, idx) => (
                <div
                  key={idx}
                  onClick={() => handlePickQuestion(q)}
                  className="p-1.5 rounded bg-lacquer-dark/80 hover:bg-temple-red/40 hover:text-gold-bright border border-gold-ancient/15 cursor-pointer text-[11px] transition text-gold-pale/80"
                >
                  • {q}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3.5">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-serif text-gold-pale mb-1 flex items-center justify-between">
              <span>Tên thiện tín</span>
              <span className="text-[10px] text-gold-muted italic">(Không bắt buộc)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên bạn (vd: Minh Anh, Hải Đăng...)"
              maxLength={40}
              disabled={isShaking || disabled}
              className="w-full bg-[#120302] border border-gold-ancient/30 focus:border-gold-bright rounded px-3 py-2 text-sm text-paper-light placeholder-gold-muted/40 focus:outline-none focus:ring-1 focus:ring-gold-bright/50 transition font-sans"
            />
          </div>

          {/* Topic Categories */}
          <div>
            <label className="block text-[11px] font-serif text-gold-pale/80 mb-1.5">
              Chủ đề bạn đang bận lòng nhất hôm nay:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {TOPIC_PRESETS.map((preset, idx) => {
                const Icon = preset.icon;
                const isSelected = question === preset.prompt;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectPreset(preset)}
                    disabled={isShaking || disabled}
                    className={`p-1.5 rounded text-[11px] flex items-center gap-1.5 transition border font-sans ${
                      isSelected
                        ? 'bg-temple-seal text-gold-bright border-gold-bright shadow-sm'
                        : 'bg-[#150403] hover:bg-temple-red/40 text-gold-pale/80 border-gold-ancient/20 hover:border-gold-ancient/50'
                    }`}
                  >
                    <Icon size={12} className="shrink-0 text-gold-ancient" />
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question TextArea */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-serif text-gold-pale">
                Lời băn khoăn gửi gắm vào quẻ:
              </label>
              <span className={`text-[10px] font-mono ${question.length >= maxChars ? 'text-temple-seal' : 'text-gold-muted'}`}>
                {question.length}/{maxChars}
              </span>
            </div>
            <textarea
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value.slice(0, maxChars))}
              placeholder="Viết điều bạn đang trăn trở... hoặc để trống để nhận thông điệp vũ trụ hôm nay"
              disabled={isShaking || disabled}
              className="w-full bg-[#120302] border border-gold-ancient/30 focus:border-gold-bright rounded px-3 py-2 text-sm text-paper-light placeholder-gold-muted/40 focus:outline-none focus:ring-1 focus:ring-gold-bright/50 transition resize-none font-sans"
            />
          </div>

          {/* Big Golden Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isShaking || disabled}
              className={`w-full relative group overflow-hidden py-3.5 px-4 rounded-md font-serif font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl ${
                disabled
                  ? 'bg-lacquer-border text-gold-muted cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-[#8B1E1E] via-[#B82B2B] to-[#8B1E1E] text-gold-pale border border-gold-bright hover:shadow-gold-glow hover:brightness-110 active:scale-[0.98]'
              }`}
            >
              <span className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000 ease-out pointer-events-none" />

              {isShaking ? (
                <>
                  <div className="w-4 h-4 border-2 border-gold-bright border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gold-bright">Đang Lắc Ống Xăm...</span>
                </>
              ) : (
                <>
                  <Sparkles size={17} className="text-gold-bright animate-pulse" />
                  <span className="text-gold-bright text-base">Thành Tâm Xin Quẻ</span>
                </>
              )}
            </button>

            {/* Prominent Live Community Proof Badge right on the outside button */}
            <div className="mt-2.5 flex items-center justify-center gap-2 text-[11px] font-serif text-gold-pale/80 text-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399] animate-ping"></span>
              <span>
                Đã có <strong className="text-gold-bright">128.450+ lượt bấm gieo quẻ</strong> • 218 người đang trực tuyến
              </span>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
