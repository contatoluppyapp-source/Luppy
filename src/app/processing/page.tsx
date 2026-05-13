"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { generateNailPreviews, transcribeAudio } from "@/lib/ai";
import { setPreviewStore } from "@/lib/preview-store";

const MESSAGES = [
  "Analisando seu estilo...",
  "Criando combinações perfeitas...",
  "Aplicando as unhas na sua mão...",
  "Finalizando os detalhes...",
];

export default function ProcessingPage() {
  const router = useRouter();
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const handImageUrl = sessionStorage.getItem("luppy_hand_image") ?? "";
    const inputType = (sessionStorage.getItem("luppy_input_type") ?? "text") as "text" | "audio" | "image";
    let textPrompt = sessionStorage.getItem("luppy_text_prompt") ?? "";
    const referenceImageUrl = sessionStorage.getItem("luppy_reference_image");

    console.log(
      `[processing] starting — handImageUrlLen=${handImageUrl.length} inputType=${inputType} textPrompt="${textPrompt.slice(0, 60)}" hasReference=${!!referenceImageUrl}`
    );

    let cancelled = false;
    const startedAt = Date.now();

    (async () => {
      // Transcribe audio before generating previews
      if (inputType === "audio") {
        const audioDataUrl = sessionStorage.getItem("luppy_audio_data");
        const audioMime = sessionStorage.getItem("luppy_audio_mime") ?? "audio/webm";
        console.log(`[processing] AUDIO MODE — audioDataUrlLen=${audioDataUrl?.length ?? 0} mime=${audioMime}`);

        if (audioDataUrl) {
          try {
            console.log("[AUDIO] transcribing audio...");
            textPrompt = await transcribeAudio(audioDataUrl, audioMime);
            console.log(`[AUDIO] transcription result: "${textPrompt}"`);
          } catch (err) {
            console.error("[AUDIO] transcription failed:", err);
            if (!cancelled) {
              alert("Não conseguimos entender o áudio. Tente novamente ou use texto.");
              router.push("/input");
            }
            return;
          }
        } else {
          console.warn("[processing] audio inputType but no luppy_audio_data in sessionStorage");
        }
      }

      const previews = await generateNailPreviews({
        handImageUrl,
        inputType,
        textPrompt,
        referenceImageUrl: referenceImageUrl || null,
      });

      if (cancelled) return;

      console.log(
        `[processing] received ${previews.length} previews — ` +
        previews.map((p, i) =>
          `[${i}] id=${p.id} imageUrlLen=${p.imageUrl.length} isBase64=${p.imageUrl.startsWith("data:")}`
        ).join(", ")
      );

      // Persiste em memória (evita o limite de 5MB do sessionStorage).
      setPreviewStore(previews);
      console.log("[processing] setPreviewStore done");

      // Tenta também no sessionStorage para consistência; falha silenciosamente se quota exceder.
      try {
        // Não serializa imagens base64 — só os metadados + uma flag indicando que há dados na memória
        const meta = previews.map((p) => ({
          id: p.id,
          styleName: p.styleName,
          colorTag: p.colorTag,
          colorHex: p.colorHex,
          hasRealImage: p.imageUrl.startsWith("data:"),
          imageUrlLen: p.imageUrl.length,
        }));
        sessionStorage.setItem("luppy_previews_meta", JSON.stringify(meta));
        console.log("[processing] sessionStorage meta saved");
      } catch {
        console.warn("[processing] sessionStorage meta save failed (quota?)");
      }

      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, 2000 - elapsed);
      setTimeout(() => {
        if (!cancelled) router.push("/results");
      }, wait);
    })();

    const msgInterval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 1100);

    return () => {
      cancelled = true;
      clearInterval(msgInterval);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[420px] h-[420px] rounded-full bg-brand/20 blur-3xl"
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-brand/10 blur-3xl pointer-events-none" />

      {/* Rings */}
      <div className="relative flex items-center justify-center mb-12">
        <motion.div
          className="absolute w-72 h-72 rounded-full border border-brand/20"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-52 h-52 rounded-full border border-brand/35"
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0.25, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.div
          className="absolute w-36 h-36 rounded-full border border-brand/55"
          animate={{ scale: [1, 1.15, 1], opacity: [0.9, 0.4, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
        <motion.div
          className="relative w-20 h-20 rounded-full bg-brand flex items-center justify-center"
          animate={{
            boxShadow: [
              "0 0 0 0px rgba(255, 120, 203, 0.5)",
              "0 0 0 24px rgba(255, 120, 203, 0)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        >
          <motion.svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <path
              d="M18 4L19.8 14.2L30 16L19.8 17.8L18 28L16.2 17.8L6 16L16.2 14.2L18 4Z"
              fill="white"
              fillOpacity="0.92"
            />
          </motion.svg>
        </motion.div>
      </div>

      {/* Text */}
      <div className="text-center relative z-10">
        <h1 className="text-2xl font-bold text-ink mb-3">
          Criando suas{" "}
          <span className="text-brand">inspirações...</span>
        </h1>

        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-ink/50 font-light h-5"
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-1.5 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-brand"
              animate={{ scale: [1, 1.6, 1], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
