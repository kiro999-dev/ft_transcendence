import { useState, useRef, useEffect, type ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";

export type CustomSelectOption<T extends string | number = string> = {
  value: T;
  label: string;
  dotColor?: string;
  sublabel?: string;
};

type CustomSelectProps<T extends string | number = string> = {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  prefix?: string;
  icon?: ReactNode;
  align?: "left" | "right";
  fullWidth?: boolean;
  buttonClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
};

export function CustomSelect<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = "Select...",
  prefix,
  icon,
  align = "left",
  fullWidth = false,
  buttonClassName,
  dropdownClassName,
  disabled = false,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const defaultButtonClass = fullWidth
    ? "flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-700 shadow-2xs transition hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
    : "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-100/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";

  const defaultDropdownClass = fullWidth
    ? "absolute left-0 z-50 mt-1.5 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl shadow-slate-900/10 focus:outline-none"
    : `absolute ${
        align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
      } z-50 mt-1.5 min-w-[170px] max-h-60 overflow-y-auto rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl shadow-slate-900/10 focus:outline-none`;

  return (
    <div
      ref={dropdownRef}
      className={`relative text-left ${fullWidth ? "w-full" : "inline-block"}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={buttonClassName || defaultButtonClass}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {icon}
          {prefix && <span className="font-medium text-slate-500">{prefix}</span>}
          {selectedOption?.dotColor && (
            <span className={`h-2 w-2 shrink-0 rounded-full ${selectedOption.dotColor}`} />
          )}
          <span className={`truncate ${selectedOption ? "text-slate-800" : "text-slate-400"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={dropdownClassName || defaultDropdownClass}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 text-center">
              No options available
            </div>
          ) : (
            <div className="space-y-0.5">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                      isSelected
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : "font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {opt.dotColor && (
                        <span className={`h-2 w-2 shrink-0 rounded-full ${opt.dotColor}`} />
                      )}
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="truncate text-[11px] text-slate-400">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={14} className="shrink-0 text-blue-600 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
