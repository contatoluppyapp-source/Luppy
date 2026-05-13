"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, ArrowLeft, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MOCK_NAIL_PREVIEWS } from "@/lib/mock-data";
import { NailPreview } from "@/types";
import { getPreviewStore } from "@/lib/preview-store";

function NailCard({ preview, index }: { preview: NailPreview; index: number }) {
  const [saved, setSaved] = useState(false);
  const [showBefore, setShowBefore] = useState(false);

  const hasBefore = !!preview.beforeImageUrl;
  const isShort = index % 3 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={`relative rounded-2xl overflow-hidden bg-surface ${isShort ? "row-span-1" : ""}`}
    >
      {/* Image container */}
      <div className={`relative w-full ${isShort ? "h-44" : "h-56"}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={showBefore ? "before" : "after"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            {/* Use plain <img> — next/image blocks large data: URLs */}
            <img
              src={showBefore && preview.beforeImageUrl ? preview.beforeImageUrl : preview.imageUrl}
              alt={preview.styleName}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Save button */}
        <button
          onClick={() => setSaved((s) => !s)}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            saved
              ? "bg-brand text-white shadow-md"
              : "bg-white/80 backdrop-blur-sm text-ink/40 hover:text-brand"
          }`}
        >
          <Heart size={14} fill={saved ? "currentColor" : "none"} />
        </button>

        {/* Before/After toggle */}
        {hasBefore && (
          <button
            onClick={() => setShowBefore((b) => !b)}
            className="absolute top-2.5 left-2.5 px-2 py-1 rounded-full bg-black/55 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1"
          >
            {showBefore ? <EyeOff size={11} /> : <Eye size={11} />}
            {showBefore ? "Antes" : "Depois"}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-xs font-semibold text-ink leading-tight">{preview.styleName}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <div
            className="w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: preview.colorHex }}
          />
          <p className="text-[10px] text-ink/50 truncate">{preview.colorTag}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [shared, setShared] = useState(false);
  const [previews, setPreviews] = useState<NailPreview[]>([]);

  useEffect(() => {
    // 1. Try in-memory store first (bypasses sessionStorage quota limits)
    const stored = getPreviewStore();
    console.log(
      `[results] getPreviewStore returned: ${stored ? stored.length : "null"} previews — ` +
      (stored ? stored.map((p, i) => `[${i}] id=${p.id} imageUrlLen=${p.imageUrl.length} isBase64=${p.imageUrl.startsWith("data:")}`).join(", ") : "empty")
    );

    if (stored && stored.length > 0) {
      console.log(`[results] using ${stored.length} previews from memory store`);
      setPreviews(stored);
      return;
    }

    // 2. Fallback: try sessionStorage (legacy / smaller images)
    const raw = sessionStorage.getItem("luppy_previews");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as NailPreview[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`[results] using ${parsed.length} previews from sessionStorage`);
          setPreviews(parsed);
          return;
        }
      } catch {
        console.warn("[results] sessionStorage parse failed");
      }
    }

    // 3. Last resort: show mocks with explicit log
    console.warn("[results] no previews in memory or sessionStorage — showing MOCK_NAIL_PREVIEWS");
    setPreviews(MOCK_NAIL_PREVIEWS);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Minhas inspirações de unhas — Luppy",
        text: "Olha os previews que eu criei no Luppy! 💅",
        url: window.location.href,
      });
    } else {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/home")}
              className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-ink/60 hover:bg-border transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-base font-bold text-ink">Suas inspirações</h1>
              <p className="text-xs text-ink/40">{previews.length} previews criados</p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-semibold text-ink/60 hover:border-brand hover:text-brand transition-colors"
          >
            <Share2 size={13} />
            {shared ? "Copiado!" : "Compartilhar"}
          </button>
        </div>
      </div>

      {/* AI badge */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-5 mt-4 mb-5 px-4 py-3 bg-brand-light rounded-2xl flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-brand">IA gerou para você</p>
          <p className="text-xs text-ink/50 font-light">
            Toque em &ldquo;Depois&rdquo; para comparar com a foto original
          </p>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {previews.map((preview, i) => (
          <NailCard key={preview.id} preview={preview} index={i} />
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="px-5 mt-8 flex flex-col gap-3"
      >
        <Button
          size="lg"
          fullWidth
          onClick={() => router.push("/ideas")}
          className="shadow-xl shadow-brand/25"
        >
          ✨ Testar outra
        </Button>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={() => router.push("/home")}
          className="text-ink/50 text-sm"
        >
          Voltar ao início
        </Button>
      </motion.div>
    </div>
  );
}
