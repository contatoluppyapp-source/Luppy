"use client";

interface QuestionScaleProps {
  value: number | null;
  onChange: (value: number) => void;
}

const LABELS = ["Muito ruim", "Ruim", "Ok", "Bom", "Excelente"];

export function QuestionScale({ value, onChange }: QuestionScaleProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`h-16 rounded-2xl text-lg font-bold transition-all duration-200 active:scale-95 ${
                active
                  ? "bg-brand text-white soft-shadow-pink"
                  : "bg-white border border-border text-ink/70 hover:border-brand/40"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-[11px] text-ink/40 px-1">
        <span>{LABELS[0]}</span>
        <span>{LABELS[4]}</span>
      </div>
    </div>
  );
}
