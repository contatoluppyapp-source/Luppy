"use client";

import { useRouter } from "next/navigation";
import { SurveyShell } from "@/components/survey/SurveyShell";
import { B2C_SURVEY, SurveyAnswers } from "@/lib/survey-config";
import { getSessionId, getDeviceInfo } from "@/lib/session-id";

export default function FeedbackPage() {
  const router = useRouter();

  const handleSubmit = async (answers: SurveyAnswers) => {
    const res = await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userType: "b2c",
        answers,
        sessionId: getSessionId(),
        device: getDeviceInfo(),
      }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? "Erro ao enviar respostas");
    }
  };

  return (
    <SurveyShell
      questions={B2C_SURVEY}
      userType="b2c"
      onSubmit={handleSubmit}
      onComplete={() => router.push("/ideas")}
      finalTitle="✨ Você acabou de entrar para as primeiras usuárias da Luppy"
      finalCtaLabel="Voltar para inspirações"
      finalCtaHref="/ideas"
    />
  );
}
