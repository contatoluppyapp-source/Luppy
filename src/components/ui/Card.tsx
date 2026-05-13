import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = "", padding = true }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-border ${padding ? "p-4" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
