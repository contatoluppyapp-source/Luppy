"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { B2B_SURVEY, B2C_SURVEY } from "@/lib/survey-config";

interface SurveyRecord {
  id: string;
  created_at: string;
  user_type: "b2c" | "b2b";
  session_id: string | null;
  device: string | null;
  answers: Record<string, unknown>;
}

type Filter = "all" | "b2c" | "b2b";

function questionTextById(id: string, userType: "b2c" | "b2b"): string {
  const list = userType === "b2c" ? B2C_SURVEY : B2B_SURVEY;
  return list.find((q) => q.id === id)?.text ?? id;
}

function formatValue(v: unknown): string {
  if (Array.isArray(v)) return v.join(", ");
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function SurveyCard({ record }: { record: SurveyRecord }) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(record.answers ?? {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-surface/50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                record.user_type === "b2c"
                  ? "bg-brand-light text-brand-deep"
                  : "bg-ink/10 text-ink"
              }`}
            >
              {record.user_type}
            </span>
            <span className="text-xs text-ink/50">
              {formatDate(record.created_at)}
            </span>
          </div>
          <p className="text-xs text-ink/60 truncate">
            {entries.length} respostas · session{" "}
            {record.session_id?.slice(0, 8) ?? "—"}
          </p>
        </div>
        <ChevronDown
          size={18}
          className={`text-ink/40 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 flex flex-col gap-3 border-t border-border">
              {entries.map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <p className="text-[11px] font-semibold text-ink/40 uppercase tracking-wide">
                    {questionTextById(key, record.user_type)}
                  </p>
                  <p className="text-sm text-ink whitespace-pre-wrap">
                    {formatValue(value)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminPage() {
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let mounted = true;
    fetch("/api/surveys")
      .then(async (res) => {
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<{ surveys: SurveyRecord[] }>;
      })
      .then((data) => {
        if (mounted) setRecords(data.surveys ?? []);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "Erro");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    return {
      total: records.length,
      b2c: records.filter((r) => r.user_type === "b2c").length,
      b2b: records.filter((r) => r.user_type === "b2b").length,
    };
  }, [records]);

  const filtered = useMemo(() => {
    if (filter === "all") return records;
    return records.filter((r) => r.user_type === filter);
  }, [records, filter]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const dt = new Date().toISOString().slice(0, 10);
    a.download = `luppy-surveys-${dt}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-cream pb-10">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-ink">Luppy · Painel</h1>
            <p className="text-xs text-ink/40">Respostas das pesquisas</p>
          </div>
          <button
            onClick={exportJson}
            disabled={records.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-brand text-white text-xs font-semibold soft-shadow-pink active:scale-95 transition-transform disabled:opacity-30"
          >
            <Download size={13} />
            Exportar JSON
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="px-5 pt-5 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-border">
          <p className="text-[10px] font-bold uppercase text-ink/40 tracking-wide">Total</p>
          <p className="text-2xl font-bold text-ink mt-1">{totals.total}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-border">
          <p className="text-[10px] font-bold uppercase text-brand-deep tracking-wide">B2C</p>
          <p className="text-2xl font-bold text-brand mt-1">{totals.b2c}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-border">
          <p className="text-[10px] font-bold uppercase text-ink/60 tracking-wide">B2B</p>
          <p className="text-2xl font-bold text-ink mt-1">{totals.b2b}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-5 pt-5 flex items-center gap-2">
        {(["all", "b2c", "b2b"] as Filter[]).map((f) => {
          const active = filter === f;
          const label = f === "all" ? "Todas" : f.toUpperCase();
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                active
                  ? "bg-ink text-white"
                  : "bg-white border border-border text-ink/60"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <div className="px-5 pt-5 flex flex-col gap-3">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-ink/40">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Erro ao carregar respostas</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <p className="text-xs text-red-500/70 mt-2">
                Verifique se as variáveis do Supabase estão configuradas em <code>.env.local</code>.
              </p>
            </div>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12 text-ink/40">
            <p className="text-sm">Nenhuma resposta ainda.</p>
          </div>
        )}
        {!loading &&
          !error &&
          filtered.map((r) => <SurveyCard key={r.id} record={r} />)}
      </div>
    </div>
  );
}
