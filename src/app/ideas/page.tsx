"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { IDEAS } from "@/lib/ideas-data";
import { Idea } from "@/types";

const HEIGHTS = ["h-52", "h-72", "h-60", "h-64", "h-56", "h-72"];

// Skeleton rosa elegante exibido enquanto a imagem carrega ou quando falha.
// Usado em vez do ícone padrão de imagem quebrada.
function IdeaImageSkeleton({ colorHex }: { colorHex: string }) {
  return (
    <div
      className="absolute inset-0 animate-pulse"
      style={{
        background: `linear-gradient(135deg, ${colorHex}30 0%, #ffeaf6 50%, ${colorHex}25 100%)`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles size={24} className="text-brand/40" />
      </div>
    </div>
  );
}

function IdeaImage({ idea }: { idea: Idea }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <IdeaImageSkeleton colorHex={idea.colorHex} />;
  }

  return (
    <>
      {!loaded && <IdeaImageSkeleton colorHex={idea.colorHex} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={idea.imageUrl}
        alt={idea.styleName}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.04] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

function IdeaCard({ idea, index, onPick }: { idea: Idea; index: number; onPick: (i: Idea) => void }) {
  const height = HEIGHTS[index % HEIGHTS.length];

  return (
    <motion.button
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: (index % 8) * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => onPick(idea)}
      className={`relative w-full ${height} rounded-3xl overflow-hidden bg-surface text-left group active:scale-[0.98] transition-transform`}
    >
      <IdeaImage idea={idea} />

      {/* Gradient para legibilidade do texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />

      {/* Color swatch */}
      <div
        className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full border border-white/80 shadow-sm"
        style={{ backgroundColor: idea.colorHex }}
      />

      {/* Conteúdo no rodapé do card */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-white leading-tight drop-shadow-md">
          {idea.styleName}
        </p>
        <div className="flex flex-wrap gap-1">
          {idea.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-sm text-[10px] font-medium text-white"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* CTA hover/tap overlay */}
      <div className="absolute inset-0 bg-brand/0 group-hover:bg-brand/15 group-active:bg-brand/25 transition-colors flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 group-active:opacity-100">
        <span className="px-3 py-1.5 rounded-full bg-white text-brand text-[11px] font-semibold shadow-lg flex items-center gap-1">
          <Sparkles size={12} /> Testar na minha mão
        </span>
      </div>
    </motion.button>
  );
}

export default function IdeasPage() {
  const router = useRouter();

  const handlePick = (idea: Idea) => {
    // Resolve caminho local (/ideas/i1.jpg) para URL absoluta para o server-side
    // do /api/generate conseguir fetch-ar via HTTP.
    const absoluteUrl = idea.imageUrl.startsWith("/")
      ? `${window.location.origin}${idea.imageUrl}`
      : idea.imageUrl;
    sessionStorage.setItem("luppy_reference_image", absoluteUrl);
    sessionStorage.setItem("luppy_reference_idea_name", idea.styleName);
    sessionStorage.setItem("luppy_input_type", "image");
    sessionStorage.setItem("luppy_text_prompt", idea.styleName);
    router.push("/upload");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-10">
      {/* Header sticky */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/home")}
            className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-ink/60 hover:bg-border transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-bold text-ink">Galeria de Ideias</h1>
            <p className="text-xs text-ink/40">Toque em uma para testar na sua mão</p>
          </div>
        </div>
      </div>

      {/* Intro */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mt-4 mb-5 px-4 py-3 bg-brand-light rounded-2xl flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-brand">Inspiração beauty</p>
          <p className="text-xs text-ink/50 font-light">
            Escolha uma referência e a IA aplica na sua mão
          </p>
        </div>
      </motion.div>

      {/* Masonry grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {IDEAS.map((idea, i) => (
          <IdeaCard key={idea.id} idea={idea} index={i} onPick={handlePick} />
        ))}
      </div>
    </div>
  );
}
