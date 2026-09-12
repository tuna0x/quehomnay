import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  History, 
  Sparkles, 
  Wind, 
  LogIn, 
  User, 
  ShieldCheck, 
  LogOut, 
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
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

export default function Header({ 
  onOpenHistory, 
  historyCount = 0,
  user = null,
  isAdmin = false,
  onOpenAuth,
  onOpenAdmin,
  onLogout
}) {
  const [soundOn, setSoundOn] = useState(getSoundSetting());
  const [ambientOn, setAmbientOn] = useState(getAmbientSetting());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

        {/* Action icons & User Account Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Admin Dashboard Quick Access Button (if user is Admin) */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              title="Mở Bảng Quản Trị Viên (Admin Dashboard)"
              className="h-9 px-2.5 rounded-md bg-gradient-to-r from-[#6E1B1B] via-[#942626] to-[#6E1B1B] border-2 border-gold-bright text-gold-bright hover:brightness-125 font-serif text-xs font-bold transition flex items-center gap-1.5 shadow-gold-glow animate-pulse"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Quản Trị</span>
            </button>
          )}

          {/* Ambient Bell Sound */}
          <button
            onClick={toggleAmbient}
            title={ambientOn ? "Tắt chuông gió thiền định" : "Bật chuông gió thiền định"}
            className={`h-9 px-2 rounded-md border text-xs font-serif transition flex items-center gap-1 shadow ${
              ambientOn
                ? 'bg-temple-red/80 border-gold-bright text-gold-bright shadow-gold-glow animate-pulse'
                : 'bg-[#1C0504]/90 border-gold-ancient/30 hover:border-gold-bright text-gold-pale hover:text-gold-bright'
            }`}
          >
            <Wind size={15} className={ambientOn ? "animate-spin" : "opacity-60"} style={{ animationDuration: '8s' }} />
            <span className="hidden sm:inline">
              {ambientOn ? "Chuông gió" : "Nhạc"}
            </span>
          </button>

          {/* Effects Sound */}
          <button
            onClick={toggleSound}
            title={soundOn ? "Tắt âm thanh hiệu ứng" : "Bật âm thanh hiệu ứng"}
            className="w-9 h-9 rounded-md bg-[#1C0504]/90 border border-gold-ancient/30 hover:border-gold-bright text-gold-pale hover:text-gold-bright transition flex items-center justify-center shadow"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} className="opacity-50" />}
          </button>

          {/* Sổ Quẻ (History) */}
          <button
            onClick={onOpenHistory}
            title="Lịch sử quẻ đã xin"
            className="h-9 px-2.5 rounded-md bg-[#1C0504]/90 border border-gold-ancient/30 hover:border-gold-bright text-gold-pale hover:text-gold-bright transition flex items-center gap-1 text-xs font-serif shadow"
          >
            <History size={15} />
            <span className="hidden sm:inline">Sổ Quẻ</span>
            {historyCount > 0 && (
              <span className="bg-temple-seal text-white text-[10px] px-1.5 rounded-full font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* User Account / Login Button */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="h-9 px-2.5 rounded-md bg-[#240705] border border-gold-ancient/50 hover:border-gold-bright text-gold-pale hover:text-gold-bright transition flex items-center gap-1.5 text-xs font-serif shadow"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#8B1E1E] to-[#2B0605] border border-gold-bright/60 flex items-center justify-center text-[10px] font-bold text-gold-bright overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    (user.name || user.email || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate font-medium">
                  {user.name || 'Tài khoản'}
                </span>
                <ChevronDown size={12} className="opacity-70" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-gradient-to-b from-[#2A0806] to-[#140302] border-2 border-gold-bright/60 shadow-[0_4px_25px_rgba(0,0,0,0.8)] py-2 z-50 text-xs font-serif animate-fadeIn">
                  {/* User info header */}
                  <div className="px-3.5 py-2 border-b border-gold-ancient/20">
                    <div className="font-bold text-gold-pale truncate">
                      {user.name || 'Đạo Hữu'}
                    </div>
                    <div className="text-[11px] text-gold-muted font-mono truncate">
                      {user.email}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gold-ancient/20 border border-gold-bright/60 text-gold-bright font-bold text-[9px] uppercase tracking-wider">
                          <ShieldCheck size={10} /> Quản Trị Viên (Admin)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1B0503] border border-gold-ancient/30 text-gold-pale text-[9px]">
                          Đạo Hữu (User)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          if (onOpenAdmin) onOpenAdmin();
                        }}
                        className="w-full px-3.5 py-2 text-left text-gold-bright hover:bg-[#3E100D] transition flex items-center gap-2 font-bold"
                      >
                        <LayoutDashboard size={14} />
                        <span>Bảng Quản Trị (Admin)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onOpenHistory) onOpenHistory();
                      }}
                      className="w-full px-3.5 py-2 text-left text-gold-pale hover:bg-[#3E100D] transition flex items-center gap-2"
                    >
                      <History size={14} />
                      <span>Xem Sổ Quẻ Của Tôi</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full px-3.5 py-2 text-left text-red-300 hover:bg-red-950/50 hover:text-red-200 transition flex items-center gap-2 border-t border-gold-ancient/15 mt-1"
                    >
                      <LogOut size={14} />
                      <span>Đăng Xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              title="Đăng Nhập hoặc Đăng Ký tài khoản"
              className="h-9 px-2.5 sm:px-3 rounded-md bg-gradient-to-r from-[#501310] to-[#2B0806] border border-gold-ancient/40 hover:border-gold-bright text-gold-pale hover:text-gold-bright transition flex items-center gap-1.5 text-xs font-serif font-semibold shadow"
            >
              <LogIn size={14} className="text-gold-bright" />
              <span>Đăng Nhập</span>
            </button>
          )}
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
