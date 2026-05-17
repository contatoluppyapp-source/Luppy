"use client";

import { useRouter } from "next/navigation";
import { SurveyShell } from "@/components/survey/SurveyShell";
import { B2B_SURVEY, SurveyAnswers } from "@/lib/survey-config";
import { getSessionId, getDeviceInfo } from "@/lib/session-id";

export default function DesignerPage() {
  const router = useRouter();

  const handleSubmit = async (answers: SurveyAnswers) => {
    const res = await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userType: "b2b",
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
      questions={B2B_SURVEY}
      userType="b2b"
      onSubmit={handleSubmit}
      onComplete={() => router.push("/ideas")}
      finalTitle="💅 Você entrou para as primeiras profissionais da Luppy"
      finalCtaLabel="Conhecer o app"
      finalCtaHref="/ideas"
    />
  );
}
