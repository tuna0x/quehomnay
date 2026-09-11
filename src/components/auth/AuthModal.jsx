import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  LogIn, 
  UserPlus, 
  ShieldCheck,
  Compass
} from 'lucide-react';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  authHook,
  initialMode = 'login' 
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [localSuccess, setLocalSuccess] = useState(null);
  
  // Google GIS button container
  const googleBtnRef = useRef(null);
  const [googleClientReady, setGoogleClientReady] = useState(false);
  const [showDevGooglePrompt, setShowDevGooglePrompt] = useState(false);
  const [devEmail, setDevEmail] = useState('admin@quehomnay.com');

  const { login, register, loginWithGoogle, error: authError, setError } = authHook;

  // Sync mode with initialMode prop
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setLocalError(null);
      setLocalSuccess(null);
      if (setError) setError(null);
    }
  }, [isOpen, initialMode, setError]);

  // Load Google Identity Services script if not already present
  useEffect(() => {
    if (!isOpen) return;

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!googleClientId) {
      // Google Client ID is not yet configured, show dev/test option
      setGoogleClientReady(false);
      return;
    }

    const initGoogleGSI = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response) => {
              if (response.credential) {
                setSubmitting(true);
                try {
                  await loginWithGoogle({ credential: response.credential });
                  setLocalSuccess('Đăng nhập bằng Google thành công!');
                  setTimeout(() => {
                    if (onSuccess) onSuccess();
                    onClose();
                  }, 800);
                } catch (err) {
                  setLocalError(err.data?.error || err.message || 'Lỗi đăng nhập Google');
                } finally {
                  setSubmitting(false);
                }
              }
            }
          });

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            shape: 'rectangular',
            text: 'continue_with',
            locale: 'vi',
            width: 320
          });

          setGoogleClientReady(true);
        } catch (err) {
          console.debug('[AuthModal] Google GSI initialization error:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleGSI();
    } else {
      const existingScript = document.getElementById('google-gsi-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setTimeout(initGoogleGSI, 100);
        };
        document.body.appendChild(script);
      }
    }
  }, [isOpen, loginWithGoogle, onSuccess, onClose]);

  if (!isOpen) return null;

  // Handle standard Email/Password submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);

    if (!email.trim() || !password) {
      setLocalError('Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setLocalError('Mật khẩu phải có độ dài ít nhất 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password });
        setLocalSuccess('Đăng nhập thành công! Chào mừng bạn trở lại.');
      } else {
        await register({ email: email.trim(), password, name: name.trim() });
        setLocalSuccess('Đăng ký tài khoản thành công! Khởi tạo duyên lành.');
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 700);
    } catch (err) {
      setLocalError(err.data?.error || err.message || 'Thao tác không thành công.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Google Login in dev/sandbox mode (quick test)
  const handleDevGoogleLogin = async () => {
    if (!devEmail) return;
    setSubmitting(true);
    setLocalError(null);
    try {
      await loginWithGoogle({
        userInfo: {
          email: devEmail.trim().toLowerCase(),
          name: devEmail.split('@')[0],
          googleId: `g_mock_${Date.now()}`,
          avatarUrl: null
        }
      });
      setLocalSuccess(`Đăng nhập Google (${devEmail}) thành công!`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 700);
    } catch (err) {
      setLocalError(err.data?.error || err.message || 'Lỗi thử nghiệm Google login.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="w-full max-w-md bg-gradient-to-b from-[#250705] via-[#1A0503] to-[#0F0202] border-2 border-gold-bright/60 rounded-xl shadow-[0_0_40px_rgba(201,162,74,0.35)] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ancient Ornament Top Banner */}
        <div className="relative px-6 pt-5 pb-3 border-b border-gold-ancient/20 bg-gradient-to-r from-[#3C0D0A] via-[#521310] to-[#3C0D0A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#8B1E1E] to-[#2B0605] border border-gold-bright flex items-center justify-center shadow">
              <span className="text-gold-bright font-serif text-sm font-black">道</span>
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-gold-pale leading-tight">
                {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Đạo Hữu'}
              </h2>
              <span className="text-[10px] text-gold-ancient/80 uppercase font-serif tracking-wider block">
                {mode === 'login' ? 'Gắn kết duyên lành cổ truyền' : 'Khởi đầu hành trình chiêm nghiệm'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-lacquer-deep/60 border border-gold-ancient/30 text-gold-pale hover:text-gold-bright hover:border-gold-bright flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-gold-ancient/20 bg-[#120302]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLocalError(null);
            }}
            className={`py-2.5 text-xs font-serif font-bold tracking-wide transition flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'text-gold-bright border-b-2 border-gold-bright bg-[#240604]/80'
                : 'text-gold-muted hover:text-gold-pale'
            }`}
          >
            <LogIn size={14} />
            <span>ĐĂNG NHẬP</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setLocalError(null);
            }}
            className={`py-2.5 text-xs font-serif font-bold tracking-wide transition flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'text-gold-bright border-b-2 border-gold-bright bg-[#240604]/80'
                : 'text-gold-muted hover:text-gold-pale'
            }`}
          >
            <UserPlus size={14} />
            <span>ĐĂNG KÝ</span>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Notifications */}
          {displayError && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-serif flex items-start gap-2 animate-fadeIn">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          {localSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-serif flex items-start gap-2 animate-fadeIn">
              <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>{localSuccess}</span>
            </div>
          )}

          {/* Google Sign-In Section */}
          <div className="space-y-2">
            <div className="flex justify-center">
              <div ref={googleBtnRef} className="w-full flex justify-center min-h-[40px]">
                {/* Fallback button if Google GSI is not loaded or clientId missing */}
                {!googleClientReady && (
                  <button
                    type="button"
                    onClick={() => setShowDevGooglePrompt(!showDevGooglePrompt)}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#2A0A08] border border-gold-ancient/40 hover:border-gold-bright text-gold-pale hover:text-gold-bright font-serif text-xs font-semibold flex items-center justify-center gap-3 transition shadow"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Tiếp tục với Google</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Google Test Mode (if clientId not set or clicked) */}
            {showDevGooglePrompt && (
              <div className="p-3 rounded-lg bg-[#1F0806] border border-gold-bright/30 space-y-2 text-xs font-serif animate-fadeIn">
                <div className="flex items-center justify-between text-gold-bright font-bold">
                  <span className="flex items-center gap-1">
                    <Compass size={13} /> Thử nghiệm đăng nhập Google
                  </span>
                  <button 
                    onClick={() => setShowDevGooglePrompt(false)}
                    className="text-gold-muted hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11px] text-paper-light/80 leading-tight">
                  Nhập email Google bạn muốn thử nghiệm (nhập email admin để nhận quyền Quản trị viên):
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    placeholder="email@gmail.com"
                    className="flex-1 bg-[#120302] border border-gold-ancient/40 rounded px-2.5 py-1.5 text-xs text-gold-pale focus:border-gold-bright outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleDevGoogleLogin}
                    disabled={submitting}
                    className="px-3 py-1.5 bg-gold-ancient text-lacquer-deep font-bold rounded hover:bg-gold-bright text-xs transition"
                  >
                    {submitting ? '...' : 'Đăng Nhập'}
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <span className="h-[1px] flex-1 bg-gold-ancient/20"></span>
              <span className="text-[10px] uppercase font-serif text-gold-muted tracking-wider">
                hoặc dùng Email
              </span>
              <span className="h-[1px] flex-1 bg-gold-ancient/20"></span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name field for Register */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-serif text-gold-pale block">
                  Họ và tên hoặc Đạo hiệu
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-ancient/70" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn An hoặc Thanh Tâm"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#140403] border border-gold-ancient/30 focus:border-gold-bright text-gold-pale placeholder-gold-muted/50 text-xs font-serif outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1">
              <label className="text-[11px] font-serif text-gold-pale block">
                Địa chỉ Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-ancient/70" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#140403] border border-gold-ancient/30 focus:border-gold-bright text-gold-pale placeholder-gold-muted/50 text-xs font-serif outline-none transition"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="text-[11px] font-serif text-gold-pale block">
                Mật khẩu <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-ancient/70" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Ít nhất 6 ký tự' : 'Mật khẩu của bạn'}
                  className="w-full pl-9 pr-9 py-2 rounded-lg bg-[#140403] border border-gold-ancient/30 focus:border-gold-bright text-gold-pale placeholder-gold-muted/50 text-xs font-serif outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-muted hover:text-gold-bright transition"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password for Register */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-serif text-gold-pale block">
                  Xác nhận mật khẩu <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-ancient/70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#140403] border border-gold-ancient/30 focus:border-gold-bright text-gold-pale placeholder-gold-muted/50 text-xs font-serif outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 mt-2 rounded-lg bg-gradient-to-r from-[#6E1B1B] via-[#C9A24A] to-[#6E1B1B] border-2 border-gold-bright text-paper-light font-serif font-bold text-xs tracking-wider uppercase hover:brightness-115 active:scale-98 transition shadow-[0_4px_16px_rgba(201,162,74,0.3)] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-paper-light border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} className="text-gold-bright animate-pulse" />
                  <span>{mode === 'login' ? 'Đăng Nhập Ngay' : 'Đăng Ký Tài Khoản'}</span>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="text-center pt-2">
            <p className="text-[11px] font-serif text-gold-muted/80">
              {mode === 'login' ? (
                <>
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setLocalError(null);
                    }}
                    className="text-gold-bright underline hover:text-white font-semibold ml-1"
                  >
                    Đăng ký ngay
                  </button>
                </>
              ) : (
                <>
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setLocalError(null);
                    }}
                    className="text-gold-bright underline hover:text-white font-semibold ml-1"
                  >
                    Đăng nhập ngay
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
