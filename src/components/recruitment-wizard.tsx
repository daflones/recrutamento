"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Cpu,
  ExternalLink,
  Headphones,
  Laptop,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  QrCode,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  User,
  Wifi,
} from "lucide-react";

const DEFAULT_DISCORD_INVITE =
  process.env.NEXT_PUBLIC_DISCORD_INVITE || "https://discord.gg/qyEd3vrgd";

export interface PublicRecruitmentConfig {
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

interface WizardState {
  knowsAi: string;
  codesWithAi: string;
  aiToolsUsed: string[];
  experienceLevel: string;
  dailyAvailability: string;
  hasComputer: boolean | null;
  hasDiscord: boolean | null;
  hasMicrophone: boolean | null;
  hasInternet: boolean | null;
  osPreference: string;
  motivation: string;
  acceptsResponsibility: boolean;
  fullName: string;
  whatsapp: string;
  email: string;
  discordHandle: string;
  paymentMethod: "pix" | "card";
}

interface CheckoutResult {
  ok: boolean;
  alreadyPaid?: boolean;
  applicationId: string;
  operativeCode: string;
  reference?: string;
  method?: "pix" | "card";
  provider?: string;
  amountCents?: number;
  qrCode?: string | null;
  qrCodeImage?: string | null;
  expiresAt?: string | null;
  checkoutUrl?: string | null;
  status?: string;
  error?: string;
}

function formatWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
}

function formatBrl(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const AI_KNOWLEDGE_OPTIONS = [
  {
    id: "avancado",
    title: "Domino IA no dia a dia",
    desc: "Uso ChatGPT, Claude, Gemini ou outras IAs diariamente para resolver problemas, estruturar ideias e acelerar tarefas.",
  },
  {
    id: "intermediario",
    title: "Já uso IA com frequência",
    desc: "Sei fazer perguntas, gerar textos/códigos básicos e quero aprender a usar de forma profissional em projetos reais.",
  },
  {
    id: "iniciante",
    title: "Uso pouco, mas aprendo rápido",
    desc: "Já testei algumas ferramentas de IA e tenho total disposição para dominar o fluxo completo nos 30 dias.",
  },
  {
    id: "zero",
    title: "Estou começando do zero absoluto",
    desc: "Ainda não domino IA, mas tenho sede de aprender passo a passo na prática junto com o Mr. Robot.",
  },
];

const AI_CODING_OPTIONS = [
  {
    id: "ja_crio_apps",
    title: "Já crio sites/sistemas usando IA",
    desc: "Já utilizo IA (Cursor, Windsurf, Claude, ChatGPT, v0, Lovable etc.) para escrever código, corrigir bugs e subir projetos.",
  },
  {
    id: "scripts_e_ajustes",
    title: "Consigo gerar e editar código com ajuda da IA",
    desc: "Entendo a lógica básica ou peço para a IA gerar partes do código e vou testando até funcionar.",
  },
  {
    id: "estudando_logica",
    title: "Já estudei programação, mas quero dominar IA Dev",
    desc: "Conheço um pouco de HTML/JS/Python, mas ainda não construí um SaaS completo do zero ao lançamento.",
  },
  {
    id: "nunca_programei",
    title: "Ainda não sei programar — quero aprender na prática",
    desc: "Quero sair da teoria e aprender a construir aplicações reais usando IA como copiloto desde o primeiro dia.",
  },
];

const AI_TOOLS_LIST = [
  "ChatGPT / OpenAI",
  "Claude (Anthropic)",
  "Cursor / Windsurf",
  "GitHub Copilot",
  "v0 / Bolt / Lovable",
  "Devin / Agentes IA",
  "Ainda nenhuma",
];

export function RecruitmentWizard({
  config,
}: {
  config?: PublicRecruitmentConfig | null;
}) {
  const signalCents = config?.signalAmountCents ?? 1000;
  const signalFormatted = formatBrl(signalCents);
  const totalSpots = config?.totalSpots ?? 3;
  const deadlineLabel = config?.deadlineLabel ?? "10/11";
  const discordInvite = config?.discordUrl || DEFAULT_DISCORD_INVITE;
  const pixEnabled = config?.pixEnabled ?? true;
  const recruitmentOpen = config?.recruitmentOpen ?? true;

  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>({
    knowsAi: "",
    codesWithAi: "",
    aiToolsUsed: [],
    experienceLevel: "Iniciante com muita vontade",
    dailyAvailability: "2 a 4 horas por dia",
    hasComputer: true,
    hasDiscord: true,
    hasMicrophone: true,
    hasInternet: true,
    osPreference: "Windows",
    motivation: "",
    acceptsResponsibility: true,
    fullName: "",
    whatsapp: "",
    email: "",
    discordHandle: "",
    paymentMethod: "pix",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutResult | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [returnBanner, setReturnBanner] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const appId = params.get("fsociety_app");
    const ref = params.get("ref");
    const statusParam = params.get("checkout");

    if (appId || ref) {
      setStep(5);
      setReturnBanner("Verificando confirmação do seu pagamento PIX...");
      void verifyPaymentStatus(appId || "", ref || "");
    }
  }, []);

  useEffect(() => {
    if (!checkoutData || paymentConfirmed) return;
    if (!checkoutData.applicationId && !checkoutData.reference) return;

    const timer = setInterval(() => {
      void verifyPaymentStatus(
        checkoutData.applicationId,
        checkoutData.reference || "",
        true,
      );
    }, 4500);

    return () => clearInterval(timer);
  }, [checkoutData, paymentConfirmed]);

  async function verifyPaymentStatus(
    applicationId: string,
    reference: string,
    silent = false,
  ) {
    if (!silent) setCheckingStatus(true);
    try {
      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "status",
          applicationId,
          reference,
        }),
      });
      const data = await res.json();
      if (data.ok && data.application) {
        if (!checkoutData) {
          setCheckoutData({
            ok: true,
            applicationId: data.application.id,
            operativeCode: data.application.operative_code,
            reference: data.application.payment_ref,
            status: data.status,
          });
        }
        if (data.status === "paid") {
          setPaymentConfirmed(true);
          setReturnBanner(null);
        }
      }
    } catch {
      // ignora falha transitória de rede no polling
    } finally {
      if (!silent) setCheckingStatus(false);
    }
  }

  function toggleTool(tool: string) {
    setState((prev) => {
      const exists = prev.aiToolsUsed.includes(tool);
      return {
        ...prev,
        aiToolsUsed: exists
          ? prev.aiToolsUsed.filter((t) => t !== tool)
          : [...prev.aiToolsUsed, tool],
      };
    });
  }

  function validateStep(currentStep: number): boolean {
    setError("");
    if (currentStep === 1) {
      if (!state.knowsAi) {
        setError("Selecione seu nível de familiaridade com Inteligência Artificial.");
        return false;
      }
      if (!state.codesWithAi) {
        setError("Selecione sua experiência em programar ou criar projetos usando IA.");
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (
        state.hasComputer === null ||
        state.hasDiscord === null ||
        state.hasMicrophone === null ||
        state.hasInternet === null
      ) {
        setError("Responda todos os itens de equipamento e acesso.");
        return false;
      }
      if (!state.hasComputer || !state.hasInternet || !state.hasDiscord) {
        setError(
          "Para participar das sessões práticas de construção do SaaS, é indispensável ter computador, internet e acesso ao Discord.",
        );
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      if (state.motivation.trim().length < 10) {
        setError(
          "Escreva brevemente (mínimo 10 caracteres) por que você quer construir e assumir esse SaaS.",
        );
        return false;
      }
      if (!state.acceptsResponsibility) {
        setError("Confirme que está ciente do compromisso de 30 dias e da continuidade do SaaS.");
        return false;
      }
      return true;
    }

    if (currentStep === 4) {
      if (state.fullName.trim().length < 2) {
        setError("Informe seu nome completo.");
        return false;
      }
      if (state.whatsapp.replace(/\D/g, "").length < 10) {
        setError("Informe seu número de WhatsApp válido com DDD (ex: 11 99999-9999).");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
        setError("Informe um endereço de e-mail válido.");
        return false;
      }
      const cleanDiscord = state.discordHandle.trim().replace(/^@+/, "");
      if (cleanDiscord.length < 2) {
        setError("Informe seu @usuario do Discord certinho para localizarmos você no servidor.");
        return false;
      }
      return true;
    }

    return true;
  }

  function nextStep() {
    if (validateStep(step)) {
      setStep((s) => Math.min(5, s + 1));
    }
  }

  function prevStep() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleGeneratePayment(selectedMethod?: "pix" | "card") {
    const methodToUse = selectedMethod ?? state.paymentMethod;
    if (selectedMethod) {
      setState((prev) => ({ ...prev, paymentMethod: selectedMethod }));
    }
    if (!validateStep(4)) {
      setStep(4);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const normalizedDiscord = state.discordHandle.trim().startsWith("@")
        ? state.discordHandle.trim()
        : `@${state.discordHandle.trim()}`;

      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkout",
          applicationId: checkoutData?.applicationId,
          paymentMethod: methodToUse,
          fullName: state.fullName.trim(),
          email: state.email.trim().toLowerCase(),
          whatsapp: state.whatsapp.trim(),
          discordHandle: normalizedDiscord,
          knowsAi: state.knowsAi,
          codesWithAi: state.codesWithAi,
          hasComputer: Boolean(state.hasComputer),
          hasDiscord: Boolean(state.hasDiscord),
          hasMicrophone: Boolean(state.hasMicrophone),
          hasInternet: Boolean(state.hasInternet),
          experienceLevel: state.experienceLevel,
          dailyAvailability: state.dailyAvailability,
          motivation: state.motivation.trim(),
          wizardAnswers: {
            knowsAi: state.knowsAi,
            codesWithAi: state.codesWithAi,
            aiToolsUsed: state.aiToolsUsed,
            experienceLevel: state.experienceLevel,
            dailyAvailability: state.dailyAvailability,
            osPreference: state.osPreference,
            equipment: {
              computer: state.hasComputer,
              discord: state.hasDiscord,
              microphone: state.hasMicrophone,
              internet: state.hasInternet,
            },
            acceptsResponsibility: state.acceptsResponsibility,
            submittedAt: new Date().toISOString(),
          },
          returnOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
        }),
      });

      const data = (await res.json()) as CheckoutResult;
      if (!res.ok || !data.ok) {
        setError(data.error || "Não foi possível gerar o pagamento. Tente novamente.");
        return;
      }

      setCheckoutData(data);
      if (data.alreadyPaid || data.status === "paid") {
        setPaymentConfirmed(true);
        return;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro de conexão ao processar sua inscrição.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function copyPixCode(code: string) {
    await navigator.clipboard.writeText(code).catch(() => {});
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  }

  const stepsMeta = [
    { num: 1, label: "IA & Código", shortLabel: "IA", tag: "AI_SCAN" },
    { num: 2, label: "Equipamento", shortLabel: "Setup", tag: "HARDWARE" },
    { num: 3, label: "Missão SaaS", shortLabel: "Missão", tag: "PROTOCOL" },
    { num: 4, label: "Credenciais", shortLabel: "Dados", tag: "IDENTITY" },
    { num: 5, label: `Sinal ${signalFormatted}`, shortLabel: "Sinal", tag: "COMMIT" },
  ];

  if (!recruitmentOpen) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-[#08080f]/95 p-6 sm:p-10 text-center space-y-4">
        <span className="font-mono-code text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
          RECRUTAMENTO ENCERRADO // FSOCIETY00.DAT
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold text-white">
          As inscrições para esta operação foram encerradas
        </h3>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto">
          Entre na comunidade oficial do Discord para acompanhar os próximos projetos práticos da F.SOCIETY.DEV.
        </p>
        <div className="pt-2">
          <a
            href={discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition min-h-[46px]"
          >
            Entrar na Comunidade no Discord
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-purple-500/40 bg-[#08080f]/95 shadow-[0_0_60px_rgba(147,51,234,0.18)] overflow-hidden">
      {/* Top Bar do Wizard */}
      <div className="bg-[#0e0e1a] border-b border-purple-500/30 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-400 shrink-0">
            <Terminal className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono-code text-[11px] sm:text-xs uppercase tracking-wider text-purple-400 font-semibold truncate">
                WIZARD // PROTOCOLO F.SOCIETY.DEV
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                FSOCIETY00.DAT // ENCRYPTED
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
              Até <strong className="text-zinc-200">{deadlineLabel}</strong> •{" "}
              <strong className="text-purple-400">{totalSpots} vagas</strong>
            </p>
          </div>
        </div>
        <div className="font-mono-code text-[11px] sm:text-xs text-zinc-400 bg-black/50 px-2.5 py-1 rounded-lg border border-zinc-800 shrink-0 tabular-nums">
          ETAPA <span className="text-purple-400 font-bold">0{step}</span>/05
        </div>
      </div>

      {/* Stepper de progresso responsivo */}
      <div className="grid grid-cols-5 border-b border-zinc-800/80 bg-[#06060b]">
        {stepsMeta.map((item) => {
          const active = step === item.num;
          const done = step > item.num || paymentConfirmed;
          return (
            <button
              key={item.num}
              type="button"
              onClick={() => {
                if (item.num < step) setStep(item.num);
              }}
              disabled={item.num > step}
              className={`min-h-[50px] py-2.5 px-1 sm:px-2 flex flex-col items-center justify-center border-r last:border-r-0 border-zinc-800/60 transition ${
                active
                  ? "bg-purple-600/15 text-purple-300 border-b-2 border-b-purple-500"
                  : done
                  ? "bg-emerald-950/20 text-emerald-400 cursor-pointer hover:bg-emerald-950/30"
                  : "text-zinc-600 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-1 font-mono-code text-[10px] uppercase tracking-wider">
                {done ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span>0{item.num}</span>
                )}
                <span className="hidden md:inline">.{item.tag}</span>
              </div>
              <span className="text-[11px] sm:text-xs font-medium mt-0.5 truncate max-w-full">
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-8">
        {returnBanner && (
          <div className="mb-5 rounded-xl border border-purple-500/40 bg-purple-950/30 p-3.5 sm:p-4 text-xs sm:text-sm text-purple-200 flex items-center justify-between gap-3">
            <span>{returnBanner}</span>
            {checkingStatus && (
              <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
            )}
          </div>
        )}

        {/* ==================== ETAPA 1: IA & PROGRAMAÇÃO ==================== */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="font-mono-code text-[11px] uppercase tracking-widest text-purple-400">
                [STEP 01 // AI_&_CODE_READINESS]
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white mt-1">
                Inteligência Artificial & Programação
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                Não importa se você está começando agora ou já tem experiência. Precisamos mapear seu momento atual para estruturar as funções da equipe.
              </p>
            </div>

            {/* Pergunta 1: Sabe usar IA? */}
            <div className="space-y-2.5">
              <label className="block text-xs sm:text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                1. Você sabe usar Inteligência Artificial? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {AI_KNOWLEDGE_OPTIONS.map((opt) => {
                  const selected = state.knowsAi === opt.title;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setState((s) => ({ ...s, knowsAi: opt.title }))}
                      className={`text-left p-3.5 sm:p-4 rounded-xl border transition cursor-pointer min-h-[52px] ${
                        selected
                          ? "border-purple-500 bg-purple-600/15 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-white">
                          {opt.title}
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            selected
                              ? "border-purple-400 bg-purple-500 text-white"
                              : "border-zinc-600"
                          }`}
                        >
                          {selected && <Check className="w-2.5 h-2.5" />}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 leading-relaxed">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pergunta 2: Sabe programar usando IA? */}
            <div className="space-y-2.5">
              <label className="block text-xs sm:text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                2. Você já sabe programar ou criar aplicações usando IA? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {AI_CODING_OPTIONS.map((opt) => {
                  const selected = state.codesWithAi === opt.title;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setState((s) => ({ ...s, codesWithAi: opt.title }))}
                      className={`text-left p-3.5 sm:p-4 rounded-xl border transition cursor-pointer min-h-[52px] ${
                        selected
                          ? "border-purple-500 bg-purple-600/15 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-white">
                          {opt.title}
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            selected
                              ? "border-purple-400 bg-purple-500 text-white"
                              : "border-zinc-600"
                          }`}
                        >
                          {selected && <Check className="w-2.5 h-2.5" />}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 leading-relaxed">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ferramentas que já teve contato */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono-code uppercase tracking-wider text-zinc-400">
                Quais ferramentas de IA você já utilizou? (Opcional)
              </label>
              <div className="flex flex-wrap gap-2">
                {AI_TOOLS_LIST.map((tool) => {
                  const active = state.aiToolsUsed.includes(tool);
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-mono-code border transition cursor-pointer ${
                        active
                          ? "bg-purple-600/25 border-purple-400 text-purple-200"
                          : "bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {active ? "✓ " : "+ "}
                      {tool}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ETAPA 2: EQUIPAMENTO & SETUP ==================== */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <span className="font-mono-code text-[11px] uppercase tracking-widest text-purple-400">
                [STEP 02 // HARDWARE_&_COMMS_VERIFICATION]
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white mt-1">
                Verificação de Equipamento & Comunicação
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                Não será apenas assistir alguém programando. Vocês vão colocar a mão na massa em chamadas ao vivo no Discord. Confirme sua estrutura:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {/* Computador */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white">
                      Possui Computador ou Notebook?
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Necessário para programar e configurar o servidor
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setState((s) => ({ ...s, hasComputer: true }))}
                    className={`min-h-[42px] py-2 rounded-lg text-xs font-mono-code font-semibold border transition cursor-pointer ${
                      state.hasComputer === true
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    [SIM, POSSUO]
                  </button>
                  <button
                    type="button"
                    onClick={() => setState((s) => ({ ...s, hasComputer: false }))}
                    className={`min-h-[42px] py-2 rounded-lg text-xs font-mono-code font-semibold border transition cursor-pointer ${
                      state.hasComputer === false
                        ? "bg-red-500/20 border-red-500 text-red-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    [NÃO POSSUO]
                  </button>
                </div>
              </div>

              {/* Acesso ao Discord */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white">
                      Possui acesso ao Discord?
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Toda a operação ocorre no servidor fsociety00.dat
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setState((s) => ({ ...s, hasDiscord: true }))}
                    className={`min-h-[42px] py-2 rounded-lg text-xs font-mono-code font-semibold border transition cursor-pointer ${
                      state.hasDiscord === true
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    [SIM, USO DISCORD]
                  </button>
                  <button
                    type="button"
                    onClick={() => setState((s) => ({ ...s, hasDiscord: false }))}
                    className={`min-h-[42px] py-2 rounded-lg text-xs font-mono-code font-semibold border transition cursor-pointer ${
                      state.hasDiscord === false
                        ? "bg-red-500/20 border-red-500 text-red-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    [NÃO TENHO]
                  </button>
                </div>
              </div>

              {/* Microfone */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white">
                      Possui Microfone funcional?
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Para alinhamento e calls práticas na Sala de Reuniões
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setState((s) => ({ ...s, hasMicrophone: true }))}
                    className={`min-h-[42px] py-2 rounded-lg text-xs font-mono-code font-semibold border transition cursor-pointer ${
                      state.hasMicrophone === true
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    [SIM, TENHO MIC]
                  </button>
                  <button
                    type="button"
                    onClick={() => setState((s) => ({ ...s, hasMicrophone: false }))}
                    className={`min-h-[42px] py-2 rounded-lg text-xs font-mono-code font-semibold border transition cursor-pointer ${
                      state.hasMicrophone === false
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    [VOU PROVIDENCIAR]
                  </button>
                </div>
              </div>

              {/* Internet */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white">
                      Possui acesso estável à Internet?
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Para conexão com VPS, deploys e compartilhamento de tela
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setState((s) => ({ ...s, hasInternet: true }))}
                    className={`min-h-[42px] py-2 rounded-lg text-xs font-mono-code font-semibold border transition cursor-pointer ${
                      state.hasInternet === true
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    [SIM, ESTÁVEL]
                  </button>
                  <button
                    type="button"
                    onClick={() => setState((s) => ({ ...s, hasInternet: false }))}
                    className={`min-h-[42px] py-2 rounded-lg text-xs font-mono-code font-semibold border transition cursor-pointer ${
                      state.hasInternet === false
                        ? "bg-red-500/20 border-red-500 text-red-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    [NÃO POSSUO]
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-mono-code uppercase text-zinc-400 mb-1.5">
                  Disponibilidade diária nos próximos 30 dias
                </label>
                <select
                  value={state.dailyAvailability}
                  onChange={(e) =>
                    setState((s) => ({ ...s, dailyAvailability: e.target.value }))
                  }
                  className="w-full min-h-[46px] rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="1 a 2 horas por dia">
                    1 a 2 horas por dia (Foco noturno/pós-trabalho)
                  </option>
                  <option value="2 a 4 horas por dia">
                    2 a 4 horas por dia (Dedicação consistente)
                  </option>
                  <option value="4 a 6 horas por dia">
                    4 a 6 horas por dia (Meio período livre)
                  </option>
                  <option value="+6 horas por dia (Full-time)">
                    +6 horas por dia (Imersão total)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-mono-code uppercase text-zinc-400 mb-1.5">
                  Sistema Operacional Principal
                </label>
                <select
                  value={state.osPreference}
                  onChange={(e) =>
                    setState((s) => ({ ...s, osPreference: e.target.value }))
                  }
                  className="w-full min-h-[46px] rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="Windows">Windows (10 / 11)</option>
                  <option value="Linux">Linux (Ubuntu / Debian / Arch / Kali)</option>
                  <option value="macOS">macOS</option>
                  <option value="Dual Boot (Windows + Linux)">Dual Boot / WSL2</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ETAPA 3: COMPROMETIMENTO & MOTIVAÇÃO ==================== */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <span className="font-mono-code text-[11px] uppercase tracking-widest text-purple-400">
                [STEP 03 // OPERATIVE_COMMITMENT]
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white mt-1">
                Comprometimento & Continuidade do SaaS
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                Ao final dos 30 dias, os {totalSpots} participantes terão construído um produto digital funcional pronto para o mercado — e a responsabilidade pela continuidade ficará nas mãos de vocês.
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-2">
                Por que você merece ser um dos {totalSpots} selecionados para construir esse SaaS comigo? *
              </label>
              <textarea
                rows={4}
                value={state.motivation}
                onChange={(e) => setState((s) => ({ ...s, motivation: e.target.value }))}
                placeholder="Conte um pouco sobre seu objetivo, sua vontade de aprender/construir um SaaS real e como você pretende se dedicar nesses 30 dias..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 sm:p-4 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border border-purple-500/30 bg-purple-950/15 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.acceptsResponsibility}
                  onChange={(e) =>
                    setState((s) => ({ ...s, acceptsResponsibility: e.target.checked }))
                  }
                  className="mt-1 w-4 h-4 accent-purple-600 rounded shrink-0"
                />
                <span className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  <strong>Termo de Comprometimento F.SOCIETY.DEV:</strong> Estou ciente de que serão selecionadas apenas{" "}
                  <strong>{totalSpots} pessoas</strong>, que o projeto exige colocar a mão na massa durante 30 dias (VPS, domínio, código, banco de dados, pagamentos e lançamento) e que os selecionados assumirão a continuidade do SaaS.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ==================== ETAPA 4: CAPTAÇÃO DE CONTATOS ==================== */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <span className="font-mono-code text-[11px] uppercase tracking-widest text-purple-400">
                [STEP 04 // IDENTITY_&_CONTACT_CAPTURE]
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white mt-1">
                Credenciais de Contato do Candidato
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                Preencha seus dados com atenção total. É por meio do seu WhatsApp, E-mail e principalmente do seu{" "}
                <strong>@ certinho do Discord</strong> que faremos o contato oficial com os recrutados.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-mono-code uppercase text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  Nome Completo (ou Nome + Nick) *
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  value={state.fullName}
                  onChange={(e) => setState((s) => ({ ...s, fullName: e.target.value }))}
                  placeholder="Ex: Lucas Silva"
                  className="w-full min-h-[48px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-mono-code uppercase text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Número do WhatsApp (com DDD) *
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={state.whatsapp}
                  onChange={(e) =>
                    setState((s) => ({ ...s, whatsapp: formatWhatsapp(e.target.value) }))
                  }
                  placeholder="(11) 99999-9999"
                  className="w-full min-h-[48px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none font-mono-code"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-mono-code uppercase text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  Seu Melhor E-mail *
                </label>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  value={state.email}
                  onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
                  placeholder="voce@email.com"
                  className="w-full min-h-[48px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Discord Handle */}
              <div>
                <label className="block text-xs font-mono-code uppercase text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  Conta do Discord (@ certinho) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 font-mono-code font-bold text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={state.discordHandle.replace(/^@+/, "")}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        discordHandle: e.target.value.replace(/\s+/g, "").replace(/^@+/, ""),
                      }))
                    }
                    placeholder="seu_usuario_discord"
                    className="w-full min-h-[48px] rounded-xl bg-zinc-950 border border-zinc-800 pl-8 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none font-mono-code"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                  Dica: No Discord, toque no seu perfil para copiar seu nome de usuário único (ex:{" "}
                  <code className="text-purple-300">@joseneto.ai</code>).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ETAPA 5: PAGAMENTO R$ 10,00 ==================== */}
        {step === 5 && (
          <div className="space-y-5">
            {paymentConfirmed ? (
              <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/20 p-5 sm:p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-2">
                  <span className="inline-block font-mono-code text-[10px] sm:text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    RECRUTAMENTO CONFIRMADO // SINAL APROVADO
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2">
                    WELCOME TO F.SOCIETY.DEV
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
                    Seu cadastro e seu sinal de comprometimento foram validados com a credencial operacional abaixo:
                  </p>
                </div>

                <div className="max-w-md mx-auto rounded-xl bg-black/70 border border-emerald-500/30 p-4 font-mono-code text-left text-xs space-y-1.5">
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-500">OPERATIVE_CODE:</span>
                    <span className="text-emerald-400 font-bold">
                      {checkoutData?.operativeCode || "FSOC-VERIFIED"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-500">CANDIDATO:</span>
                    <span className="text-zinc-200 truncate">{state.fullName || "Confirmado"}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-500">DISCORD:</span>
                    <span className="text-purple-400 truncate">
                      @{state.discordHandle.replace(/^@+/, "")}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-500">STATUS:</span>
                    <span className="text-emerald-400">APTO PARA SELEÇÃO ({deadlineLabel})</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={discordInvite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-[0_0_30px_rgba(147,51,234,0.4)] transition"
                  >
                    Entrar Agora no Discord (#recrutamento)
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div>
                    <span className="font-mono-code text-[11px] uppercase tracking-widest text-purple-400">
                      [STEP 05 // TRUST_SIGNAL_VERIFICATION]
                    </span>
                    <h3 className="text-lg sm:text-2xl font-bold text-white mt-1">
                      Sinal de Confiança & Comprometimento
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                      Para garantir que apenas candidatos reais e comprometidos concorram às{" "}
                      <strong className="text-white">{totalSpots} vagas</strong> (evitando curiosos que tiram a vaga de quem realmente quer construir), confirme sua inscrição com o sinal simbólico de{" "}
                      <strong className="text-emerald-400">{signalFormatted}</strong>.
                    </p>
                  </div>
                  <div className="shrink-0 rounded-xl border border-purple-500/40 bg-purple-950/25 px-4 py-3 text-center">
                    <span className="block text-[10px] font-mono-code uppercase tracking-wider text-purple-300">
                      SINAL DE COMPROMETIMENTO
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono-code tabular-nums">
                      {signalFormatted}
                    </span>
                    <span className="block text-[11px] text-emerald-400 font-mono-code">
                      Taxa única • Cadastro imediato
                    </span>
                  </div>
                </div>

                {/* Resumo das Credenciais */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-code">
                  <div className="min-w-0">
                    <span className="text-zinc-500 block text-[10px]">CANDIDATO</span>
                    <span className="text-zinc-200 font-semibold truncate block">
                      {state.fullName}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-zinc-500 block text-[10px]">DISCORD</span>
                    <span className="text-purple-400 font-semibold truncate block">
                      @{state.discordHandle.replace(/^@+/, "")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-zinc-500 block text-[10px]">WHATSAPP</span>
                    <span className="text-zinc-200 truncate block">{state.whatsapp}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-zinc-500 block text-[10px]">E-MAIL</span>
                    <span className="text-zinc-200 truncate block">{state.email}</span>
                  </div>
                </div>

                {/* Pagamento Único via PIX (MercosulPay) */}
                {pixEnabled && !checkoutData?.qrCode && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleGeneratePayment("pix")}
                    className="w-full p-5 sm:p-6 rounded-2xl border border-emerald-500 bg-emerald-950/20 hover:bg-emerald-950/30 shadow-[0_0_30px_rgba(16,185,129,0.18)] text-left transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                        <QrCode className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="inline-block text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 mb-1">
                          PIX INSTANTÂNEO // LIBERAÇÃO AUTOMÁTICA
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          Pagar {signalFormatted} via PIX
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          Gera QR Code e código PIX Copia e Cola na hora. Confirmação automática em segundos.
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 min-h-[46px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-mono-code font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Gerando PIX...
                        </>
                      ) : (
                        <>
                          GERAR QR CODE PIX <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </div>
                  </button>
                )}

                {/* Painel do QR Code PIX gerado */}
                {checkoutData && checkoutData.method === "pix" && checkoutData.qrCode && (
                  <div className="rounded-2xl border border-emerald-500/40 bg-[#060d0a] p-4 sm:p-6 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="font-mono-code text-xs sm:text-sm font-bold text-emerald-300">
                          COBRANÇA PIX GERADA — {signalFormatted} ({checkoutData.operativeCode})
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono-code text-emerald-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Aguardando confirmação automática...
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                      {checkoutData.qrCodeImage && (
                        <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl mx-auto">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={checkoutData.qrCodeImage}
                            alt="QR Code PIX F.SOCIETY.DEV"
                            className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                          />
                        </div>
                      )}

                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <label className="block text-xs font-mono-code uppercase text-zinc-400 mb-1.5">
                            Código PIX Copia e Cola:
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              readOnly
                              value={checkoutData.qrCode}
                              className="w-full min-h-[44px] rounded-xl bg-black/80 border border-emerald-500/30 px-3.5 py-2.5 text-xs font-mono-code text-emerald-200 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => void copyPixCode(checkoutData.qrCode!)}
                              className="shrink-0 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer"
                            >
                              {copiedPix ? (
                                <>
                                  <Check className="w-4 h-4" /> Código Copiado!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" /> Copiar Código PIX
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <button
                            type="button"
                            disabled={checkingStatus}
                            onClick={() =>
                              void verifyPaymentStatus(
                                checkoutData.applicationId,
                                checkoutData.reference || "",
                              )
                            }
                            className="w-full sm:w-auto min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono-code transition cursor-pointer"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${checkingStatus ? "animate-spin" : ""}`}
                            />
                            Já paguei — Verificar confirmação agora
                          </button>

                          <a
                            href={discordInvite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 underline font-mono-code py-1"
                          >
                            Entrar no Discord da comunidade
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Mensagem de erro de validação */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-xs sm:text-sm text-red-200 flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Rodapé de navegação do Wizard */}
        {!paymentConfirmed && (
          <div className="mt-7 pt-5 border-t border-zinc-800/80 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="min-h-[46px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 text-xs sm:text-sm font-mono-code transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar Etapa
              </button>
            ) : (
              <div className="text-[11px] font-mono-code text-zinc-500 flex items-center justify-center sm:justify-start gap-1.5 py-1">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                Dados criptografados • F.SOCIETY.DEV
              </div>
            )}

            {step < 5 && (
              <button
                type="button"
                onClick={nextStep}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-[0_0_25px_rgba(147,51,234,0.35)] transition cursor-pointer"
              >
                Avançar para Etapa 0{step + 1}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
