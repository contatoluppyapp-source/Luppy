"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HeroVisual } from "@/components/home/HeroVisual";
import { fadeUp } from "@/lib/motion-variants";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.removeItem("luppy_reference_image");
    sessionStorage.removeItem("luppy_reference_idea_name");
    sessionStorage.removeItem("luppy_previews");
  }, []);

  return (
    <div
      className="relative h-[100dvh] flex flex-col safe-top safe-bottom overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #fff7fb 0%, #ffeaf5 50%, #ffe4f1 78%, #fff1f8 100%)",
      }}
    >
      {/* Blobs difusos — profundidade premium, sem poluição */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-60"
        style={{ background: "#ffd6e8" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-32 w-[420px] h-[420px] rounded-full blur-3xl opacity-50"
        style={{ background: "#ffe2ee" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[560px] h-[460px] rounded-full blur-3xl opacity-55"
        style={{ background: "#ffd9ea" }}
      />

      {/* Topo: boas-vindas + wordmark */}
      <div className="relative z-10 shrink-0 pt-6 pb-1 px-7 text-center">
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="text-[12px] font-medium text-ink/50 tracking-[0.22em] uppercase"
        >
          Seja bem-vinda ao
        </motion.p>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.1}
          className="mt-2 leading-[0.95] font-bold text-brand text-glow select-none"
          style={{
            letterSpacing: "-0.045em",
            fontSize: "clamp(4.25rem, 17vw, 5.5rem)",
          }}
        >
          Luppy
        </motion.h1>

        {/* Separador delicado */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="mx-auto mt-3 w-12 h-px bg-brand/40 origin-center"
        />

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.3}
          className="mt-3 text-[14px] text-ink/55 font-light leading-snug tracking-wide"
        >
          Aqui você cria a unha
          <br />
          que você deseja.
        </motion.p>
      </div>

      {/* Hero visual — mão integrada ao fundo, sem card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0.25}
        className="relative z-10 flex-1 min-h-0 w-full px-2 flex items-center justify-center"
      >
        <HeroVisual />
      </motion.div>

      {/* CTAs */}
      <div className="relative z-10 shrink-0 px-7 pb-5 flex flex-col gap-2.5">
        <motion.button
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.5}
          onClick={() => router.push("/ideas")}
          className="w-full py-[15px] rounded-full text-white text-[15px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          style={{
            background:
              "linear-gradient(135deg, #ff5cc0 0%, #f84587 55%, #e93088 100%)",
            boxShadow:
              "0 14px 32px -8px rgba(248, 69, 135, 0.45), 0 4px 12px -2px rgba(216, 70, 142, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
            letterSpacing: "0.01em",
          }}
        >
          Testar Luppy
          <ArrowRight size={18} strokeWidth={2.2} />
        </motion.button>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.6}
        >
          <Link
            href="/designer"
            className="w-full py-[13px] px-6 rounded-full text-ink/75 text-[13.5px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
            style={{
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.9)",
              boxShadow:
                "0 6px 18px -6px rgba(216, 70, 142, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
            }}
          >
            Sou uma profissional
            <span className="text-ink/40 text-[11.5px] font-medium">
              · ajude a construir
            </span>
          </Link>
        </motion.div>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.7}
          className="text-[10.5px] text-ink/40 text-center font-medium tracking-[0.12em] uppercase pt-1"
        >
          Gratuito · Sem cadastro · Resultado em segundos
        </motion.p>
      </div>
    </div>
  );
}
