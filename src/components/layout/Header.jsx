import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, History, Sparkles, Wind } from 'lucide-react';
import { 
  getSoundSetting, 
  saveSoundSetting, 
  getAmbientSetting, 
  saveAmbientSetting 
} from '../../utils/preferences.js';
import { 
  ensureAudioContext, 
  startAmbientSound, 
  stopAmbientSound 
} from '../../utils/audio.js';

export default function Header({ onOpenHistory, historyCount = 0 }) {
  const [soundOn, setSoundOn] = useState(getSoundSetting());
  const [ambientOn, setAmbientOn] = useState(getAmbientSetting());

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    saveSoundSetting(next);
  };

  const toggleAmbient = () => {
    ensureAudioContext();
    const next = !ambientOn;
    setAmbientOn(next);
    saveAmbientSetting(next);

    if (next) {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  return (
    <header className="w-full max-w-xl mx-auto pt-6 pb-2 px-4 flex flex-col items-center relative z-20">
      <div className="w-full flex justify-between items-center mb-4">
        {/* Sacred Seal App Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#8B1E1E] via-[#631310] to-[#2B0605] border-2 border-gold-bright flex items-center justify-center shadow-lg">
            <span className="text-gold-bright font-serif text-base font-black">籤</span>
          </div>
          <div>
            <span className="text-sm font-serif font-black text-gold-pale block leading-tight">
              Quẻ Hôm Nay
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gold-ancient font-serif font-semibold">
              Tâm Thành Tất Ứng
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAmbient}
            title={ambientOn ? "Tắt chuông gió thiền định" : "Bật chuông gió thiền định"}
            className={`h-9 px-2.5 rounded-md border text-xs font-serif transition flex items-center gap-1.5 shadow ${
              ambientOn
                ? 'bg-temple-red/80 border-gold-bright text-gold-bright shadow-gold-glow animate-pulse'
                : 'bg-[#1C0504]/90 border-gold-ancient/30 hover:border-gold-bright text-gold-pale hover:text-gold-bright'
            }`}
          >
            <Wind size={15} className={ambientOn ? "animate-spin" : "opacity-60"} style={{ animationDuration: '8s' }} />
            <span className="hidden sm:inline">
              {ambientOn ? "Chuông gió" : "Nhạc thiền"}
            </span>
          </button>

          <button
            onClick={toggleSound}
            title={soundOn ? "Tắt âm thanh hiệu ứng" : "Bật âm thanh hiệu ứng"}
            className="w-9 h-9 rounded-md bg-[#1C0504]/90 border border-gold-ancient/30 hover:border-gold-bright text-gold-pale hover:text-gold-bright transition flex items-center justify-center shadow"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} className="opacity-50" />}
          </button>

          <button
            onClick={onOpenHistory}
            title="Lịch sử quẻ đã xin"
            className="h-9 px-3 rounded-md bg-[#1C0504]/90 border border-gold-ancient/30 hover:border-gold-bright text-gold-pale hover:text-gold-bright transition flex items-center gap-1.5 text-xs font-serif shadow"
          >
            <History size={15} />
            <span className="hidden sm:inline">Sổ Quẻ</span>
            {historyCount > 0 && (
              <span className="bg-temple-seal text-white text-[10px] px-1.5 rounded-full font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Classical Banner */}
      <div className="text-center relative py-1 px-4">
        <div className="flex items-center justify-center gap-3 text-gold-ancient/60 mb-1">
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gold-bright/60 to-transparent"></span>
          <span className="text-[11px] tracking-[0.25em] uppercase font-serif text-gold-bright font-bold flex items-center gap-1">
            <Sparkles size={11} />
            <span>Chiêm Nghiệm Vận Mệnh</span>
            <Sparkles size={11} />
          </span>
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gold-bright/60 to-transparent"></span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight gold-text-gradient mb-1.5 drop-shadow-[0_4px_12px_rgba(201,162,74,0.35)]">
          Quẻ Hôm Nay
        </h1>

        <p className="text-xs sm:text-sm text-paper-light/85 max-w-md mx-auto font-light leading-relaxed">
          Mỗi ngày một quẻ khai tâm, hòa quyện thiền vị cổ truyền, cầu an định trí.
        </p>
      </div>
    </header>
  );
}
