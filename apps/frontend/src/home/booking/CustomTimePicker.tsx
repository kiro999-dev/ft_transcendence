import { useState, useRef, useEffect } from "react";
import { Clock3, Check, X } from "lucide-react";

type CustomTimePickerProps = {
  value: string; // "HH:MM" e.g. "09:00" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  stepMinutes?: number; // default 30
  align?: "left" | "right";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
};

function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return timeStr;

  const period = h >= 12 ? "PM" : "AM";
  const displayHours = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayHours).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

export function CustomTimePicker({
  value,
  onChange,
  placeholder = "--:--",
  stepMinutes = 30,
  align = "left",
  fullWidth = true,
  disabled = false,
  className,
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate options list
  const options: Array<{ value: string; label: string }> = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const val = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    options.push({
      value: val,
      label: formatTimeDisplay(val),
    });
  }

  // If the current value is not in standard step options (e.g. 09:15 when step is 30), include it
  if (value && !options.some((o) => o.value === value)) {
    options.push({
      value,
      label: formatTimeDisplay(value),
    });
    options.sort((a, b) => a.value.localeCompare(b.value));
  }

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

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative text-left ${fullWidth ? "w-full" : "inline-block"} ${className || ""}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 py-2 text-xs transition-all shadow-2xs ${
          isOpen
            ? "border-blue-600 ring-3 ring-blue-100"
            : "border-slate-200 hover:border-blue-400"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Clock3
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
            {value ? formatTimeDisplay(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              title="Clear time"
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={13} />
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute ${
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          } z-50 mt-1.5 w-44 max-h-56 overflow-y-auto rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-2xl shadow-slate-900/15 ring-1 ring-black/5 animate-in fade-in zoom-in-95`}
        >
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                    isSelected
                      ? "bg-blue-50 font-bold text-blue-700"
                      : "font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check size={14} className="shrink-0 text-blue-600 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
