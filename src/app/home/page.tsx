"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function HomePage() {
  const router = useRouter();

  // Limpa qualquer referência anterior ao chegar na home
  useEffect(() => {
    sessionStorage.removeItem("luppy_reference_image");
    sessionStorage.removeItem("luppy_reference_idea_name");
    sessionStorage.removeItem("luppy_previews");
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between px-6 py-16 overflow-hidden bg-[#ff78cb]">
      {/* Glow subtil para profundidade */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-white/12 blur-3xl -z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-white/8 blur-3xl -z-0 pointer-events-none" />

      {/* Top spacer */}
      <div />

      {/* Centro: logo + boas-vindas */}
      <div className="relative z-10 flex flex-col items-center text-center gap-6">
        {/* Wordmark "Luppy" — mais cheia, com glow */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="text-8xl font-bold tracking-tight text-white select-none"
          style={{
            letterSpacing: "-0.04em",
            textShadow:
              "0 0 32px rgba(255,255,255,0.4), 0 2px 12px rgba(0,0,0,0.08)",
            fontFeatureSettings: '"ss01"',
          }}
        >
          Luppy
        </motion.h1>

        {/* Linha separadora delicada */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="w-12 h-px bg-white/50"
        />

        {/* Texto de boas-vindas */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.5}
          className="text-white/90 text-base font-light tracking-wide"
        >
          Bem-vinda ao Luppy
        </motion.p>
      </div>

      {/* CTAs */}
      <div className="relative z-10 w-full flex flex-col items-center gap-3">
        <motion.button
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.75}
          onClick={() => router.push("/ideas")}
          className="w-full py-4 rounded-full bg-white text-[#ff78cb] text-base font-semibold tracking-wide transition-all duration-200 active:scale-95"
          style={{
            boxShadow:
              "0 8px 32px rgba(255, 120, 203, 0.4), 0 2px 8px rgba(255,255,255,0.2)",
          }}
        >
          Explorar Galeria
        </motion.button>

        <motion.button
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.9}
          onClick={() => router.push("/upload")}
          className="w-full py-3.5 rounded-full bg-white/10 border border-white/40 text-white text-sm font-medium tracking-wide backdrop-blur-sm transition-all duration-200 active:scale-95 hover:bg-white/15"
        >
          Criar do zero
        </motion.button>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1.05}
          className="text-white/55 text-xs font-light tracking-wide mt-1"
        >
          Gratuito · Sem cadastro · Resultado em segundos
        </motion.p>
      </div>
    </div>
  );
}
