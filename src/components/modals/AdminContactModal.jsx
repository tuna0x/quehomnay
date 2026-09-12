import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Inbox,
  Loader2,
  MessageCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { adminContactApi } from '../../api';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả lời nhắn' },
  { value: 'new', label: 'Mới' },
  { value: 'read', label: 'Đã xem' },
  { value: 'replied', label: 'Đã xử lý' },
  { value: 'archived', label: 'Lưu trữ' }
];

const STATUS_META = {
  new: {
    label: 'Mới',
    icon: Inbox,
    className: 'border-amber-400/40 bg-amber-950/30 text-amber-200'
  },
  read: {
    label: 'Đã xem',
    icon: Clock3,
    className: 'border-sky-400/40 bg-sky-950/30 text-sky-200'
  },
  replied: {
    label: 'Đã xử lý',
    icon: CheckCircle2,
    className: 'border-emerald-400/40 bg-emerald-950/30 text-emerald-200'
  },
  archived: {
    label: 'Lưu trữ',
    icon: Archive,
    className: 'border-gold-ancient/35 bg-lacquer-deep/50 text-gold-muted'
  }
};

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch {
    return 'Vừa cập nhật';
  }
}

export default function AdminContactModal({ isOpen, onClose }) {
  const [filter, setFilter] = useState('all');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await adminContactApi.listMessages(filter);
      setMessages(result.messages || []);
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải hộp thư lúc này.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isOpen) loadMessages();
  }, [isOpen, loadMessages]);

  const newCount = useMemo(
    () => messages.filter((message) => message.status === 'new').length,
    [messages]
  );

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError('');

    try {
      await adminContactApi.updateStatus(id, status);
      if (filter !== 'all' && filter !== status) {
        setMessages((current) => current.filter((message) => message.id !== id));
      } else {
        setMessages((current) => current.map((message) => (
          message.id === id ? { ...message, status } : message
        )));
      }
    } catch (requestError) {
      setError(requestError.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-black/80 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-contact-modal-title"
        className="relative my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border-2 border-gold-ancient/50 bg-lacquer-card shadow-[0_0_45px_rgba(212,175,55,0.2)] sm:max-h-[calc(100dvh-3rem)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-gold-ancient/25 bg-gradient-to-r from-[#2A0907] via-[#481410] to-[#2A0907] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-bright/60 bg-lacquer-deep/80 text-gold-bright shadow-gold-glow">
              <MessageCircle size={18} />
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-gold-muted">Khu riêng của quản trị viên</p>
              <h2 id="admin-contact-modal-title" className="font-serif text-xl font-black text-gold-pale">
                Hộp thư thiền viện
              </h2>
              <p className="mt-1 text-xs text-paper-light/65">
                {newCount > 0 ? newCount + ' lời nhắn mới cần xem' : 'Các lời nhắn được lưu trực tiếp trong hệ thống.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thư quản trị"
            className="rounded-full p-1.5 text-gold-muted transition hover:bg-black/20 hover:text-gold-bright"
          >
            <X size={19} />
          </button>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold-ancient/20 bg-[#120302] px-4 py-3 sm:px-5">
          <label className="flex items-center gap-2 text-xs text-gold-pale">
            <span>Lọc:</span>
            <span className="relative">
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="appearance-none rounded-md border border-gold-ancient/35 bg-lacquer-deep/80 py-2 pl-3 pr-8 text-xs text-gold-pale outline-none focus:border-gold-bright"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-lacquer-deep text-gold-pale">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gold-muted" />
            </span>
          </label>
          <button
            type="button"
            onClick={loadMessages}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-gold-ancient/35 bg-lacquer-deep/70 px-3 py-2 text-xs font-bold text-gold-pale transition hover:border-gold-bright hover:text-gold-bright disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {error && (
            <div className="mb-4 rounded-md border border-red-400/35 bg-red-950/30 px-3 py-2.5 text-xs leading-relaxed text-red-200" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-gold-muted">
              <Loader2 size={18} className="animate-spin" />
              Đang mở hộp thư...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gold-ancient/25 bg-lacquer-deep/35 px-5 text-center text-sm text-gold-muted">
              <Inbox size={25} className="text-gold-ancient/70" />
              <p>Chưa có lời nhắn nào trong mục này.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const meta = STATUS_META[message.status] || STATUS_META.new;
                const StatusIcon = meta.icon;

                return (
                  <article key={message.id} className="rounded-lg border border-gold-ancient/25 bg-lacquer-deep/55 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-base font-bold text-gold-pale">{message.subject}</h3>
                          <span className={'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ' + meta.className}>
                            <StatusIcon size={12} />
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gold-muted">
                          {message.name} · {message.email}
                        </p>
                      </div>

                      <label className="flex shrink-0 items-center gap-2 text-[11px] text-gold-muted">
                        <span>Trạng thái</span>
                        <span className="relative">
                          <select
                            value={message.status}
                            onChange={(event) => updateStatus(message.id, event.target.value)}
                            disabled={updatingId === message.id}
                            className="appearance-none rounded-md border border-gold-ancient/35 bg-[#1C0504] py-2 pl-2.5 pr-7 text-xs text-gold-pale outline-none focus:border-gold-bright disabled:opacity-60"
                          >
                            {STATUS_OPTIONS.slice(1).map((option) => (
                              <option key={option.value} value={option.value} className="bg-lacquer-deep text-gold-pale">
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gold-muted" />
                        </span>
                      </label>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap break-words rounded-md border border-gold-ancient/15 bg-[#1C0504]/70 p-3 text-sm leading-relaxed text-paper-light/85">
                      {message.message}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-gold-muted/70">
                      <span>{formatDate(message.createdAt)}</span>
                      <span>Mã lời nhắn #{message.id}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}