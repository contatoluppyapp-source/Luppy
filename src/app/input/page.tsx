"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Type, Mic, MicOff, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InputTab } from "@/types";
import Image from "next/image";

const TABS: { id: InputTab; label: string; icon: React.ReactNode }[] = [
  { id: "text", label: "Texto", icon: <Type size={16} /> },
  { id: "audio", label: "Áudio", icon: <Mic size={16} /> },
  { id: "image", label: "Imagem", icon: <ImagePlus size={16} /> },
];

export default function InputPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InputTab>("text");
  const [textValue, setTextValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDone, setRecordingDone] = useState(false);
  const [refImage, setRefImage] = useState<string | null>(null);
  const refInputRef = useRef<HTMLInputElement>(null);
  const recordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const hasInput =
    (activeTab === "text" && textValue.trim().length > 0) ||
    (activeTab === "audio" && recordingDone) ||
    (activeTab === "image" && refImage !== null);

  const handleRecord = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      if (recordTimerRef.current) clearTimeout(recordTimerRef.current);
    } else {
      // Start recording
      audioChunksRef.current = [];
      setRecordingDone(false);

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.error("[audio] microphone access denied:", err);
        alert("Acesso ao microfone negado. Verifique as permissões do navegador.");
        return;
      }

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log(`[audio] recording stopped — size=${blob.size} type=${blob.type}`);

        // Convert blob to base64 and save to sessionStorage
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          try {
            sessionStorage.setItem("luppy_audio_data", dataUrl);
            sessionStorage.setItem("luppy_audio_mime", blob.type);
            console.log(`[audio] saved to sessionStorage — dataUrlLen=${dataUrl.length}`);
          } catch (err) {
            console.error("[audio] sessionStorage save failed:", err);
          }
          setIsRecording(false);
          setRecordingDone(true);
        };
        reader.onerror = () => {
          console.error("[audio] FileReader failed:", reader.error);
          setIsRecording(false);
          setRecordingDone(true);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setIsRecording(true);

      // Auto-stop after 30s
      recordTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, 30000);
    }
  };

  const handleRefImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setRefImage(URL.createObjectURL(file));
  };

  const handleContinue = () => {
    sessionStorage.setItem("luppy_input_type", activeTab);
    sessionStorage.setItem("luppy_text_prompt", textValue);
    router.push("/processing");
  };

  return (
    <div className="min-h-screen flex flex-col px-5 py-6 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-ink/60 hover:bg-border transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-xs text-ink/40 font-medium uppercase tracking-widest">Etapa 2 de 3</p>
          <h1 className="text-lg font-bold text-ink">O que você deseja?</h1>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${i <= 1 ? "w-8 bg-brand" : "w-4 bg-border"}`}
          />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-surface rounded-2xl p-1 gap-1 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-brand text-white shadow-md shadow-brand/25"
                : "text-ink/50 hover:text-ink/80"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === "text" && (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              <p className="text-sm text-ink/50">
                Descreva o estilo, cor ou inspiração que você quer
              </p>
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Ex: Quero unhas com glitter rosa, curtas, estilo francês moderno com detalhes dourados..."
                rows={6}
                className="w-full rounded-2xl border border-border bg-surface p-4 text-sm text-ink placeholder-ink/30 resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-ink/30">{textValue.length} caracteres</p>
                {textValue.length === 0 && (
                  <div className="flex gap-2 flex-wrap justify-end">
                    {["Nude glamour", "Francesa moderna", "Dark & bold"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setTextValue(s)}
                        className="px-3 py-1 rounded-full border border-border text-xs text-ink/60 hover:border-brand hover:text-brand transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "audio" && (
            <motion.div
              key="audio"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-6 pt-8"
            >
              <p className="text-sm text-ink/50 text-center max-w-xs">
                Grave uma mensagem descrevendo o estilo de unhas que você deseja
              </p>

              {/* Record button */}
              <div className="relative">
                {isRecording && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-brand/20"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <button
                  onClick={handleRecord}
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isRecording
                      ? "bg-brand shadow-xl shadow-brand/40 scale-110"
                      : recordingDone
                      ? "bg-green-500 shadow-xl shadow-green-500/30"
                      : "bg-surface border-2 border-border hover:border-brand"
                  }`}
                >
                  {isRecording ? (
                    <MicOff size={32} className="text-white" />
                  ) : (
                    <Mic size={32} className={recordingDone ? "text-white" : "text-brand"} />
                  )}
                </button>
              </div>

              <p className="text-sm font-medium text-ink/60">
                {isRecording
                  ? "Gravando... toque para parar"
                  : recordingDone
                  ? "✓ Áudio gravado"
                  : "Toque para gravar"}
              </p>

              {recordingDone && (
                <button
                  onClick={() => { setRecordingDone(false); setIsRecording(false); }}
                  className="text-xs text-ink/40 underline hover:text-brand transition-colors"
                >
                  Gravar novamente
                </button>
              )}
            </motion.div>
          )}

          {activeTab === "image" && (
            <motion.div
              key="image"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <p className="text-sm text-ink/50">
                Envie uma foto de inspiração — pode ser de outra nail art que você curtiu
              </p>

              {!refImage ? (
                <button
                  onClick={() => refInputRef.current?.click()}
                  className="flex-1 min-h-56 rounded-3xl border-2 border-dashed border-border bg-surface hover:border-brand hover:bg-brand-light transition-all flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center">
                    <ImagePlus size={24} className="text-brand" />
                  </div>
                  <p className="text-sm font-semibold text-ink/60">Adicionar imagem de referência</p>
                  <p className="text-xs text-ink/30">JPG, PNG ou WEBP</p>
                </button>
              ) : (
                <div className="relative min-h-56 rounded-3xl overflow-hidden">
                  <Image src={refImage} alt="Referência" fill className="object-cover" unoptimized />
                  <button
                    onClick={() => { setRefImage(null); if (refInputRef.current) refInputRef.current.value = ""; }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <input ref={refInputRef} type="file" accept="image/*" className="hidden" onChange={handleRefImage} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="mt-6">
        <Button
          size="lg"
          fullWidth
          disabled={!hasInput}
          onClick={handleContinue}
          className={!hasInput ? "opacity-40" : "shadow-xl shadow-brand/25"}
        >
          Criar previews <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
