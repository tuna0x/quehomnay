import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import GoldenDustCanvas from './components/GoldenDustCanvas';
import LiveDrawCounter from './components/LiveDrawCounter';
import BambooCylinderPure from './components/BambooCylinderPure';
import FortuneForm from './components/FortuneForm';
import ChosenStickCardPure from './components/ChosenStickCardPure';
import FortuneCard from './components/FortuneCard';
import FortuneActions from './components/FortuneActions';
import DailyLimitBanner from './components/DailyLimitBanner';
import InviteFriendModal from './components/InviteFriendModal';
import ApiKeyModal from './components/ApiKeyModal';
import HistoryModal from './components/HistoryModal';
import { generateFortune } from './services/aiService';
import { 
  checkCanDrawToday, 
  recordDrawToday, 
  getDrawHistory, 
  resetDailyLimit 
} from './utils/storage';
import { 
  ensureAudioContext, 
  playWoodBlockSound, 
  playStickAscendSound, 
  playBellSound 
} from './utils/audio';
import { Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  
  // Ritual step states: 'IDLE' | 'SHAKING' | 'STICK_REVEALED' | 'CARD_UNROLLED'
  const [ritualState, setRitualState] = useState('IDLE');
  const [fortune, setFortune] = useState(null);
  const [canDraw, setCanDraw] = useState(true);
  const [extraDraws, setExtraDraws] = useState(0);
  const [todayFortune, setTodayFortune] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Shared URL State (?q=...)
  const [isSharedView, setIsSharedView] = useState(false);
  const [sharedSender, setSharedSender] = useState('');

  // Counter event trigger
  const [drawEventTrigger, setDrawEventTrigger] = useState(0);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Card reference for html-to-image export
  const fortuneCardRef = useRef(null);
  const ritualSectionRef = useRef(null);

  // Initial check on load
  const refreshDrawStatus = () => {
    const status = checkCanDrawToday();
    setCanDraw(status.canDraw);
    setExtraDraws(status.extraDraws);
    setTodayFortune(status.fortune);
    setHistory(getDrawHistory());
  };

  useEffect(() => {
    refreshDrawStatus();

    // Check if user came from a shared fortune link: ?q=...
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const qParam = urlParams.get('q');
      if (qParam) {
        const decodedJson = decodeURIComponent(
          atob(qParam)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const p = JSON.parse(decodedJson);
        if (p && p.t && p.m) {
          setFortune({
            ten_que: p.t,
            muc: p.m,
            loi_que: p.l,
            giai_nghia: p.g,
            loi_khuyen: p.k,
            mau_sac: p.c,
            mau_hex: p.h,
            con_so: p.n,
            gio_cat: p.gh
          });
          setName(p.u || '');
          setQuestion(p.q || '');
          setSharedSender(p.u || 'Một người bạn');
          setIsSharedView(true);
          setRitualState('CARD_UNROLLED');
          return;
        }
      }
    } catch (err) {
      console.debug("Could not parse shared fortune link:", err);
    }
  }, []);

  // Friend clicks CTA to draw their own fortune
  const handleStartOwnDraw = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
    setIsSharedView(false);
    setFortune(null);
    setName('');
    setQuestion('');
    setRitualState('IDLE');
    refreshDrawStatus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Draw Fortune action
  const handleDraw = async () => {
    if (isShaking) return;

    ensureAudioContext();
    playWoodBlockSound();

    setIsShaking(true);
    setRitualState('SHAKING');
    setFortune(null);

    try {
      const fortunePromise = generateFortune({ name, question });
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 2300));

      const [result] = await Promise.all([fortunePromise, delayPromise]);

      setFortune(result);
      setTodayFortune(result);

      // Increment global counter on successful draw
      setDrawEventTrigger(prev => prev + 1);

      recordDrawToday(result);
      refreshDrawStatus();

      setIsShaking(false);
      setRitualState('STICK_REVEALED');
      playStickAscendSound();
      setTimeout(() => {
        playBellSound();
      }, 350);

      setTimeout(() => {
        ritualSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error("Lỗi xin quẻ:", err);
      setIsShaking(false);
      setRitualState('IDLE');
    }
  };

  // Open the unrolled scroll card
  const handleOpenScroll = () => {
    ensureAudioContext();
    setRitualState('CARD_UNROLLED');
    setTimeout(() => {
      ritualSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  };

  // Bonus granted callback from Invite modal
  const handleBonusGranted = () => {
    refreshDrawStatus();
    setCanDraw(true);
    setRitualState('IDLE');
  };

  // Test mode reset (Dev / Demo)
  const handleTestReset = () => {
    resetDailyLimit();
    setCanDraw(true);
    setExtraDraws(0);
    setFortune(null);
    setTodayFortune(null);
    setRitualState('IDLE');
  };

  // View today's drawn fortune
  const handleViewTodayFortune = () => {
    if (todayFortune) {
      setFortune(todayFortune);
      setRitualState('CARD_UNROLLED');
      setTimeout(() => {
        ritualSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Select fortune from history
  const handleSelectHistoryItem = (item) => {
    setFortune(item);
    setRitualState('CARD_UNROLLED');
    setTimeout(() => {
      ritualSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Clear history
  const handleClearHistory = () => {
    localStorage.removeItem('qhn_draw_history');
    setHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-radial-gradient text-paper-light selection:bg-gold-ancient selection:text-lacquer-deep">
      
      {/* Pure Canvas Golden Stardust Background */}
      <GoldenDustCanvas />

      {/* Atmospheric Spiritual Light Halo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-temple-red/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gold-bright/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-temple-seal/10 rounded-full blur-[130px]"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center">
        {/* Header with Altar and Actions */}
        <Header 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={history.length}
        />

        {/* Live Global Draw Counter & Active Online Badge */}
        <LiveDrawCounter onDrawEvent={drawEventTrigger} />

        {/* Main Content Area */}
        <main className="w-full max-w-xl mx-auto flex flex-col items-center pb-8">
          
          {/* SHARED VIEW BANNER: If viewing a friend's fortune from link ?q=... */}
          {isSharedView && (
            <div className="w-full max-w-md mx-4 mb-3 p-3.5 rounded-lg bg-gradient-to-r from-amber-950/70 via-temple-red/60 to-amber-950/70 border-2 border-gold-bright text-center shadow-gold-glow animate-fade-in">
              <div className="flex items-center justify-center gap-1.5 text-xs font-serif font-bold text-gold-bright mb-1">
                <Heart size={14} className="text-red-400 fill-red-400 animate-pulse" />
                <span>Quẻ Bình An Được Gửi Tặng Từ {sharedSender}</span>
              </div>
              <p className="text-[11px] text-paper-light/90 font-serif leading-relaxed mb-2.5">
                Bạn của bạn vừa gieo được quẻ này và gửi tặng bạn cùng chiêm nghiệm!
              </p>
              <button
                onClick={handleStartOwnDraw}
                className="w-full py-2 px-4 rounded bg-gradient-to-r from-gold-ancient via-gold-bright to-gold-ancient text-lacquer-deep font-serif font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition shadow-md flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Gieo Quẻ Riêng Cho Bạn Hôm Nay</span>
              </button>
            </div>
          )}

          {/* 1. Pure SVG 3D Bamboo Cylinder with Motion & Drag Shake (Hidden in shared view) */}
          {!isSharedView && ritualState !== 'CARD_UNROLLED' && (
            <BambooCylinderPure
              isShaking={isShaking}
              isStickRevealed={ritualState === 'STICK_REVEALED'}
              chosenFortune={fortune}
              onClick={() => {
                if (canDraw && !isShaking) {
                  handleDraw();
                }
              }}
              onTriggerDraw={handleDraw}
              disabled={!canDraw}
            />
          )}

          {/* 2. Interactive Input Form or Daily Limit Status */}
          {!isSharedView && canDraw && ritualState === 'IDLE' && (
            <FortuneForm
              name={name}
              setName={setName}
              question={question}
              setQuestion={setQuestion}
              onSubmit={handleDraw}
              isShaking={isShaking}
              disabled={!canDraw}
              extraDraws={extraDraws}
              onOpenInviteModal={() => setIsInviteOpen(true)}
            />
          )}

          {!isSharedView && !canDraw && ritualState === 'IDLE' && (
            <DailyLimitBanner
              onViewTodayFortune={handleViewTodayFortune}
              onTestReset={handleTestReset}
              onOpenInviteModal={() => setIsInviteOpen(true)}
            />
          )}

          {/* 3. Revealed Sacred Stick Phase */}
          <div ref={ritualSectionRef} className="w-full">
            {!isSharedView && ritualState === 'STICK_REVEALED' && fortune && (
              <ChosenStickCardPure
                fortune={fortune}
                onOpenScroll={handleOpenScroll}
              />
            )}

            {/* 4. Unrolled Silk & Parchment Fortune Card */}
            {ritualState === 'CARD_UNROLLED' && fortune && (
              <>
                <FortuneCard
                  ref={fortuneCardRef}
                  fortune={fortune}
                  userName={name}
                  userQuestion={question}
                />
                
                {isSharedView ? (
                  <div className="w-full max-w-md mx-auto px-4 mt-3 mb-8">
                    <button
                      onClick={handleStartOwnDraw}
                      className="w-full py-3.5 px-4 rounded-md bg-gradient-to-r from-[#6E1B1B] via-[#C9A24A] to-[#6E1B1B] border-2 border-gold-bright text-paper-light font-serif font-black text-sm tracking-wide hover:brightness-115 active:scale-98 transition shadow-gold-glow flex items-center justify-center gap-2"
                    >
                      <Sparkles size={16} className="text-gold-bright animate-pulse" />
                      <span>Thành Tâm Gieo Quẻ Của Bạn Ngay</span>
                    </button>
                  </div>
                ) : (
                  <FortuneActions
                    fortuneRef={fortuneCardRef}
                    fortune={fortune}
                    onReset={handleTestReset}
                    canDrawAgain={true}
                    userName={name}
                    userQuestion={question}
                  />
                )}
              </>
            )}
          </div>

        </main>
      </div>

      {/* Classical Temple Footer */}
      <footer className="relative z-10 w-full max-w-xl mx-auto py-6 px-4 border-t border-gold-ancient/15 text-center text-xs text-gold-muted/70 font-serif">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-ancient/50"></span>
          <span>Tâm thành tất ứng • Thiện niệm khởi sinh</span>
          <span className="w-1.5 h-1.5 rounded-full bg-gold-ancient/50"></span>
        </div>
        <p className="text-[11px] text-gold-muted/50">
          Quẻ Hôm Nay — Ứng dụng gieo quẻ truyền thống kết hợp Trí tuệ nhân tạo.
        </p>
        <div className="mt-2.5 flex justify-center items-center gap-3 text-[10px]">
          <button 
            onClick={handleTestReset}
            className="text-gold-bright/70 hover:text-gold-bright transition underline underline-offset-2"
          >
            Đặt lại lượt rút (Thử nghiệm)
          </button>
          <span>•</span>
          <button 
            onClick={() => setIsInviteOpen(true)}
            className="text-gold-bright/70 hover:text-gold-bright transition underline underline-offset-2"
          >
            Mời bạn (+1 lượt)
          </button>
          <span>•</span>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-gold-muted/50 hover:text-gold-pale transition underline underline-offset-2"
          >
            Cài đặt AI Key
          </button>
        </div>
      </footer>

      {/* Modals */}
      <InviteFriendModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onBonusGranted={handleBonusGranted}
      />

      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectFortune={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />

    </div>
  );
}
