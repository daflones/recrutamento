"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Cpu,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Headphones,
  KeyRound,
  Laptop,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Terminal,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  Wifi,
  X,
} from "lucide-react";

interface ApplicationRow {
  id: string;
  operative_code: string;
  full_name: string;
  email: string;
  whatsapp: string;
  discord_handle: string;
  knows_ai: string;
  codes_with_ai: string;
  has_computer: boolean;
  has_discord: boolean;
  has_microphone: boolean;
  has_internet: boolean;
  experience_level: string | null;
  daily_availability: string | null;
  motivation: string | null;
  wizard_answers: {
    aiToolsUsed?: string[];
    osPreference?: string;
    dailyAvailability?: string;
  } | null;
  payment_status: "pending" | "paid" | "failed" | "expired" | "review";
  payment_method: "pix" | null;
  payment_provider: "mercosulpay" | null;
  payment_ref: string | null;
  payment_amount_cents: number;
  paid_at: string | null;
  selection_status:
    | "em_analise"
    | "pre_selecionado"
    | "entrevistado"
    | "selecionado"
    | "recusado";
  admin_notes: string;
  admin_score: number | null;
  created_at: string;
  updated_at: string;
}

interface PaymentRow {
  id: string;
  application_id: string;
  provider: "mercosulpay";
  provider_ref: string;
  external_id: string | null;
  method: "pix";
  amount_cents: number;
  status: "pending" | "paid" | "failed" | "expired" | "review";
  qr_code: string | null;
  checkout_url: string | null;
  paid_at: string | null;
  created_at: string;
}

interface AdminSettings {
  recruitmentOpen: boolean;
  deadlineIso: string;
  deadlineLabel: string;
  totalSpots: number;
  signalAmountCents: number;
  pixEnabled: boolean;
  cardEnabled: boolean;
  discordUrl: string;
  instagramHandle: string;
  instagramUrl: string;
  announcementBanner: string;
}

interface AdminMetrics {
  totalApplications: number;
  paidApplications: number;
  pendingApplications: number;
  failedApplications: number;
  selectedCount: number;
  preSelectedCount: number;
  interviewedCount: number;
  rejectedCount: number;
  revenueTotalCents: number;
  revenuePixCents: number;
  revenueCardCents: number;
}

const SELECTION_LABELS: Record<
  ApplicationRow["selection_status"],
  { label: string; badgeClass: string }
> = {
  em_analise: {
    label: "Em Análise",
    badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
  },
  pre_selecionado: {
    label: "🔥 Pré-Selecionado",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  entrevistado: {
    label: "📞 Entrevistado",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  },
  selecionado: {
    label: "⭐ SELECIONADO (TOP 3)",
    badgeClass: "bg-purple-500/25 text-purple-200 border-purple-400",
  },
  recusado: {
    label: "❌ Recusado",
    badgeClass: "bg-red-500/15 text-red-300 border-red-500/30",
  },
};

const PAYMENT_LABELS: Record<
  ApplicationRow["payment_status"],
  { label: string; badgeClass: string }
> = {
  paid: {
    label: "PAGO",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  pending: {
    label: "PENDENTE",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  review: {
    label: "REVISÃO",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  },
  failed: {
    label: "FALHOU",
    badgeClass: "bg-red-500/15 text-red-300 border-red-500/30",
  },
  expired: {
    label: "EXPIRADO",
    badgeClass: "bg-zinc-800 text-zinc-400 border-zinc-700",
  },
};

function brl(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function whatsappUrl(phone: string, name: string, code: string): string {
  const digits = phone.replace(/\D/g, "");
  const e164 = digits.startsWith("55") ? digits : `55${digits}`;
  const text = encodeURIComponent(
    `Fala ${name.split(" ")[0]}, tudo certo? Aqui é o Mr. Robot da F.SOCIETY.DEV sobre sua ficha de recrutamento (${code}) para o projeto prático do SaaS!`,
  );
  return `https://wa.me/${e164}?text=${text}`;
}

export default function FsocietyAdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [tab, setTab] = useState<"fichas" | "pagamentos" | "config">("fichas");
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);

  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Filtros das Fichas
  const [searchQuery, setSearchQuery] = useState("");
  const [payFilter, setPayFilter] = useState<"all" | "paid" | "pending" | "other">("all");
  const [selFilter, setSelFilter] = useState<
    "all" | ApplicationRow["selection_status"]
  >("all");
  const [openAppId, setOpenAppId] = useState<string | null>(null);

  // Edição local de notas/score/dados por candidato
  const [drafts, setDrafts] = useState<
    Record<
      string,
      {
        adminNotes: string;
        adminScore: string;
        fullName: string;
        whatsapp: string;
        email: string;
        discordHandle: string;
      }
    >
  >({});

  // Modal de Novo Candidato Manual
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    fullName: "",
    whatsapp: "",
    email: "",
    discordHandle: "",
    knowsAi: "Domino IA no dia a dia",
    codesWithAi: "Já crio sites/sistemas usando IA",
    motivation: "",
    paymentStatus: "paid" as "paid" | "pending",
    selectionStatus: "pre_selecionado" as ApplicationRow["selection_status"],
    adminNotes: "",
  });

  // Edição de Configurações
  const [cfgDraft, setCfgDraft] = useState<AdminSettings | null>(null);
  const [signalReaisInput, setSignalReaisInput] = useState("10");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin", { cache: "no-store" });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthenticated(false);
        return;
      }
      setAuthenticated(true);
      const apps = (data.applications ?? []) as ApplicationRow[];
      setApplications(apps);
      setPayments((data.payments ?? []) as PaymentRow[]);
      setMetrics(data.metrics as AdminMetrics);
      setSettings(data.settings as AdminSettings);
      setCfgDraft(data.settings as AdminSettings);
      if (data.settings?.signalAmountCents) {
        setSignalReaisInput(String(data.settings.signalAmountCents / 100));
      }

      const initialDrafts: typeof drafts = {};
      for (const a of apps) {
        initialDrafts[a.id] = {
          adminNotes: a.admin_notes || "",
          adminScore: a.admin_score != null ? String(a.admin_score) : "",
          fullName: a.full_name,
          whatsapp: a.whatsapp,
          email: a.email,
          discordHandle: a.discord_handle,
        };
      }
      setDrafts(initialDrafts);
    } catch {
      setError("Falha ao carregar dados do painel.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_login",
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLoginError(data.error || "Acesso negado.");
        return;
      }
      setAuthenticated(true);
      setLoginPassword("");
      await loadDashboard();
    } catch {
      setLoginError("Erro de conexão ao autenticar.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "admin_logout" }),
    });
    setAuthenticated(false);
  }

  async function runAdminAction(
    payload: Record<string, unknown>,
    busyKey: string,
    successMsg?: string,
  ): Promise<boolean> {
    setBusyId(busyKey);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Não foi possível executar a ação.");
        return false;
      }
      if (successMsg) {
        setNotice(successMsg);
        setTimeout(() => setNotice(""), 4000);
      }
      await loadDashboard();
      return true;
    } catch {
      setError("Falha de comunicação com o servidor.");
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function copyToClipboard(text: string, label: string) {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2200);
  }

  function exportCsv() {
    const headers = [
      "Codigo",
      "Nome",
      "Discord",
      "WhatsApp",
      "Email",
      "Status_Pagamento",
      "Metodo",
      "Valor_R$",
      "Status_Selecao",
      "Nota_Admin",
      "Sabe_IA",
      "Programa_IA",
      "PC",
      "Discord_App",
      "Microfone",
      "Internet",
      "Disponibilidade",
      "Motivacao",
      "Notas_Admin",
      "Data_Inscricao",
    ];
    const rows = applications.map((a) => [
      a.operative_code,
      a.full_name,
      a.discord_handle,
      a.whatsapp,
      a.email,
      a.payment_status,
      a.payment_method || "",
      (a.payment_amount_cents / 100).toFixed(2),
      a.selection_status,
      a.admin_score ?? "",
      a.knows_ai,
      a.codes_with_ai,
      a.has_computer ? "Sim" : "Nao",
      a.has_discord ? "Sim" : "Nao",
      a.has_microphone ? "Sim" : "Nao",
      a.has_internet ? "Sim" : "Nao",
      a.daily_availability || "",
      (a.motivation || "").replace(/\r?\n/g, " "),
      (a.admin_notes || "").replace(/\r?\n/g, " "),
      a.created_at,
    ]);
    const csvContent =
      "\uFEFF" +
      [headers, ...rows]
        .map((r) =>
          r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"),
        )
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fsociety-recrutamento-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications.filter((a) => {
      if (payFilter === "paid" && a.payment_status !== "paid") return false;
      if (payFilter === "pending" && a.payment_status !== "pending") return false;
      if (
        payFilter === "other" &&
        !["failed", "expired", "review"].includes(a.payment_status)
      ) {
        return false;
      }
      if (selFilter !== "all" && a.selection_status !== selFilter) return false;
      if (q) {
        const hay = [
          a.operative_code,
          a.full_name,
          a.email,
          a.whatsapp,
          a.discord_handle,
          a.motivation,
          a.admin_notes,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [applications, searchQuery, payFilter, selFilter]);

  const appById = useMemo(() => {
    const map = new Map<string, ApplicationRow>();
    for (const a of applications) map.set(a.id, a);
    return map;
  }, [applications]);

  // ==================== TELA DE LOGIN ADMIN ====================
  if (authenticated === false) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-[#080810]/95 p-6 sm:p-8 shadow-[0_0_60px_rgba(147,51,234,0.2)] space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-purple-500/50 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-fsociety.jpg"
                alt="fsociety"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-mono-code text-[10px] uppercase tracking-widest text-purple-400 block">
                RESTRICTED // FSOCIETY00.DAT
              </span>
              <h1 className="font-hacker text-xl sm:text-2xl font-bold text-white">
                TERMINAL DE AUTENTICAÇÃO
              </h1>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-code uppercase text-zinc-400 mb-1.5">
                Identificador (Opcional)
              </label>
              <input
                type="email"
                inputMode="email"
                autoCapitalize="none"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Operador"
                className="w-full min-h-[46px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-code uppercase text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                Chave de Acesso *
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full min-h-[46px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none font-mono-code"
              />
            </div>

            {loginError && (
              <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginBusy}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(147,51,234,0.35)] transition cursor-pointer"
            >
              {loginBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Autenticando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Acessar Central de Comando
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800/80 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono-code text-zinc-400 hover:text-purple-400 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar para a página pública de recrutamento
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (authenticated === null) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center p-4">
        <div className="flex items-center gap-3 font-mono-code text-sm text-purple-300">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          Carregando Central de Comando F.SOCIETY.DEV...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid pb-16">
      {/* Header do Painel Admin */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#06060b]/95 border-b border-purple-500/25">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-purple-500/50 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-fsociety.jpg"
                alt="F.SOCIETY.DEV"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-hacker text-base sm:text-xl font-bold text-white truncate">
                  F.SOCIETY<span className="text-purple-500">.DEV</span> // ADMIN
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono-code px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ROOT@MR.ROBOT
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-400 truncate">
                Controle de Fichas, Pagamentos e Seleção das {settings?.totalSpots ?? 3} Vagas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void loadDashboard()}
              disabled={loading}
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono-code text-zinc-300 inline-flex items-center gap-1.5 cursor-pointer"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-400" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono-code text-zinc-300 inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Ver Site</span>
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-xs font-mono-code text-red-300 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Alertas de Feedback */}
        {notice && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-xs sm:text-sm text-emerald-200 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {notice}
            </span>
            <button type="button" onClick={() => setNotice("")}>
              <X className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-xs sm:text-sm text-red-200 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              {error}
            </span>
            <button type="button" onClick={() => setError("")}>
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}

        {/* ==================== 4 CARDS DE MÉTRICAS (2x2 no Mobile, 4x1 no Desktop) ==================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Receita Confirmada */}
          <div className="rounded-2xl border border-emerald-500/30 bg-[#090d0c]/90 p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono-code text-emerald-400">
              <span>RECEITA CONFIRMADA</span>
              <Wallet className="w-4 h-4" />
            </div>
            <div className="my-2">
              <strong className="text-xl sm:text-3xl font-extrabold text-white font-mono-code tabular-nums">
                {brl(metrics?.revenueTotalCents ?? 0)}
              </strong>
            </div>
            <div className="text-[11px] text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-code">
              <span className="text-emerald-300">
                Entradas via PIX (MercosulPay)
              </span>
            </div>
          </div>

          {/* Card 2: Total de Fichas & Pagamentos */}
          <div className="rounded-2xl border border-purple-500/30 bg-[#0a0914]/90 p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono-code text-purple-300">
              <span>FICHAS / INSCRITOS</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <strong className="text-xl sm:text-3xl font-extrabold text-white font-mono-code tabular-nums">
                {metrics?.totalApplications ?? 0}
              </strong>
              <span className="text-xs text-emerald-400 font-mono-code">
                ({metrics?.paidApplications ?? 0} pagos)
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono-code">
              {metrics?.pendingApplications ?? 0} aguardando pagamento
            </div>
          </div>

          {/* Card 3: Vagas Selecionadas (Top 3) */}
          <div className="rounded-2xl border border-purple-500/30 bg-[#0a0914]/90 p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono-code text-amber-300">
              <span>SELECIONADOS (VAGAS)</span>
              <Crown className="w-4 h-4" />
            </div>
            <div className="my-2 flex items-baseline gap-1.5">
              <strong className="text-xl sm:text-3xl font-extrabold text-purple-400 font-mono-code tabular-nums">
                {metrics?.selectedCount ?? 0}
              </strong>
              <span className="text-sm sm:text-lg text-zinc-500 font-mono-code">
                / {settings?.totalSpots ?? 3} vagas
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono-code">
              🔥 {metrics?.preSelectedCount ?? 0} pré-sel. • 📞{" "}
              {metrics?.interviewedCount ?? 0} entrevistados
            </div>
          </div>

          {/* Card 4: Status & Ações Rápidas */}
          <div className="rounded-2xl border border-zinc-800 bg-[#090912]/90 p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono-code text-zinc-400">
              <span>STATUS DA OPERAÇÃO</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  settings?.recruitmentOpen
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-red-500/20 text-red-300 border border-red-500/40"
                }`}
              >
                {settings?.recruitmentOpen ? "ABERTO" : "ENCERRADO"}
              </span>
            </div>
            <div className="my-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                disabled={busyId !== null}
                onClick={() =>
                  void runAdminAction(
                    { action: "admin_sync_payments" },
                    "sync",
                    "Pagamentos PIX pendentes verificados junto ao MercosulPay!",
                  )
                }
                className="flex-1 min-h-[38px] px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/40 text-purple-200 text-[11px] font-mono-code inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {busyId === "sync" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Sincronizar PIX
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="min-h-[38px] px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-mono-code inline-flex items-center justify-center gap-1 cursor-pointer"
                title="Baixar planilha CSV"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono-code">
              Prazo: {settings?.deadlineLabel ?? "10/11"} • Sinal:{" "}
              {brl(settings?.signalAmountCents ?? 1000)}
            </div>
          </div>
        </div>

        {/* ==================== NAVEGAÇÃO DE ABAS DO ADMIN ==================== */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("fichas")}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-mono-code font-semibold inline-flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                tab === "fichas"
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.35)]"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              Fichas & Candidatos ({applications.length})
            </button>

            <button
              type="button"
              onClick={() => setTab("pagamentos")}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-mono-code font-semibold inline-flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                tab === "pagamentos"
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.35)]"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Pagamentos ({payments.length})
            </button>

            <button
              type="button"
              onClick={() => setTab("config")}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-mono-code font-semibold inline-flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                tab === "config"
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.35)]"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Settings className="w-4 h-4" />
              Configurações da Operação
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="min-h-[42px] px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono-code font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Cadastrar Manual</span>
          </button>
        </div>

        {/* ==================== ABA 1: FICHAS & CANDIDATOS ==================== */}
        {tab === "fichas" && (
          <div className="space-y-4">
            {/* Barra de Busca e Filtros */}
            <div className="rounded-2xl border border-zinc-800 bg-[#090912]/90 p-3.5 sm:p-4 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nome, @discord, WhatsApp, e-mail ou código FSOC..."
                    className="w-full min-h-[44px] rounded-xl bg-zinc-950 border border-zinc-800 pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Filtro de Pagamento */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {(
                    [
                      ["all", "Todos Pag."],
                      ["paid", "✓ Pagos"],
                      ["pending", "⏳ Pendentes"],
                      ["other", "Falhos/Rev."],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPayFilter(key)}
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-mono-code border transition whitespace-nowrap cursor-pointer ${
                        payFilter === key
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro por Etapa do Funil de Seleção */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                <span className="text-[11px] font-mono-code text-zinc-500 flex items-center gap-1 mr-1 shrink-0">
                  <Filter className="w-3 h-3" /> Seleção:
                </span>
                {(
                  [
                    ["all", "Todas Fichas"],
                    ["selecionado", "⭐ Selecionados (Top 3)"],
                    ["pre_selecionado", "🔥 Pré-Selecionados"],
                    ["entrevistado", "📞 Entrevistados"],
                    ["em_analise", "Em Análise"],
                    ["recusado", "❌ Recusados"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelFilter(key)}
                    className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-mono-code border transition whitespace-nowrap cursor-pointer ${
                      selFilter === key
                        ? "bg-purple-600/25 border-purple-400 text-purple-200 font-semibold"
                        : "bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Fichas (Cards Expansíveis Mobile-First) */}
            {filteredApps.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-[#090912]/70 p-10 text-center space-y-2">
                <Users className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-semibold text-zinc-300">
                  Nenhuma ficha de recrutamento encontrada para este filtro.
                </p>
                <p className="text-xs text-zinc-500">
                  Assim que os candidatos preencherem o Wizard na página principal, todas as fichas aparecerão aqui em tempo real.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApps.map((app) => {
                  const isOpen = openAppId === app.id;
                  const payBadge = PAYMENT_LABELS[app.payment_status] || PAYMENT_LABELS.pending;
                  const selBadge =
                    SELECTION_LABELS[app.selection_status] || SELECTION_LABELS.em_analise;
                  const draft = drafts[app.id] || {
                    adminNotes: app.admin_notes || "",
                    adminScore: app.admin_score != null ? String(app.admin_score) : "",
                    fullName: app.full_name,
                    whatsapp: app.whatsapp,
                    email: app.email,
                    discordHandle: app.discord_handle,
                  };
                  const tools = Array.isArray(app.wizard_answers?.aiToolsUsed)
                    ? app.wizard_answers!.aiToolsUsed!
                    : [];

                  return (
                    <article
                      key={app.id}
                      className={`rounded-2xl border transition overflow-hidden ${
                        app.selection_status === "selecionado"
                          ? "border-purple-500/60 bg-[#0d0a18] shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                          : isOpen
                          ? "border-purple-500/40 bg-[#0a0a14]"
                          : "border-zinc-800/90 bg-[#080810]/90 hover:border-zinc-700"
                      }`}
                    >
                      {/* Cabeçalho clicável da Ficha */}
                      <button
                        type="button"
                        onClick={() => setOpenAppId(isOpen ? null : app.id)}
                        className="w-full p-4 sm:p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center font-mono-code text-xs font-bold text-purple-300 shrink-0">
                            {app.admin_score != null ? `${app.admin_score}/10` : "FS"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono-code text-[11px] text-purple-400 font-bold">
                                {app.operative_code}
                              </span>
                              <strong className="text-sm sm:text-base text-white truncate">
                                {app.full_name}
                              </strong>
                              <span className="font-mono-code text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded">
                                {app.discord_handle}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 mt-1">
                              <span>{app.whatsapp}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="truncate">{app.email}</span>
                              <span>•</span>
                              <span className="font-mono-code text-[11px] text-zinc-500">
                                {fmtDate(app.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">
                          <span
                            className={`text-[11px] font-mono-code font-bold px-2.5 py-1 rounded-lg border ${payBadge.badgeClass}`}
                          >
                            {payBadge.label}
                            {app.payment_method ? ` (${app.payment_method.toUpperCase()})` : ""}
                          </span>
                          <span
                            className={`text-[11px] font-mono-code font-semibold px-2.5 py-1 rounded-lg border ${selBadge.badgeClass}`}
                          >
                            {selBadge.label}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-zinc-400 transition-transform ml-auto sm:ml-1 ${
                              isOpen ? "rotate-180 text-purple-400" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {/* Corpo Expandido: Dossiê Completo do Candidato */}
                      {isOpen && (
                        <div className="px-4 pb-5 pt-2 sm:px-6 sm:pb-6 border-t border-zinc-800/80 space-y-6 bg-[#06060b]/60">
                          {/* Atalhos Rápidos de Contato */}
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            <a
                              href={whatsappUrl(
                                app.whatsapp,
                                app.full_name,
                                app.operative_code,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono-code font-semibold inline-flex items-center gap-2"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              Chamar no WhatsApp
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                void copyToClipboard(
                                  app.discord_handle,
                                  `discord-${app.id}`,
                                )
                              }
                              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-mono-code inline-flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {copiedText === `discord-${app.id}`
                                ? "Discord Copiado!"
                                : `Copiar ${app.discord_handle}`}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void copyToClipboard(app.email, `email-${app.id}`)
                              }
                              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono-code inline-flex items-center gap-2 cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              {copiedText === `email-${app.id}`
                                ? "E-mail Copiado!"
                                : "Copiar E-mail"}
                            </button>
                          </div>

                          {/* Grid de Respostas do Wizard */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Coluna 1: IA & Programação */}
                            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
                              <h4 className="text-xs font-mono-code uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                                <Bot className="w-4 h-4" /> Perfil Técnico & IA
                              </h4>
                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="text-zinc-500 block">Sabe usar IA:</span>
                                  <strong className="text-zinc-200">{app.knows_ai}</strong>
                                </div>
                                <div>
                                  <span className="text-zinc-500 block">
                                    Programação com IA:
                                  </span>
                                  <strong className="text-zinc-200">{app.codes_with_ai}</strong>
                                </div>
                                <div>
                                  <span className="text-zinc-500 block">
                                    Disponibilidade Diária:
                                  </span>
                                  <strong className="text-emerald-400">
                                    {app.daily_availability ||
                                      app.wizard_answers?.dailyAvailability ||
                                      "Não informada"}
                                  </strong>
                                </div>
                                {tools.length > 0 && (
                                  <div>
                                    <span className="text-zinc-500 block mb-1">
                                      Ferramentas de IA usadas:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {tools.map((t) => (
                                        <span
                                          key={t}
                                          className="px-2 py-0.5 rounded bg-purple-950/50 border border-purple-500/30 text-[11px] font-mono-code text-purple-200"
                                        >
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Coluna 2: Equipamento & Setup */}
                            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
                              <h4 className="text-xs font-mono-code uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                                <Cpu className="w-4 h-4" /> Checklist de Equipamento
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
                                <div
                                  className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                                    app.has_computer
                                      ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                                      : "border-red-500/30 bg-red-950/20 text-red-300"
                                  }`}
                                >
                                  <Laptop className="w-4 h-4" />
                                  <span>PC: {app.has_computer ? "SIM" : "NÃO"}</span>
                                </div>
                                <div
                                  className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                                    app.has_discord
                                      ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                                      : "border-red-500/30 bg-red-950/20 text-red-300"
                                  }`}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Discord: {app.has_discord ? "SIM" : "NÃO"}</span>
                                </div>
                                <div
                                  className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                                    app.has_microphone
                                      ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                                      : "border-amber-500/30 bg-amber-950/20 text-amber-300"
                                  }`}
                                >
                                  <Headphones className="w-4 h-4" />
                                  <span>Mic: {app.has_microphone ? "SIM" : "NÃO"}</span>
                                </div>
                                <div
                                  className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                                    app.has_internet
                                      ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                                      : "border-red-500/30 bg-red-950/20 text-red-300"
                                  }`}
                                >
                                  <Wifi className="w-4 h-4" />
                                  <span>Net: {app.has_internet ? "SIM" : "NÃO"}</span>
                                </div>
                              </div>
                              <div className="text-xs pt-1">
                                <span className="text-zinc-500">Sistema Operacional: </span>
                                <strong className="text-zinc-200 font-mono-code">
                                  {app.wizard_answers?.osPreference || "Windows"}
                                </strong>
                              </div>
                            </div>

                            {/* Coluna 3: Motivação do Candidato */}
                            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-2">
                              <h4 className="text-xs font-mono-code uppercase tracking-wider text-purple-400">
                                Por que merece uma das 3 vagas:
                              </h4>
                              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap bg-black/50 p-3 rounded-lg border border-zinc-800/80 max-h-40 overflow-y-auto">
                                {app.motivation || "Nenhuma motivação escrita."}
                              </p>
                            </div>
                          </div>

                          {/* Decisão de Seleção Rápida (1 Clique) */}
                          <div className="rounded-xl border border-purple-500/30 bg-purple-950/10 p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-mono-code uppercase tracking-wider text-purple-300 font-semibold">
                                Definir Etapa de Seleção do Candidato:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {(
                                  [
                                    ["em_analise", "Em Análise"],
                                    ["pre_selecionado", "🔥 Pré-Selecionar"],
                                    ["entrevistado", "📞 Entrevistado"],
                                    ["selecionado", "⭐ SELECIONAR (TOP 3)"],
                                    ["recusado", "❌ Recusar"],
                                  ] as const
                                ).map(([stKey, stLabel]) => (
                                  <button
                                    key={stKey}
                                    type="button"
                                    disabled={busyId !== null}
                                    onClick={() =>
                                      void runAdminAction(
                                        {
                                          action: "admin_update_application",
                                          applicationId: app.id,
                                          selectionStatus: stKey,
                                        },
                                        `sel-${app.id}-${stKey}`,
                                        `Status de ${app.full_name} atualizado para ${stLabel}!`,
                                      )
                                    }
                                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-mono-code border transition cursor-pointer ${
                                      app.selection_status === stKey
                                        ? "bg-purple-600 text-white border-purple-400 font-bold"
                                        : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-purple-500/50"
                                    }`}
                                  >
                                    {stLabel}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Controle Manual de Pagamento */}
                            <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                              <div className="text-xs font-mono-code text-zinc-400">
                                Pagamento:{" "}
                                <strong className="text-white">
                                  {brl(app.payment_amount_cents)}
                                </strong>{" "}
                                • Ref:{" "}
                                <code className="text-zinc-500">
                                  {app.payment_ref ? app.payment_ref.slice(0, 12) + "…" : "—"}
                                </code>
                                {app.paid_at && (
                                  <span className="text-emerald-400 ml-2">
                                    (Pago em {fmtDate(app.paid_at)})
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {app.payment_status !== "paid" ? (
                                  <button
                                    type="button"
                                    disabled={busyId !== null}
                                    onClick={() =>
                                      void runAdminAction(
                                        {
                                          action: "admin_update_application",
                                          applicationId: app.id,
                                          paymentStatus: "paid",
                                        },
                                        `pay-${app.id}`,
                                        `Pagamento de ${app.full_name} aprovado manualmente!`,
                                      )
                                    }
                                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono-code font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Aprovar Pagamento Manualmente
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={busyId !== null}
                                    onClick={() =>
                                      void runAdminAction(
                                        {
                                          action: "admin_update_application",
                                          applicationId: app.id,
                                          paymentStatus: "pending",
                                        },
                                        `unpay-${app.id}`,
                                        "Status de pagamento voltado para pendente.",
                                      )
                                    }
                                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-mono-code cursor-pointer"
                                  >
                                    Voltar para Pendente
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Edição de Dados, Nota (0-10) e Anotações Internas */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
                            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-mono-code text-zinc-400 mb-1">
                                  Nome do Candidato
                                </label>
                                <input
                                  type="text"
                                  value={draft.fullName}
                                  onChange={(e) =>
                                    setDrafts((d) => ({
                                      ...d,
                                      [app.id]: { ...draft, fullName: e.target.value },
                                    }))
                                  }
                                  className="w-full min-h-[40px] rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-mono-code text-zinc-400 mb-1">
                                  @Discord
                                </label>
                                <input
                                  type="text"
                                  value={draft.discordHandle}
                                  onChange={(e) =>
                                    setDrafts((d) => ({
                                      ...d,
                                      [app.id]: { ...draft, discordHandle: e.target.value },
                                    }))
                                  }
                                  className="w-full min-h-[40px] rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-white font-mono-code"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-mono-code text-zinc-400 mb-1">
                                  WhatsApp
                                </label>
                                <input
                                  type="text"
                                  value={draft.whatsapp}
                                  onChange={(e) =>
                                    setDrafts((d) => ({
                                      ...d,
                                      [app.id]: { ...draft, whatsapp: e.target.value },
                                    }))
                                  }
                                  className="w-full min-h-[40px] rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-white font-mono-code"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-mono-code text-zinc-400 mb-1">
                                  Nota Admin (0 a 10)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={10}
                                  value={draft.adminScore}
                                  onChange={(e) =>
                                    setDrafts((d) => ({
                                      ...d,
                                      [app.id]: { ...draft, adminScore: e.target.value },
                                    }))
                                  }
                                  placeholder="Ex: 9"
                                  className="w-full min-h-[40px] rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-white font-mono-code"
                                />
                              </div>
                            </div>

                            <div className="lg:col-span-6 space-y-2">
                              <label className="block text-[11px] font-mono-code text-zinc-400">
                                Anotações Internas do Mr. Robot (Salvas no Banco)
                              </label>
                              <textarea
                                rows={3}
                                value={draft.adminNotes}
                                onChange={(e) =>
                                  setDrafts((d) => ({
                                    ...d,
                                    [app.id]: { ...draft, adminNotes: e.target.value },
                                  }))
                                }
                                placeholder="Observações sobre perfil, call no Discord, pontos fortes..."
                                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 p-3 text-xs text-white placeholder-zinc-600"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/60">
                            <button
                              type="button"
                              disabled={busyId !== null}
                              onClick={() => {
                                if (
                                  confirm(
                                    `Tem certeza que deseja excluir a ficha de ${app.full_name} (${app.operative_code})?`,
                                  )
                                ) {
                                  void runAdminAction(
                                    {
                                      action: "admin_delete_application",
                                      applicationId: app.id,
                                    },
                                    `del-${app.id}`,
                                    "Ficha excluída com sucesso.",
                                  );
                                }
                              }}
                              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-300 text-xs font-mono-code inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir Ficha
                            </button>

                            <button
                              type="button"
                              disabled={busyId !== null}
                              onClick={() =>
                                void runAdminAction(
                                  {
                                    action: "admin_update_application",
                                    applicationId: app.id,
                                    fullName: draft.fullName,
                                    whatsapp: draft.whatsapp,
                                    email: draft.email,
                                    discordHandle: draft.discordHandle,
                                    adminNotes: draft.adminNotes,
                                    adminScore:
                                      draft.adminScore.trim() !== ""
                                        ? Number(draft.adminScore)
                                        : null,
                                  },
                                  `save-${app.id}`,
                                  `Ficha de ${draft.fullName} salva com sucesso!`,
                                )
                              }
                              className="min-h-[40px] px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono-code font-bold inline-flex items-center gap-2 cursor-pointer"
                            >
                              {busyId === `save-${app.id}` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              Salvar Alterações da Ficha
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== ABA 2: PAGAMENTOS & TRANSAÇÕES ==================== */}
        {tab === "pagamentos" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-[#090912]/90 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Histórico de Cobranças PIX (MercosulPay)
                </h3>
                <p className="text-xs text-zinc-400">
                  Todas as cobranças PIX geradas no Wizard de Recrutamento.
                </p>
              </div>
              <button
                type="button"
                disabled={busyId !== null}
                onClick={() =>
                  void runAdminAction(
                    { action: "admin_sync_payments" },
                    "sync-tab",
                    "Sincronização concluída com MercosulPay!",
                  )
                }
                className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono-code font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw
                  className={`w-4 h-4 ${busyId === "sync-tab" ? "animate-spin" : ""}`}
                />
                Reconciliar Pagamentos Pendentes
              </button>
            </div>

            {payments.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-[#090912]/70 p-10 text-center text-sm text-zinc-400">
                Nenhuma cobrança registrada até o momento.
              </div>
            ) : (
              <div className="space-y-2.5">
                {payments.map((p) => {
                  const candidate = appById.get(p.application_id);
                  const badge = PAYMENT_LABELS[p.status] || PAYMENT_LABELS.pending;
                  return (
                    <div
                      key={p.id}
                      className="rounded-xl border border-zinc-800 bg-[#080810]/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono-code text-xs font-bold text-white">
                            {brl(p.amount_cents)}
                          </span>
                          <span className="text-[11px] font-mono-code px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                            PIX • MercosulPay
                          </span>
                          <span
                            className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded border ${badge.badgeClass}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-300">
                          Candidato:{" "}
                          <strong className="text-white">
                            {candidate?.full_name || "—"}
                          </strong>{" "}
                          ({candidate?.discord_handle || "—"} •{" "}
                          {candidate?.operative_code || "—"})
                        </div>
                        <div className="text-[11px] font-mono-code text-zinc-500">
                          Ref: {p.provider_ref} • Criado: {fmtDate(p.created_at)}
                          {p.paid_at ? ` • Pago: ${fmtDate(p.paid_at)}` : ""}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {p.status !== "paid" && candidate && (
                          <button
                            type="button"
                            disabled={busyId !== null}
                            onClick={() =>
                              void runAdminAction(
                                {
                                  action: "admin_update_application",
                                  applicationId: candidate.id,
                                  paymentStatus: "paid",
                                },
                                `pay-row-${p.id}`,
                                "Pagamento confirmado manualmente!",
                              )
                            }
                            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 text-xs font-mono-code font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Confirmar Pago
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== ABA 3: CONFIGURAÇÕES DA OPERAÇÃO ==================== */}
        {tab === "config" && cfgDraft && (
          <div className="rounded-2xl border border-purple-500/30 bg-[#090912]/95 p-5 sm:p-8 space-y-6">
            <div>
              <span className="font-mono-code text-xs uppercase tracking-widest text-purple-400">
                [SYSTEM_CONFIG // FSOCIETY_SETTINGS]
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Configurações da Página & Recrutamento
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Qualquer alteração salva aqui atualiza imediatamente o site público e o Wizard de inscrição.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status Aberto / Fechado */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70 flex items-center justify-between gap-3">
                <div>
                  <strong className="text-sm text-white block">
                    Inscrições Abertas
                  </strong>
                  <span className="text-xs text-zinc-400">
                    Desative para encerrar o Wizard de inscrição
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={cfgDraft.recruitmentOpen}
                  onChange={(e) =>
                    setCfgDraft({ ...cfgDraft, recruitmentOpen: e.target.checked })
                  }
                  className="w-5 h-5 accent-purple-600"
                />
              </div>

              {/* Método de Pagamento PIX */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70 flex items-center justify-between gap-4">
                <div>
                  <strong className="text-sm text-white block">
                    Pagamento via PIX (MercosulPay)
                  </strong>
                  <span className="text-xs text-zinc-400">
                    Geração automática de QR Code e Copia e Cola
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={cfgDraft.pixEnabled}
                  onChange={(e) =>
                    setCfgDraft({ ...cfgDraft, pixEnabled: e.target.checked })
                  }
                  className="w-5 h-5 accent-emerald-500"
                />
              </div>

              {/* Valor do Sinal */}
              <div>
                <label className="block text-xs font-mono-code uppercase text-zinc-400 mb-1.5">
                  Valor do Sinal de Confiança (R$)
                </label>
                <input
                  type="number"
                  min={1}
                  step="1"
                  value={signalReaisInput}
                  onChange={(e) => setSignalReaisInput(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white font-mono-code"
                />
              </div>

              {/* Total de Vagas */}
              <div>
                <label className="block text-xs font-mono-code uppercase text-zinc-400 mb-1.5">
                  Total de Vagas Selecionadas
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={cfgDraft.totalSpots}
                  onChange={(e) =>
                    setCfgDraft({
                      ...cfgDraft,
                      totalSpots: Number(e.target.value) || 3,
                    })
                  }
                  className="w-full min-h-[44px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white font-mono-code"
                />
              </div>

              {/* Rótulo da Data Limite */}
              <div>
                <label className="block text-xs font-mono-code uppercase text-zinc-400 mb-1.5">
                  Rótulo do Prazo (ex: 10/11)
                </label>
                <input
                  type="text"
                  value={cfgDraft.deadlineLabel}
                  onChange={(e) =>
                    setCfgDraft({ ...cfgDraft, deadlineLabel: e.target.value })
                  }
                  className="w-full min-h-[44px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white font-mono-code"
                />
              </div>

              {/* Data ISO do Contador Regressivo */}
              <div>
                <label className="block text-xs font-mono-code uppercase text-zinc-400 mb-1.5">
                  Data/Hora do Contador (ISO)
                </label>
                <input
                  type="text"
                  value={cfgDraft.deadlineIso}
                  onChange={(e) =>
                    setCfgDraft({ ...cfgDraft, deadlineIso: e.target.value })
                  }
                  className="w-full min-h-[44px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white font-mono-code"
                />
              </div>

              {/* Link Discord */}
              <div>
                <label className="block text-xs font-mono-code uppercase text-zinc-400 mb-1.5">
                  Link do Convite Discord
                </label>
                <input
                  type="url"
                  value={cfgDraft.discordUrl}
                  onChange={(e) =>
                    setCfgDraft({ ...cfgDraft, discordUrl: e.target.value })
                  }
                  className="w-full min-h-[44px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white font-mono-code"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-xs font-mono-code uppercase text-zinc-400 mb-1.5">
                  @ do Instagram Oficial
                </label>
                <input
                  type="text"
                  value={cfgDraft.instagramHandle}
                  onChange={(e) => {
                    const handle = e.target.value.trim();
                    const clean = handle.replace(/^@+/, "");
                    setCfgDraft({
                      ...cfgDraft,
                      instagramHandle: handle.startsWith("@") ? handle : `@${clean}`,
                      instagramUrl: `https://instagram.com/${clean}`,
                    });
                  }}
                  className="w-full min-h-[44px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white font-mono-code"
                />
              </div>
            </div>

            {/* Banner de Aviso no Topo */}
            <div>
              <label className="block text-xs font-mono-code uppercase text-zinc-400 mb-1.5">
                Banner de Aviso no Topo do Site (Deixe em branco para ocultar)
              </label>
              <input
                type="text"
                value={cfgDraft.announcementBanner}
                onChange={(e) =>
                  setCfgDraft({ ...cfgDraft, announcementBanner: e.target.value })
                }
                placeholder="Ex: ÚLTIMAS HORAS! As inscrições encerram hoje às 23h59."
                className="w-full min-h-[44px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white"
              />
            </div>

            {/* Nova Senha Mestre Admin */}
            <div className="pt-4 border-t border-zinc-800">
              <label className="block text-xs font-mono-code uppercase text-zinc-400 mb-1.5">
                Alterar Chave Mestre do Painel Admin (Opcional — mín. 6 caracteres)
              </label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Deixe em branco para manter a chave atual"
                className="w-full max-w-md min-h-[44px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white font-mono-code"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={busyId !== null}
                onClick={() => {
                  const cents = Math.max(
                    100,
                    Math.round((Number(signalReaisInput.replace(",", ".")) || 10) * 100),
                  );
                  void runAdminAction(
                    {
                      action: "admin_update_settings",
                      ...cfgDraft,
                      signalAmountCents: cents,
                      ...(newAdminPassword.trim().length >= 6
                        ? { newAdminPassword: newAdminPassword.trim() }
                        : {}),
                    },
                    "save-settings",
                    "Configurações da operação salvas e publicadas!",
                  ).then((ok) => {
                    if (ok) setNewAdminPassword("");
                  });
                }}
                className="min-h-[46px] px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm inline-flex items-center gap-2 shadow-[0_0_25px_rgba(147,51,234,0.35)] cursor-pointer"
              >
                {busyId === "save-settings" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Configurações da Operação
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Cadastro Manual de Candidato */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-purple-500/40 bg-[#090912] p-5 sm:p-6 space-y-4 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                Adicionar Candidato Manualmente
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono-code text-zinc-400 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={newCandidate.fullName}
                  onChange={(e) =>
                    setNewCandidate({ ...newCandidate, fullName: e.target.value })
                  }
                  className="w-full min-h-[42px] rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono-code text-zinc-400 mb-1">
                  @Discord *
                </label>
                <input
                  type="text"
                  value={newCandidate.discordHandle}
                  onChange={(e) =>
                    setNewCandidate({ ...newCandidate, discordHandle: e.target.value })
                  }
                  placeholder="@usuario"
                  className="w-full min-h-[42px] rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white font-mono-code"
                />
              </div>
              <div>
                <label className="block text-xs font-mono-code text-zinc-400 mb-1">
                  WhatsApp *
                </label>
                <input
                  type="text"
                  value={newCandidate.whatsapp}
                  onChange={(e) =>
                    setNewCandidate({ ...newCandidate, whatsapp: e.target.value })
                  }
                  placeholder="(11) 99999-9999"
                  className="w-full min-h-[42px] rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white font-mono-code"
                />
              </div>
              <div>
                <label className="block text-xs font-mono-code text-zinc-400 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={newCandidate.email}
                  onChange={(e) =>
                    setNewCandidate({ ...newCandidate, email: e.target.value })
                  }
                  className="w-full min-h-[42px] rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono-code text-zinc-400 mb-1">
                  Status do Pagamento
                </label>
                <select
                  value={newCandidate.paymentStatus}
                  onChange={(e) =>
                    setNewCandidate({
                      ...newCandidate,
                      paymentStatus: e.target.value as "paid" | "pending",
                    })
                  }
                  className="w-full min-h-[42px] rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                >
                  <option value="paid">Pago (Confirmado)</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono-code text-zinc-400 mb-1">
                  Status de Seleção
                </label>
                <select
                  value={newCandidate.selectionStatus}
                  onChange={(e) =>
                    setNewCandidate({
                      ...newCandidate,
                      selectionStatus: e.target.value as ApplicationRow["selection_status"],
                    })
                  }
                  className="w-full min-h-[42px] rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                >
                  <option value="em_analise">Em Análise</option>
                  <option value="pre_selecionado">🔥 Pré-Selecionado</option>
                  <option value="entrevistado">📞 Entrevistado</option>
                  <option value="selecionado">⭐ SELECIONADO (Top 3)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-code text-zinc-400 mb-1">
                Anotações / Motivação
              </label>
              <textarea
                rows={3}
                value={newCandidate.motivation}
                onChange={(e) =>
                  setNewCandidate({ ...newCandidate, motivation: e.target.value })
                }
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-zinc-800 text-xs font-mono-code text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={busyId !== null}
                onClick={() =>
                  void runAdminAction(
                    {
                      action: "admin_create_application",
                      ...newCandidate,
                    },
                    "create-manual",
                    "Candidato adicionado com sucesso!",
                  ).then((ok) => {
                    if (ok) setShowNewModal(false);
                  })
                }
                className="min-h-[42px] px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono-code font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Salvar Candidato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
