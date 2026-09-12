import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import {
  Header,
  Footer,
  GoldenDustCanvas,
  SharedViewBanner,
  LiveDrawCounter,
  BambooCylinderPure,
  ChosenStickCardPure,
  FortuneCard,
  FortuneActions,
  FortuneForm,
  DailyLimitBanner,
  HistoryModal,
  InviteFriendModal,
  AuthModal,
  AdminDashboardModal
} from './components';
import { useDrawStatus, useDrawHistory, useFortuneDraw, useAuth } from './hooks';
import { userApi, statsApi } from './api';

export default function App() {
  // Shared fortune view state (?q=...)
  const [isSharedView, setIsSharedView] = useState(false);
  const [sharedSender, setSharedSender] = useState('');
  const [referralToast, setReferralToast] = useState(null);

  // Modals state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Counter event trigger for visual pulse
  const [drawCounterEvent, setDrawCounterEvent] = useState(0);

  // Refs for smooth scroll & screenshot generation
  const fortuneCardRef = useRef(null);
  const ritualSectionRef = useRef(null);

  // 1. Data & Auth Hooks
  const auth = useAuth();
  const { history, isOpen: isHistoryOpen, openHistory, closeHistory, clearHistory, fetchHistory } = useDrawHistory();
  const { canDraw, extraDraws, todayFortune, refreshStatus, resetLimit } = useDrawStatus();

  // Track initial client page view traffic
  useEffect(() => {
    statsApi.trackPageView();
  }, []);

  // Smooth scroll helper with comfortable top headroom
  const scrollToRitual = (delay = 100) => {
    setTimeout(() => {
      const el = ritualSectionRef.current;
      if (el) {
        const y = el.getBoundingClientRect().top + window.pageYOffset - 20;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, delay);
  };

  // 2. Fortune Draw Ritual Hook
  const {
    name,
    setName,
    birthYear,
    setBirthYear,
    question,
    setQuestion,
    topic,
    setTopic,
    isShaking,
    ritualState,
    setRitualState,
    fortune,
    setFortune,
    startDraw,
    openScroll,
    resetRitual
  } = useFortuneDraw({
    onDrawSuccess: async () => {
      setDrawCounterEvent(prev => prev + 1);
      await refreshStatus();
      await fetchHistory();
      scrollToRitual(120);
    }
  });

  // Auto-fill form name if user is logged in and hasn't typed a name
  useEffect(() => {
    if (auth.user?.name && !name) {
      setName(auth.user.name);
    }
  }, [auth.user, name, setName]);

  // 3. Handle shared link on initial load
  useEffect(() => {
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
        }
      }
    } catch (err) {
      console.debug('Could not parse shared link:', err);
    }
  }, [setFortune, setName, setQuestion, setRitualState]);

  // 4. Handle referral link click when partner opens ?ref=userId
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refId = urlParams.get('ref');
      if (refId && refId !== 'duyen-lanh') {
        userApi.recordReferralClick(refId)
          .then(async (res) => {
            if (res && res.bonusGranted) {
              await refreshStatus();
              setReferralToast('✦ Duyên Lành Tương Ngộ: Bạn đã mở liên kết mời gieo quẻ từ bạn bè! Cả bạn và người gửi đều được nhận thêm +1 lượt gieo quẻ hôm nay. ✦');
              setTimeout(() => setReferralToast(null), 10000);
            } else if (res && res.alreadyCounted) {
              setReferralToast('✦ Duyên Lành: Hôm nay bạn đã nhận lượt mở từ liên kết này rồi. Hãy gieo quẻ để nhận lời sấm truyền nhé! ✦');
              setTimeout(() => setReferralToast(null), 7000);
            } else if (res && res.reason === 'self_referral') {
              setReferralToast('✦ Đây là liên kết mời của chính bạn. Hãy gửi cho bạn bè để cả 2 cùng nhận thêm lượt nhé! ✦');
              setTimeout(() => setReferralToast(null), 7000);
            }
          })
          .catch((err) => {
            console.debug('[Referral] Could not record click:', err);
          });
      }
    } catch {
      // ignore
    }
  }, [refreshStatus]);

  // Friend clicks CTA to start their own draw
  const handleStartOwnDraw = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
    setIsSharedView(false);
    resetRitual();
    setName('');
    setBirthYear('');
    setQuestion('');
    setTopic('Công việc & Sự nghiệp');
    refreshStatus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open the unrolled scroll card
  const handleOpenScroll = () => {
    openScroll();
    scrollToRitual(120);
  };


  // View today's already drawn fortune
  const handleViewTodayFortune = () => {
    if (todayFortune) {
      setFortune(todayFortune);
      setRitualState('CARD_UNROLLED');
      scrollToRitual(100);
    }
  };

  // Select fortune from history modal
  const handleSelectHistoryItem = (item) => {
    setFortune(item);
    setRitualState('CARD_UNROLLED');
    scrollToRitual(100);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-radial-gradient text-paper-light selection:bg-gold-ancient selection:text-lacquer-deep">
      {/* Background Stardust Particles */}
      <GoldenDustCanvas />

      {/* Atmospheric Spiritual Light Halo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-temple-red/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gold-bright/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-temple-seal/10 rounded-full blur-[130px]"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center">
        {/* Navigation Header */}
        <Header 
          onOpenHistory={openHistory}
          historyCount={history.length}
          user={auth.user}
          isAdmin={auth.isAdmin}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenAdmin={() => {
            if (auth.isAdmin) {
              setIsAdminOpen(true);
            }
          }}
          onLogout={() => {
            auth.logout();
            refreshStatus();
            fetchHistory();
          }}
        />

        {/* Main Ritual & Content Stage */}
        <main className="w-full max-w-xl mx-auto flex flex-col items-center pb-8 px-4">
          {/* Referral Notification Banner */}
          {referralToast && (
            <div className="w-full max-w-lg mb-4 p-3.5 rounded-lg bg-gradient-to-r from-[#2A0907] via-[#481410] to-[#2A0907] border-2 border-gold-bright shadow-[0_0_25px_rgba(212,175,55,0.3)] flex items-start gap-3 animate-fadeIn relative text-paper-light">
              <Sparkles size={18} className="text-gold-bright shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1 text-xs font-serif leading-relaxed text-gold-pale">
                {referralToast}
              </div>
              <button
                onClick={() => setReferralToast(null)}
                className="text-gold-muted hover:text-gold-bright transition text-sm px-1 leading-none"
                title="Đóng thông báo"
              >
                ✕
              </button>
            </div>
          )}

          {/* Shared View Banner */}
          {isSharedView && (
            <SharedViewBanner 
              sender={sharedSender}
              onStartOwnDraw={handleStartOwnDraw}
            />
          )}

          {/* 1. Bamboo Cylinder (Motion & Drag Shake) */}
          {!isSharedView && ritualState !== 'CARD_UNROLLED' && (
            <BambooCylinderPure
              isShaking={isShaking}
              isStickRevealed={ritualState === 'STICK_REVEALED'}
              chosenFortune={fortune}
              onClick={() => {
                if (canDraw && !isShaking) startDraw();
              }}
              onTriggerDraw={startDraw}
              disabled={!canDraw}
            />
          )}

          {/* 2. Interactive Input Form or Daily Limit Status */}
          {!isSharedView && canDraw && ritualState === 'IDLE' && (
            <FortuneForm
              name={name}
              setName={setName}
              birthYear={birthYear}
              setBirthYear={setBirthYear}
              topic={topic}
              setTopic={setTopic}
              question={question}
              setQuestion={setQuestion}
              onSubmit={startDraw}
              isShaking={isShaking}
              disabled={!canDraw}
              extraDraws={extraDraws}
              onOpenInviteModal={() => setIsInviteOpen(true)}
            />
          )}

          {!isSharedView && !canDraw && ritualState === 'IDLE' && (
            <DailyLimitBanner
              onViewTodayFortune={handleViewTodayFortune}
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
                  birthYear={birthYear}
                  userQuestion={question}
                  topic={topic}
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
                    onReset={resetRitual}
                    canDrawAgain={canDraw}
                    userName={name}
                    userQuestion={question}
                  />
                )}
              </>
            )}
          </div>

          {/* Global Community Draw Counter */}
          <div className="w-full mt-6 mb-2">
            <LiveDrawCounter onDrawEvent={drawCounterEvent} />
          </div>
        </main>
      </div>

      {/* Classical Temple Footer */}
      <Footer 
        onOpenInvite={() => setIsInviteOpen(true)}
      />

      {/* Modals */}
      <InviteFriendModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onBonusGranted={refreshStatus}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={closeHistory}
        history={history}
        onSelectFortune={handleSelectHistoryItem}
        onClearHistory={clearHistory}
      />

      {/* Authentication Modal (Sign In / Register / Google) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        authHook={auth}
        onSuccess={async () => {
          await refreshStatus();
          await fetchHistory();
        }}
      />

      {/* Admin Management & Analytics Dashboard */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={auth.user}
      />
    </div>
  );
}
