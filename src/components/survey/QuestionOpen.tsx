"use client";

interface QuestionOpenProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function QuestionOpen({
  value,
  onChange,
  placeholder = "Escreva o que vier à cabeça...",
}: QuestionOpenProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={6}
      className="w-full p-4 rounded-2xl bg-white border border-border text-base text-ink placeholder:text-ink/30 focus:outline-none focus:border-brand transition-colors resize-none"
    />
  );
}
