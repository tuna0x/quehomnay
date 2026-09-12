import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, LogIn, LogOut, Mail, ShieldCheck, Sparkles, UserPlus, UserRound, X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, authUser, authHook, onSuccess, onLogout }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!isOpen) return;

    setMode('login');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setShowPassword(false);
    setSubmitting(false);
    setError('');
    setSuccess('');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !googleClientId) return;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response.credential) return;

          setSubmitting(true);
          setError('');
          try {
            const result = await authHook.loginWithGoogle(response.credential);
            setSuccess('Đăng nhập bằng Google thành công.');
            onSuccess?.(result.user);
            window.setTimeout(onClose, 650);
          } catch (googleError) {
            setError(googleError.data?.error || googleError.message || 'Không thể đăng nhập bằng Google.');
          } finally {
            setSubmitting(false);
          }
        }
      });

      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        locale: 'vi',
        width: 320
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return undefined;
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButton);
      return () => existingScript.removeEventListener('load', renderGoogleButton);
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', renderGoogleButton);
    document.head.appendChild(script);

    return () => script.removeEventListener('load', renderGoogleButton);
  }, [authHook, googleClientId, isOpen, onClose, onSuccess]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Mật khẩu phải có từ 8 ký tự.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);
    try {
      const result = mode === 'login'
        ? await authHook.login({ email: email.trim(), password })
        : await authHook.register({ email: email.trim(), password, name: name.trim() });

      setSuccess(mode === 'login' ? 'Đăng nhập thành công.' : 'Tạo tài khoản thành công.');
      onSuccess?.(result.user);
      window.setTimeout(onClose, 650);
    } catch (requestError) {
      setError(requestError.data?.error || requestError.message || 'Thao tác không thành công.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setSubmitting(true);
    setError('');
    try {
      await authHook.logout();
      await onLogout?.();
      onClose();
    } catch (logoutError) {
      setError(logoutError.message || 'Không thể đăng xuất lúc này.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-black/75 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto sm:max-h-[calc(100dvh-3rem)] rounded-xl border-2 border-gold-ancient/50 bg-lacquer-card shadow-[0_0_45px_rgba(212,175,55,0.2)]"
      >
        <div className="border-b border-gold-ancient/25 bg-gradient-to-r from-[#2A0907] via-[#481410] to-[#2A0907] px-4 py-4 sm:px-5 sm:py-5 text-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng đăng nhập"
            className="absolute right-3 top-3 rounded-full p-1.5 text-gold-muted transition hover:bg-black/20 hover:text-gold-bright"
          >
            <X size={18} />
          </button>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-gold-bright/60 bg-lacquer-deep/80 text-gold-bright shadow-gold-glow">
            {authUser ? <UserRound size={18} /> : <Sparkles size={18} />}
          </div>
          <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-gold-muted">Gắn kết duyên lành</p>
          <h2 id="auth-modal-title" className="font-serif text-xl font-black text-gold-pale">
            {authUser ? 'Đạo hữu của thiền viện' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </h2>
          <p className="mt-1 text-xs text-paper-light/65">
            {authUser ? 'Lịch sử gieo quẻ của bạn đã được đồng bộ.' : 'Lưu lịch sử và xem lại quẻ trên mọi thiết bị.'}
          </p>
        </div>

        {authUser ? (
          <div className="space-y-3.5 p-4 font-serif sm:space-y-4 sm:p-5">
            <div className="flex items-center gap-3 rounded-lg border border-gold-ancient/30 bg-lacquer-deep/60 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-temple-red/80 text-gold-bright">
                <UserRound size={19} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gold-pale">{authUser.name || 'Đạo hữu'}</p>
                <p className="truncate text-xs text-gold-muted">{authUser.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-950/25 px-3 py-2.5 text-xs leading-relaxed text-emerald-200">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              <span>Tài khoản đã được xác thực. Lịch sử gieo quẻ mới sẽ tự động lưu vào tài khoản này.</span>
            </div>
            {error && <div className="rounded-md border border-red-400/35 bg-red-950/30 px-3 py-2.5 text-xs text-red-200" role="alert">{error}</div>}
            <button
              type="button"
              onClick={handleLogout}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-gold-ancient/35 bg-lacquer-deep/70 px-4 py-2.5 sm:py-3 text-sm font-bold text-gold-pale transition hover:border-gold-bright hover:text-gold-bright disabled:opacity-60"
            >
              <LogOut size={16} />
              <span>{submitting ? 'Đang xử lý...' : 'Đăng xuất'}</span>
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 border-b border-gold-ancient/20 bg-[#120302]">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className={mode === 'login' ? 'border-b-2 border-gold-bright bg-[#240604]/80 py-2.5 text-xs font-bold sm:py-3 text-gold-bright' : 'py-2.5 text-xs font-bold sm:py-3 text-gold-muted transition hover:text-gold-pale'}
              >
                <LogIn size={14} className="mr-1 inline" /> ĐĂNG NHẬP
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                className={mode === 'register' ? 'border-b-2 border-gold-bright bg-[#240604]/80 py-2.5 text-xs font-bold sm:py-3 text-gold-bright' : 'py-2.5 text-xs font-bold sm:py-3 text-gold-muted transition hover:text-gold-pale'}
              >
                <UserPlus size={14} className="mr-1 inline" /> ĐĂNG KÝ
              </button>
            </div>

            <div className="space-y-3.5 p-4 font-serif sm:space-y-4 sm:p-5">
              {error && (
                <div className="flex items-start gap-2 rounded-md border border-red-400/35 bg-red-950/30 px-3 py-2.5 text-xs leading-relaxed text-red-200" role="alert">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-950/25 px-3 py-2.5 text-xs leading-relaxed text-emerald-200" role="status">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {googleClientId ? (
                <div ref={googleButtonRef} className="flex min-h-[40px] justify-center" />
              ) : (
                <button
                  type="button"
                  disabled
                  title="Đăng nhập Google sẽ được mở sau khi cấu hình Google Client ID"
                  className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-gold-ancient/30 bg-lacquer-deep/45 px-3 py-2.5 text-xs font-bold text-gold-muted opacity-80"
                >
                  <Mail size={14} />
                  <span>Tiếp tục với Google · Sắp ra mắt</span>
                </button>
              )}

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-gold-ancient/20" />
                <span className="text-[10px] uppercase tracking-wider text-gold-muted">hoặc dùng email</span>
                <span className="h-px flex-1 bg-gold-ancient/20" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
                {mode === 'register' && (
                  <label className="block text-xs text-gold-pale">
                    Họ tên
                    <div className="relative mt-1.5">
                      <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-ancient/70" />
                      <input
                        type="text"
                        required
                        maxLength={255}
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Tên hiển thị"
                        className="paper-scroll w-full rounded-md border border-gold-ancient/40 bg-lacquer-deep/70 py-2.5 sm:py-3 pl-10 pr-3 text-sm text-lacquer-deep outline-none transition placeholder:text-lacquer-deep/50 focus:border-gold-bright focus:ring-2 focus:ring-gold-bright/20"
                      />
                    </div>
                  </label>
                )}

                <label className="block text-xs text-gold-pale">
                  Email
                  <div className="relative mt-1.5">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-ancient/70" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="ban@example.com"
                      className="paper-scroll w-full rounded-md border border-gold-ancient/40 bg-lacquer-deep/70 py-2.5 sm:py-3 pl-10 pr-3 text-sm text-lacquer-deep outline-none transition placeholder:text-lacquer-deep/50 focus:border-gold-bright focus:ring-2 focus:ring-gold-bright/20"
                    />
                  </div>
                </label>

                <label className="block text-xs text-gold-pale">
                  Mật khẩu
                  <div className="relative mt-1.5">
                    <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-ancient/70" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Tối thiểu 8 ký tự"
                      className="paper-scroll w-full rounded-md border border-gold-ancient/40 bg-lacquer-deep/70 py-2.5 sm:py-3 pl-10 pr-10 text-sm text-lacquer-deep outline-none transition placeholder:text-lacquer-deep/50 focus:border-gold-bright focus:ring-2 focus:ring-gold-bright/20"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Hiện hoặc ẩn mật khẩu" className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-muted hover:text-gold-bright">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                {mode === 'register' && (
                  <label className="block text-xs text-gold-pale">
                    Xác nhận mật khẩu
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="paper-scroll mt-1.5 w-full rounded-md border border-gold-ancient/40 bg-lacquer-deep/70 px-3 py-2.5 sm:py-3 text-sm text-lacquer-deep outline-none transition placeholder:text-lacquer-deep/50 focus:border-gold-bright focus:ring-2 focus:ring-gold-bright/20"
                    />
                  </label>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-gold-bright bg-gradient-to-r from-[#6E1B1B] via-[#A52A23] to-[#6E1B1B] px-4 py-2.5 sm:py-3 text-sm font-black tracking-wide text-paper-light shadow-gold-glow transition hover:brightness-115 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Sparkles size={16} className={submitting ? 'animate-pulse' : ''} />
                  <span>{submitting ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</span>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}