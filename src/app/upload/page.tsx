"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceName, setReferenceName] = useState<string | null>(null);

  useEffect(() => {
    const ref = sessionStorage.getItem("luppy_reference_image");
    const name = sessionStorage.getItem("luppy_reference_idea_name");
    if (ref) setReferenceImage(ref);
    if (name) setReferenceName(name);
  }, []);

  const clearReference = () => {
    sessionStorage.removeItem("luppy_reference_image");
    sessionStorage.removeItem("luppy_reference_idea_name");
    setReferenceImage(null);
    setReferenceName(null);
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    // Redimensiona para no máximo 768px no maior lado antes de salvar.
    // Reduz tokens de input no Gemini (custo) e evita quota do sessionStorage.
    // Mantém JPEG q=0.85 — boa qualidade visual com payload pequeno.
    const MAX_DIMENSION = 768;
    const JPEG_QUALITY = 0.85;

    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { width: srcW, height: srcH } = img;
      const scale = Math.min(1, MAX_DIMENSION / Math.max(srcW, srcH));
      const dstW = Math.round(srcW * scale);
      const dstH = Math.round(srcH * scale);

      const canvas = document.createElement("canvas");
      canvas.width = dstW;
      canvas.height = dstH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("[upload] canvas 2d context unavailable");
        return;
      }
      ctx.drawImage(img, 0, 0, dstW, dstH);
      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

      console.log(
        `[upload] resized — src=${srcW}x${srcH} dst=${dstW}x${dstH} ` +
        `scale=${scale.toFixed(3)} dataUrlLen=${dataUrl.length}`
      );

      setPreview(dataUrl);
      try {
        sessionStorage.setItem("luppy_hand_image", dataUrl);
      } catch (err) {
        console.error("[upload] sessionStorage quota exceeded:", err);
        alert("Imagem muito grande. Tente uma foto menor.");
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      console.error("[upload] failed to decode image");
      alert("Não foi possível ler a imagem. Tente outra foto.");
    };
    img.src = objectUrl;
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    sessionStorage.removeItem("luppy_hand_image");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex flex-col px-5 py-6 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-ink/60 hover:bg-border transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-xs text-ink/40 font-medium uppercase tracking-widest">
            {referenceImage ? "Etapa 1 de 2" : "Etapa 1 de 3"}
          </p>
          <h1 className="text-lg font-bold text-ink">Foto da sua mão</h1>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-6">
        {(referenceImage ? [0, 1] : [0, 1, 2]).map((i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${i === 0 ? "w-8 bg-brand" : "w-4 bg-border"}`}
          />
        ))}
      </div>

      {/* Pílula de referência escolhida na galeria */}
      {referenceImage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 px-3 py-2.5 bg-brand-light rounded-2xl"
        >
          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            <Image src={referenceImage} alt={referenceName ?? "Referência"} fill className="object-cover" unoptimized />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-brand flex items-center gap-1">
              <Sparkles size={12} /> Estilo escolhido
            </p>
            <p className="text-xs text-ink/60 truncate">{referenceName ?? "Referência da galeria"}</p>
          </div>
          <button
            onClick={clearReference}
            className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-ink/50 hover:text-brand transition-colors"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* Upload area */}
      <div className="flex-1 flex flex-col gap-5">
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className={`relative flex-1 min-h-72 rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-4 ${
                dragging
                  ? "border-brand bg-brand-light scale-[1.02]"
                  : "border-border bg-surface hover:border-brand hover:bg-brand-light"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-border flex items-center justify-center shadow-sm">
                <Camera size={28} className="text-brand" />
              </div>
              <div className="text-center px-6">
                <p className="font-semibold text-ink text-base">Adicione a foto da sua mão</p>
                <p className="text-sm text-ink/50 mt-1">Toque para abrir a câmera ou galeria</p>
                <p className="text-xs text-ink/30 mt-3 flex items-center justify-center gap-1.5">
                  <Upload size={12} /> Ou arraste e solte aqui
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onFileChange}
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="relative flex-1 min-h-72 rounded-3xl overflow-hidden bg-surface"
            >
              <Image
                src={preview}
                alt="Sua mão"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <button
                onClick={clearImage}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                  ✓ Foto selecionada
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        {!preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-brand-light rounded-2xl p-4"
          >
            <p className="text-xs font-semibold text-brand mb-2">💡 Dicas para melhores resultados</p>
            <ul className="space-y-1">
              {[
                "Mão espalmada, palma para baixo",
                "Boa iluminação natural",
                "Unhas visíveis e em foco",
              ].map((tip) => (
                <li key={tip} className="text-xs text-ink/60 flex gap-2">
                  <span className="text-brand">•</span> {tip}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-6">
        <Button
          size="lg"
          fullWidth
          disabled={!preview}
          onClick={() => router.push(referenceImage ? "/processing" : "/input")}
          className={`${!preview ? "opacity-40" : "shadow-xl shadow-brand/25"}`}
        >
          {referenceImage ? "Gerar preview" : "Continuar"} <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
