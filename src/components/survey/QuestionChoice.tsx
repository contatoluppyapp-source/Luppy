"use client";

import { Check } from "lucide-react";

interface QuestionChoiceProps {
  options: string[];
  value: string | string[] | null;
  multi?: boolean;
  onChange: (value: string | string[]) => void;
}

export function QuestionChoice({
  options,
  value,
  multi = false,
  onChange,
}: QuestionChoiceProps) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  const handleClick = (option: string) => {
    if (multi) {
      const exists = selected.includes(option);
      const next = exists
        ? selected.filter((s) => s !== option)
        : [...selected, option];
      onChange(next);
    } else {
      onChange(option);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => handleClick(opt)}
            className={`w-full py-4 px-5 rounded-2xl text-left text-base font-medium transition-all duration-200 active:scale-[0.98] flex items-center justify-between gap-3 ${
              active
                ? "bg-brand text-white soft-shadow-pink"
                : "bg-white border border-border text-ink/80 hover:border-brand/40"
            }`}
          >
            <span className="flex-1">{opt}</span>
            {active && (
              <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                <Check size={14} strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
