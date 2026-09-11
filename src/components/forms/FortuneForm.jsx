import React, { useState } from 'react';
import { Sparkles, Compass, Heart, Briefcase, Coins, Feather, HelpCircle, Gift, ShieldCheck, User } from 'lucide-react';
import { getCanChiAndMenh } from '../../utils/horoscope';
import TempleDatePicker from './TempleDatePicker';

const TOPIC_PRESETS = [
  { label: 'Công danh', fullLabel: 'Công việc & Sự nghiệp', icon: Briefcase, prompt: 'Định hướng công việc, dự án mới và bước tiến sự nghiệp' },
  { label: 'Tài lộc', fullLabel: 'Tài lộc & Tiền bạc', icon: Coins, prompt: 'Tài vận hanh thông, cơ hội đầu tư và tài chính sắp tới' },
  { label: 'Tình duyên', fullLabel: 'Tình duyên & Nhân duyên', icon: Heart, prompt: 'Băn khoăn về chuyện tình cảm, người ấy và nhân duyên' },
  { label: 'Gia đạo', fullLabel: 'Gia đạo & Bình an', icon: ShieldCheck, prompt: 'Cầu bình an gia đạo, hòa khí gia đình và tâm hồn an định' },
  { label: 'Tâm an', fullLabel: 'Tâm an & Chữa lành', icon: Feather, prompt: 'Tìm kiếm sự tĩnh tại, an yên và buông bỏ âu lo' },
  { label: 'Định hướng', fullLabel: 'Ngã rẽ & Quyết định', icon: Compass, prompt: 'Đứng trước lựa chọn quan trọng, nên tiến hay lùi' },
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
  birthYear,
  setBirthYear,
  topic,
  setTopic,
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

  const horo = getCanChiAndMenh(birthYear);

  const handleSelectPreset = (preset) => {
    if (disabled || isShaking) return;
    if (setTopic) setTopic(preset.fullLabel || preset.label);
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
      <div className="bg-gradient-to-b from-[#220705]/95 via-[#170403]/95 to-[#0E0202]/98 backdrop-blur-md border-2 border-gold-ancient/50 p-5 rounded-lg shadow-[0_15px_45px_rgba(0,0,0,0.85)] relative corner-knot text-paper-light">
        {/* Ancient Temple Corner Brackets Ornament */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-gold-bright/60 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-gold-bright/60 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-gold-bright/60 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-gold-bright/60 pointer-events-none" />
        
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

        {/* Form Title with Divine Aesthetics */}
        <div className="flex items-center justify-between border-b border-gold-ancient/25 pb-3 mb-4">
          <div>
            <h3 className="font-serif font-black text-sm text-gold-bright flex items-center gap-1.5 tracking-wide">
              <Sparkles size={14} className="text-gold-ancient animate-pulse" />
              <span>Thành Tâm Khấn Nguyện</span>
            </h3>
            <p className="text-[11px] text-gold-muted/90 font-serif mt-0.5">
              Tâm khởi niệm lành, quẻ tự khắc ứng nghiệm
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenInviteModal}
              title="Mời bạn nhận thêm lượt"
              className="text-[10px] text-gold-bright hover:brightness-125 flex items-center gap-1 transition px-2 py-1 rounded bg-temple-red/70 border border-gold-bright/50 font-serif font-semibold shadow-sm"
            >
              <Gift size={11} />
              <span>+1 Lượt</span>
            </button>
            <button
              type="button"
              onClick={() => setShowQuickTips(!showQuickTips)}
              className="text-[10px] text-gold-pale/80 hover:text-gold-bright flex items-center gap-1 transition px-2 py-1 rounded bg-[#1A0504] border border-gold-ancient/30"
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
          {/* Name & Birth Date Grid - Perfectly Aligned & Decorated */}
          <div className="grid grid-cols-2 gap-3">
            {/* Name Field */}
            <div>
              <div className="flex items-center justify-between text-xs font-serif text-gold-pale mb-1 h-5">
                <span className="flex items-center gap-1">
                  <User size={11} className="text-gold-ancient" />
                  <span>Tên thiện tín</span>
                </span>
                <span className="text-[10px] text-gold-muted/70 italic">Tùy chọn</span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên..."
                maxLength={40}
                disabled={isShaking || disabled}
                className="w-full bg-gradient-to-b from-[#130302] to-[#1A0504] border border-gold-ancient/35 focus:border-gold-bright hover:border-gold-ancient/60 rounded px-3 py-2 text-sm text-paper-light placeholder-gold-muted/40 focus:outline-none focus:ring-1 focus:ring-gold-bright/50 transition font-sans shadow-inner"
              />
            </div>

            {/* Birth Date Field (Custom Temple Date Picker) */}
            <div>
              <div className="flex items-center justify-between text-xs font-serif text-gold-pale mb-1 h-5">
                <span className="flex items-center gap-1">
                  <Sparkles size={11} className="text-gold-ancient" />
                  <span>Ngày sinh</span>
                </span>
                <span className="text-[10px] text-gold-muted/70 italic">Tính Mệnh</span>
              </div>
              <TempleDatePicker
                value={birthYear}
                onChange={setBirthYear}
                disabled={isShaking || disabled}
              />
            </div>
          </div>

          {/* Live Can Chi & Bản Mệnh Banner */}
          {horo && (
            <div className={`p-2 sm:p-2.5 rounded border text-xs flex items-center justify-between animate-fadeIn ${horo.badgeColor}`}>
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Sparkles size={13} className="shrink-0 text-gold-bright animate-pulse" />
                <span className="font-serif text-[11px] sm:text-xs leading-snug">
                  {horo.day && horo.month ? `${horo.formattedDate} • ` : ''}
                  Tuổi <strong>{horo.canChi}</strong> — Mệnh <strong>{horo.menh}</strong>
                  {horo.cung ? ` (${horo.cung})` : ''}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 border border-white/10 shrink-0 ml-1.5 self-center font-bold">
                {horo.nguHanh}
              </span>
            </div>
          )}

          {/* Topic Categories */}
          <div>
            <label className="block text-[11px] font-serif text-gold-pale/80 mb-1.5">
              Lĩnh vực khấn nguyện xin chỉ dẫn:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {TOPIC_PRESETS.map((preset, idx) => {
                const Icon = preset.icon;
                const isSelected = topic === preset.label || topic === preset.fullLabel;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      if (setTopic) setTopic(preset.fullLabel || preset.label);
                      if (!question || TOPIC_PRESETS.some(p => p.prompt === question)) {
                        setQuestion(preset.prompt);
                      }
                    }}
                    disabled={isShaking || disabled}
                    className={`py-2 px-1.5 rounded text-xs flex items-center justify-center gap-1.5 transition border font-serif tracking-wide ${
                      isSelected
                        ? 'bg-gradient-to-r from-temple-seal to-[#9B2323] text-gold-bright border-gold-bright shadow-[0_0_10px_rgba(201,162,74,0.3)] ring-1 ring-gold-bright/50 font-bold'
                        : 'bg-[#150403]/90 hover:bg-temple-red/30 text-gold-pale/85 border-gold-ancient/20 hover:border-gold-ancient/50'
                    }`}
                  >
                    <Icon size={13} className={`shrink-0 ${isSelected ? 'text-gold-bright' : 'text-gold-ancient/80'}`} />
                    <span className="whitespace-nowrap">{preset.label}</span>
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
