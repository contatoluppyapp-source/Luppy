"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import {
  SurveyAnswers,
  SurveyQuestion,
} from "@/lib/survey-config";
import { QuestionScale } from "./QuestionScale";
import { QuestionChoice } from "./QuestionChoice";
import { QuestionOpen } from "./QuestionOpen";

interface SurveyShellProps {
  questions: SurveyQuestion[];
  userType: "b2c" | "b2b";
  onSubmit: (answers: SurveyAnswers) => Promise<void>;
  onComplete: () => void;
  finalTitle: string;
  finalCtaLabel: string;
  finalCtaHref: string;
}

export function SurveyShell({
  questions,
  onSubmit,
  onComplete,
  finalTitle,
  finalCtaLabel,
}: SurveyShellProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = questions.length;
  const current = questions[index];
  const progress = ((index + (done ? 1 : 0)) / total) * 100;

  const currentValue = useMemo(() => {
    return answers[current?.id] ?? null;
  }, [answers, current]);

  const isAnswered = useMemo(() => {
    if (!current) return false;
    const v = currentValue;
    if (current.type === "multi") {
      return Array.isArray(v) && v.length > 0;
    }
    if (current.type === "open") {
      return typeof v === "string" && v.trim().length > 0;
    }
    return v !== null && v !== undefined && v !== "";
  }, [current, currentValue]);

  const updateAnswer = (val: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [current.id]: val }));
  };

  const goBack = () => {
    if (index > 0) setIndex(index - 1);
  };

  const goNext = async () => {
    if (!isAnswered) return;
    if (index < total - 1) {
      setIndex(index + 1);
      return;
    }
    // Submit
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(answers);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 gradient-soft">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md flex flex-col items-center text-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center text-3xl">
            ✨
          </div>
          <h2 className="text-2xl font-bold text-ink leading-tight text-balance">
            {finalTitle}
          </h2>
          <p className="text-sm text-ink/50 leading-relaxed">
            Suas respostas vão ajudar a construir a Luppy.
          </p>
          <button
            onClick={onComplete}
            className="w-full py-4 rounded-full bg-brand text-white text-base font-semibold soft-shadow-pink active:scale-95 transition-transform mt-2"
          >
            {finalCtaLabel}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream safe-top safe-bottom">
      {/* Progress bar */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={goBack}
            disabled={index === 0}
            className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-ink/60 disabled:opacity-30 active:scale-95 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-xs font-medium text-ink/50">
            {index + 1} de {total}
          </span>
        </div>
        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col px-5 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-2xl font-bold text-ink leading-tight mb-2 text-balance">
              {current.text}
            </h2>
            {current.type === "multi" && (
              <p className="text-xs text-ink/40 mb-5">Selecione todas que se aplicam</p>
            )}
            {current.type !== "multi" && <div className="h-5" />}

            <div className="flex-1">
              {current.type === "scale" && (
                <QuestionScale
                  value={typeof currentValue === "number" ? currentValue : null}
                  onChange={(v) => updateAnswer(v)}
                />
              )}
              {(current.type === "choice" || current.type === "multi") && (
                <QuestionChoice
                  options={current.options ?? []}
                  multi={current.type === "multi"}
                  value={
                    typeof currentValue === "string" || Array.isArray(currentValue)
                      ? currentValue
                      : null
                  }
                  onChange={(v) => updateAnswer(v)}
                />
              )}
              {current.type === "open" && (
                <QuestionOpen
                  value={typeof currentValue === "string" ? currentValue : ""}
                  onChange={(v) => updateAnswer(v)}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* CTA fixo no rodapé */}
        <div className="pt-6">
          {error && (
            <p className="text-xs text-red-500 mb-3 text-center">{error}</p>
          )}
          <button
            onClick={goNext}
            disabled={!isAnswered || submitting}
            className="w-full py-4 rounded-full bg-brand text-white text-base font-semibold soft-shadow-pink active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enviando...
              </>
            ) : index < total - 1 ? (
              <>
                Avançar
                <ArrowRight size={18} />
              </>
            ) : (
              "Concluir"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
