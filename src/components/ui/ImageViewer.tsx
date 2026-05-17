"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, Eye, EyeOff } from "lucide-react";

interface ImageViewerProps {
  src: string;
  alt: string;
  beforeSrc?: string;
  onClose: () => void;
}

export function ImageViewer({ src, alt, beforeSrc, onClose }: ImageViewerProps) {
  const [zoomed, setZoomed] = useState(false);
  const [showBefore, setShowBefore] = useState(false);

  // Esc fecha o viewer e travamos scroll do body enquanto aberto
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const current = showBefore && beforeSrc ? beforeSrc : src;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/95 flex flex-col"
        onClick={onClose}
      >
        {/* Header */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-between px-5 pt-5 pb-3 safe-top"
        >
          <button
            onClick={() => setZoomed((z) => !z)}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label={zoomed ? "Diminuir zoom" : "Aumentar zoom"}
          >
            {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Imagem */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`flex-1 ${zoomed ? "overflow-auto" : "overflow-hidden"} flex items-center justify-center p-4`}
        >
          <motion.img
            key={current}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={current}
            alt={alt}
            onClick={() => setZoomed((z) => !z)}
            className={`select-none transition-transform duration-300 ${
              zoomed
                ? "scale-[1.8] cursor-zoom-out max-w-none"
                : "scale-100 cursor-zoom-in max-w-full max-h-full object-contain"
            }`}
            draggable={false}
          />
        </div>

        {/* Toggle antes/depois */}
        {beforeSrc && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="px-5 pb-6 pt-2 flex items-center justify-center safe-bottom"
          >
            <button
              onClick={() => setShowBefore((b) => !b)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-semibold active:scale-95 transition-transform"
            >
              {showBefore ? <EyeOff size={14} /> : <Eye size={14} />}
              {showBefore ? "Ver depois" : "Ver antes"}
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
