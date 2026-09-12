import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Mail, Send, Sparkles, X } from 'lucide-react';
import { contactApi } from '../../api';

const initialForm = {
  name: '',
  email: '',
  subject: 'Góp ý chung',
  message: '',
  website: ''
};

export default function ContactModal({ isOpen, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      setStatus('idle');
      setError('');
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (status !== 'idle') {
      setStatus('idle');
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setError('');

    try {
      await contactApi.sendMessage(form);
      setStatus('success');
      setForm(initialForm);
    } catch (requestError) {
      setStatus('error');
      setError(requestError.message || 'Không thể gửi lời nhắn lúc này.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl border-2 border-gold-ancient/50 bg-lacquer-card/95 shadow-[0_0_45px_rgba(212,175,55,0.2)]"
      >
        <div className="border-b border-gold-ancient/25 bg-gradient-to-r from-[#2A0907] via-[#481410] to-[#2A0907] px-5 py-5 text-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng form liên hệ"
            className="absolute right-3 top-3 rounded-full p-1.5 text-gold-muted transition hover:bg-black/20 hover:text-gold-bright"
          >
            <X size={18} />
          </button>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-gold-bright/60 bg-lacquer-deep/80 text-gold-bright shadow-gold-glow">
            <Mail size={18} />
          </div>
          <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-gold-muted">Thư tín thiền viện</p>
          <h2 id="contact-modal-title" className="font-serif text-xl font-black text-gold-pale">
            Gửi lời nhắn
          </h2>
          <p className="mt-1 text-xs text-paper-light/65">Mỗi lời góp ý đều giúp Quẻ Hôm Nay tốt lành hơn.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 font-serif">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs text-gold-pale">
              Họ và tên <span className="text-temple-seal">*</span>
              <input
                type="text"
                name="name"
                required
                maxLength={100}
                autoComplete="name"
                value={form.name}
                onChange={updateField('name')}
                placeholder="Tên của bạn"
                className="paper-scroll mt-1.5 w-full rounded-md border border-gold-ancient/40 bg-lacquer-deep/70 px-3 py-2.5 text-sm text-lacquer-deep outline-none transition placeholder:text-lacquer-deep/50 focus:border-gold-bright focus:ring-2 focus:ring-gold-bright/20"
              />
            </label>

            <label className="block text-xs text-gold-pale">
              Email nhận phản hồi <span className="text-temple-seal">*</span>
              <input
                type="email"
                name="email"
                required
                maxLength={254}
                autoComplete="email"
                value={form.email}
                onChange={updateField('email')}
                placeholder="ban@example.com"
                className="paper-scroll mt-1.5 w-full rounded-md border border-gold-ancient/40 bg-lacquer-deep/70 px-3 py-2.5 text-sm text-lacquer-deep outline-none transition placeholder:text-lacquer-deep/50 focus:border-gold-bright focus:ring-2 focus:ring-gold-bright/20"
              />
            </label>
          </div>

          <label className="block text-xs text-gold-pale">
            Chủ đề <span className="text-temple-seal">*</span>
            <select
              name="subject"
              required
              value={form.subject}
              onChange={updateField('subject')}
              className="paper-scroll mt-1.5 w-full rounded-md border border-gold-ancient/40 bg-lacquer-deep/70 px-3 py-2.5 text-sm text-lacquer-deep outline-none transition focus:border-gold-bright focus:ring-2 focus:ring-gold-bright/20"
            >
              <option>Góp ý chung</option>
              <option>Báo lỗi trải nghiệm</option>
              <option>Hợp tác</option>
              <option>Khác</option>
            </select>
          </label>

          <label className="block text-xs text-gold-pale">
            Lời nhắn <span className="text-temple-seal">*</span>
            <textarea
              name="message"
              required
              maxLength={3000}
              rows={5}
              value={form.message}
              onChange={updateField('message')}
              placeholder="Thiền viện đang lắng nghe..."
              className="paper-scroll mt-1.5 w-full resize-y rounded-md border border-gold-ancient/40 bg-lacquer-deep/70 px-3 py-2.5 text-sm leading-relaxed text-lacquer-deep outline-none transition placeholder:text-lacquer-deep/50 focus:border-gold-bright focus:ring-2 focus:ring-gold-bright/20"
            />
            <span className="mt-1 block text-right text-[10px] text-gold-muted/70">Tối đa 3000 ký tự</span>
          </label>

          <label className="hidden" aria-hidden="true">
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={updateField('website')}
            />
          </label>

          {status === 'success' && (
            <div className="flex items-start gap-2 rounded-md border border-emerald-500/35 bg-emerald-950/30 px-3 py-2.5 text-xs leading-relaxed text-emerald-200" role="status">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>Đã ghi nhận lời nhắn. Cảm ơn bạn, quản trị viên sẽ xem và phản hồi sớm nhất có thể.</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-start gap-2 rounded-md border border-red-400/35 bg-red-950/30 px-3 py-2.5 text-xs leading-relaxed text-red-200" role="alert">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending' || status === 'success'}
            className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-gold-bright bg-gradient-to-r from-[#6E1B1B] via-[#A52A23] to-[#6E1B1B] px-4 py-3 font-serif text-sm font-black tracking-wide text-paper-light shadow-gold-glow transition hover:brightness-115 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'sending' ? <Sparkles size={16} className="animate-pulse" /> : <Send size={16} />}
            <span>{status === 'sending' ? 'Đang thỉnh thư...' : status === 'success' ? 'Đã gửi thành công' : 'Gửi lời nhắn'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
