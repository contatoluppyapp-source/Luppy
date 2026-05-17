"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full h-full mx-auto"
      style={{
        maxWidth: "460px",
      }}
    >
      {/* Glow rosado atrás da mão — preenche o espaço onde a imagem se dissolve */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 w-[92%] h-[78%] rounded-full blur-3xl opacity-75"
          style={{ background: "#ffc4dc" }}
        />
        <div
          className="absolute left-[48%] top-[62%] -translate-x-1/2 -translate-y-1/2 w-[62%] h-[58%] rounded-full blur-2xl opacity-65"
          style={{ background: "#ffd2e6" }}
        />
        <div
          className="absolute left-1/2 bottom-[-8%] -translate-x-1/2 w-[80%] h-[40%] rounded-full blur-3xl opacity-70"
          style={{ background: "#ffdfee" }}
        />
      </div>

      {/* Mão recortada — dissolvida no fundo via mask gradiente */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
        className="relative w-full h-full"
        style={{
          filter:
            "drop-shadow(0 18px 28px rgba(216, 70, 142, 0.16)) drop-shadow(0 6px 12px rgba(122, 15, 84, 0.08))",
          // Mask combina vertical (fade no bottom) + horizontal (fade leve nas laterais)
          WebkitMaskImage:
            "linear-gradient(180deg, #000 0%, #000 58%, rgba(0,0,0,0.65) 78%, rgba(0,0,0,0.25) 92%, transparent 100%), linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.55) 6%, #000 16%, #000 84%, rgba(0,0,0,0.55) 94%, transparent 100%)",
          maskImage:
            "linear-gradient(180deg, #000 0%, #000 58%, rgba(0,0,0,0.65) 78%, rgba(0,0,0,0.25) 92%, transparent 100%), linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.55) 6%, #000 16%, #000 84%, rgba(0,0,0,0.55) 94%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      >
        <Image
          src="/unhas_sem_fundo.png"
          alt="Mão com unhas premium"
          fill
          priority
          quality={92}
          sizes="(max-width: 480px) 100vw, 460px"
          className="object-contain object-center"
        />
      </motion.div>
    </motion.div>
  );
}
