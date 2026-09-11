import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check, Sparkles } from 'lucide-react';
import { getCanChiAndMenh, parseBirthDate } from '../../utils/horoscope';

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export default function TempleDatePicker({ value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current value or fallback to reasonable default (e.g. 1996)
  const parsed = parseBirthDate(value);
  const initialYear = parsed?.year || 1996;
  const initialMonth = (parsed?.month || 8) - 1; // 0-indexed
  const initialDay = parsed?.day || 15;

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState(parsed?.day ? initialDay : null);

  // Sync internal view when value changes from outside
  useEffect(() => {
    if (parsed?.year) {
      setViewYear(parsed.year);
      if (parsed.month) setViewMonth(parsed.month - 1);
      if (parsed.day) setSelectedDay(parsed.day);
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Generate days for the grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday

  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const prevDays = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevDays.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }

  const currentDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentDays.push({ day: i, isCurrentMonth: true });
  }

  const nextDays = [];
  const totalSlots = prevDays.length + currentDays.length;
  const remaining = (7 - (totalSlots % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    nextDays.push({ day: i, isCurrentMonth: false });
  }

  const allDays = [...prevDays, ...currentDays, ...nextDays];

  // Preview horoscope for currently selected in picker
  const previewDateStr = selectedDay 
    ? `${String(selectedDay).padStart(2, '0')}/${String(viewMonth + 1).padStart(2, '0')}/${viewYear}`
    : `${viewYear}`;
  const previewHoro = getCanChiAndMenh(previewDateStr);

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    const dStr = String(day).padStart(2, '0');
    const mStr = String(viewMonth + 1).padStart(2, '0');
    onChange(`${dStr}/${mStr}/${viewYear}`);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Generate Year options (1940 to 2025)
  const yearOptions = [];
  for (let y = 2025; y >= 1940; y--) {
    yearOptions.push(y);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field with Calendar Trigger */}
      <div className="relative flex items-center group">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="15/08/1996 hoặc 1996"
          maxLength={10}
          disabled={disabled}
          className="w-full bg-gradient-to-b from-[#130302] to-[#1A0504] border border-gold-ancient/35 focus:border-gold-bright group-hover:border-gold-ancient/60 rounded px-3 py-2 pr-9 text-sm text-paper-light placeholder-gold-muted/40 focus:outline-none focus:ring-1 focus:ring-gold-bright/50 transition font-sans shadow-inner"
        />

        {/* Golden Calendar Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          title="Mở lịch hoàng đạo chọn ngày sinh"
          className={`absolute right-1.5 p-1 rounded transition flex items-center justify-center ${
            isOpen
              ? 'text-gold-bright bg-temple-seal/60 border border-gold-bright/50 shadow-sm'
              : 'text-gold-ancient hover:text-gold-bright hover:bg-gold-bright/15'
          }`}
        >
          <CalendarIcon size={15} />
        </button>
      </div>

      {/* Exquisite Temple Lacquer Calendar Popup */}
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 z-50 w-72 sm:w-80 bg-gradient-to-b from-[#220705] via-[#170403] to-[#0E0202] border-2 border-gold-ancient/80 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-3.5 text-paper-light animate-fadeIn origin-top-right border-double"
          style={{
            boxShadow: '0 15px 40px rgba(0,0,0,0.9), inset 0 0 15px rgba(201,162,74,0.1)'
          }}
        >
          {/* Header Title with Corner Knots */}
          <div className="flex items-center justify-between border-b border-gold-ancient/30 pb-2.5 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-gold-bright" />
              <span className="font-serif font-bold text-xs text-gold-bright uppercase tracking-wider">
                Lịch Hoàng Đạo • Khởi Tuổi
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-gold-pale/60 hover:text-gold-bright hover:bg-white/10 transition"
            >
              <X size={13} />
            </button>
          </div>

          {/* Month & Year Selectors Bar */}
          <div className="flex items-center justify-between gap-1.5 mb-3 bg-[#110302] p-1.5 rounded border border-gold-ancient/25">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded text-gold-ancient hover:text-gold-bright hover:bg-temple-red/40 transition"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Month Select */}
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
              className="bg-[#1C0605] border border-gold-ancient/40 text-gold-bright font-serif text-xs rounded px-2 py-1 focus:outline-none focus:border-gold-bright cursor-pointer"
            >
              {MONTHS.map((m, idx) => (
                <option key={idx} value={idx} className="bg-[#1C0605] text-gold-pale">
                  {m}
                </option>
              ))}
            </select>

            {/* Year Select (Quick access from 1940 to 2025) */}
            <select
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
              className="bg-[#1C0605] border border-gold-ancient/40 text-gold-bright font-serif text-xs rounded px-2 py-1 focus:outline-none focus:border-gold-bright cursor-pointer font-bold"
            >
              {yearOptions.map(y => (
                <option key={y} value={y} className="bg-[#1C0605] text-gold-pale">
                  Năm {y}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded text-gold-ancient hover:text-gold-bright hover:bg-temple-red/40 transition"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-serif font-bold text-gold-ancient/90 mb-1 border-b border-gold-ancient/15 pb-1">
            {DAYS_OF_WEEK.map((d, idx) => (
              <span key={idx} className={idx === 0 ? 'text-red-400' : ''}>
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {allDays.map((item, idx) => {
              const isSelected = item.isCurrentMonth && selectedDay === item.day;
              return (
                <button
                  type="button"
                  key={idx}
                  disabled={!item.isCurrentMonth}
                  onClick={() => handleSelectDay(item.day)}
                  className={`h-7 rounded flex items-center justify-center font-sans text-xs transition ${
                    !item.isCurrentMonth
                      ? 'text-paper-light/15 cursor-default'
                      : isSelected
                      ? 'bg-gradient-to-br from-temple-seal via-[#B82B2B] to-[#7D1B1B] text-gold-bright font-bold border border-gold-bright shadow-[0_0_8px_rgba(234,179,8,0.5)]'
                      : 'text-gold-pale hover:bg-temple-red/40 hover:text-gold-bright hover:border hover:border-gold-bright/30'
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Real-time Horoscope Preview inside the picker */}
          {previewHoro && (
            <div className="mt-3 pt-2.5 border-t border-gold-ancient/20 flex items-center justify-between text-[11px] font-serif">
              <div className="text-gold-pale/90 min-w-0">
                <span>Tuổi <strong>{previewHoro.canChi}</strong></span>
                <span className="text-gold-muted mx-1">•</span>
                <span className="text-gold-bright">Mệnh {previewHoro.menh}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (selectedDay) {
                    handleSelectDay(selectedDay);
                  } else {
                    onChange(`${viewYear}`);
                    setIsOpen(false);
                  }
                }}
                className="px-2.5 py-1 rounded bg-temple-seal text-gold-bright font-serif text-[11px] font-bold hover:brightness-125 transition flex items-center gap-1 shrink-0 ml-1.5 border border-gold-bright/40"
              >
                <Check size={11} />
                <span>Chọn</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
