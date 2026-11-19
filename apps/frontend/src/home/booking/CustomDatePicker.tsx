import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

type CustomDatePickerProps = {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string; // "YYYY-MM-DD"
  align?: "left" | "right";
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseYMD(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const d = Number(parts[2]);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return { year: y, month: m, day: d };
}

function formatDisplayDate(dateStr: string): string {
  const parsed = parseYMD(dateStr);
  if (!parsed) return "";
  const date = new Date(parsed.year, parsed.month, parsed.day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTodayYMD(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select date...",
  minDate,
  align = "left",
  fullWidth = true,
  required = false,
  disabled = false,
  className,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialParsed = parseYMD(value) || parseYMD(getTodayYMD())!;
  const [viewYear, setViewYear] = useState(initialParsed.year);
  const [viewMonth, setViewMonth] = useState(initialParsed.month);

  // Sync view when value changes and popup is opened
  useEffect(() => {
    if (value) {
      const parsed = parseYMD(value);
      if (parsed) {
        setViewYear(parsed.year);
        setViewMonth(parsed.month);
      }
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (y: number, m: number, d: number) => {
    const formatted = `${y}-${pad(m + 1)}-${pad(d)}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = getTodayYMD();
    onChange(today);
    const parsed = parseYMD(today)!;
    setViewYear(parsed.year);
    setViewMonth(parsed.month);
    setIsOpen(false);
  };

  // Generate calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  // Monday start offset: Sun(0) -> 6, Mon(1) -> 0, etc.
  const startOffset = (firstDayOfWeek + 6) % 7;

  const prevMonthDaysCount = new Date(viewYear, viewMonth, 0).getDate();

  const cells: Array<{
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
    dateString: string;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
  }> = [];

  const todayStr = getTodayYMD();

  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthDaysCount - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dateStr = `${y}-${pad(m + 1)}-${pad(d)}`;
    cells.push({
      day: d,
      month: m,
      year: y,
      isCurrentMonth: false,
      dateString: dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === value,
      isDisabled: Boolean(minDate && dateStr < minDate),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
    cells.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
      dateString: dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === value,
      isDisabled: Boolean(minDate && dateStr < minDate),
    });
  }

  // Next month leading days to complete grid (up to 35 or 42 cells)
  const remainingCells = (cells.length <= 35 ? 35 : 42) - cells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    const dateStr = `${y}-${pad(m + 1)}-${pad(d)}`;
    cells.push({
      day: d,
      month: m,
      year: y,
      isCurrentMonth: false,
      dateString: dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === value,
      isDisabled: Boolean(minDate && dateStr < minDate),
    });
  }

  return (
    <div
      ref={containerRef}
      className={`relative text-left ${fullWidth ? "w-full" : "inline-block"} ${className || ""}`}
    >
      {/* Hidden input for HTML form validation if required */}
      {required && (
        <input
          tabIndex={-1}
          type="text"
          value={value}
          required={required}
          onChange={() => {}}
          className="pointer-events-none absolute bottom-0 left-1/2 h-0 w-0 opacity-0"
        />
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`group flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 py-2 text-xs transition-all shadow-2xs ${
          isOpen
            ? "border-blue-600 ring-3 ring-blue-100"
            : "border-slate-200 hover:border-blue-400"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon
            size={14}
            className={`shrink-0 transition-colors ${
              isOpen ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"
            }`}
          />
          <span
            className={`font-semibold truncate ${
              value ? "text-slate-800" : "text-slate-400 font-normal"
            }`}
          >
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              title="Clear date"
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={13} />
            </span>
          )}
        </div>
      </button>

      {/* Custom Calendar Dropdown Popup */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Calendar date picker"
          className={`absolute ${
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          } z-50 mt-1.5 w-[280px] rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xl shadow-slate-900/15 ring-1 ring-black/5 animate-in fade-in zoom-in-95`}
        >
          {/* Header Month / Year & Navigation */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous month"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-bold text-slate-800">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Next month"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels (Starts Monday) */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEK_DAYS.map((dayName) => (
              <span
                key={dayName}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-0.5"
              >
                {dayName}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {cells.map((cell) => {
              const { day, month, year, isCurrentMonth, isSelected, isToday, isDisabled } = cell;

              return (
                <button
                  key={`${year}-${month}-${day}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && handleSelectDate(year, month, day)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-lg text-xs transition-all mx-auto ${
                    isDisabled
                      ? "cursor-not-allowed opacity-25 text-slate-400"
                      : isSelected
                      ? "bg-blue-600 font-bold text-white shadow-sm hover:bg-blue-700"
                      : isCurrentMonth
                      ? "font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                      : "text-slate-300 hover:bg-slate-50 hover:text-slate-500"
                  }`}
                >
                  <span>{day}</span>
                  {/* Subtle Today dot if not selected */}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer with Clear & Today buttons */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-100 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
