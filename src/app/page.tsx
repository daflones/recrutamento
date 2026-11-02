"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Code2,
  CreditCard,
  Database,
  ExternalLink,
  Eye,
  Globe,
  Layers,
  Lock,
  Menu,
  MessageSquare,
  Palette,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Terminal,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { InteractiveTerminal } from "@/components/interactive-terminal";
import {
  RecruitmentWizard,
  type PublicRecruitmentConfig,
} from "@/components/recruitment-wizard";

const DEFAULT_DISCORD_INVITE =
  process.env.NEXT_PUBLIC_DISCORD_INVITE || "https://discord.gg/qyEd3vrgd";
const DEFAULT_INSTAGRAM_URL = "https://instagram.com/daflones_";

const SUBLIMINAL_MESSAGES = [
  "// HELLO, FRIEND. ESTÁ PRONTO PARA SAIR DA MATRIX DOS CURSOS TEÓRICOS?",
  "// CONTROL IS AN ILLUSION. QUEM CONSTRÓI O PRÓPRIO SAAS CRIA O PRÓPRIO FUTURO.",
  "// WE ARE NOT JUST LEARNING TO CODE. WE ARE LEARNING TO BUILD.",
  "// 30 DIAS. 3 INTEGRANTES. 1 APLICAÇÃO SAAS REAL DO ZERO AO LANÇAMENTO.",
  "// AO FINAL DO PROJETO, A CONTINUIDADE DO SAAS FICARÁ NAS MÃOS DOS 3 SELECIONADOS.",
  "// INSCRIÇÕES ABERTAS ATÉ 10/11 • fsociety00.dat // #recrutamento",
];

const PRACTICAL_STAGES = [
  {
    icon: Server,
    code: "STAGE_01",
    title: "Configuração de servidores VPS e hospedagem",
    desc: "Provisionamento de servidor Linux real, segurança, containers, deploy contínuo e infraestrutura de produção.",
  },
  {
    icon: Globe,
    code: "STAGE_02",
    title: "Registro de domínios, DNS, redirecionamentos e HTTPS",
    desc: "Apontamento de zonas DNS, certificados SSL/TLS, Cloudflare, proteção contra ataques e rotas customizadas.",
  },
  {
    icon: Database,
    code: "STAGE_03",
    title: "Backend, APIs e banco de dados",
    desc: "Modelagem PostgreSQL/Supabase, Row Level Security (RLS), Edge Functions, webhooks e autenticação segura.",
  },
  {
    icon: Code2,
    code: "STAGE_04",
    title: "Desenvolvimento de sites e aplicações",
    desc: "Engenharia de software moderna combinada com IA de ponta para construir rápido, com código limpo e escalável.",
  },
  {
    icon: Palette,
    code: "STAGE_05",
    title: "Interface, funcionalidades e identidade visual",
    desc: "Design de produto profissional, experiência do usuário (UX/UI) pensada para retenção e percepção de alto valor.",
  },
  {
    icon: CreditCard,
    code: "STAGE_06",
    title: "Integração de pagamentos e monetização",
    desc: "Checkout transparente e recorrente com PIX e Cartão, conciliação automática via webhooks e liberação de acesso.",
  },
  {
    icon: Rocket,
    code: "STAGE_07",
    title: "Lançamento, marketing e aquisição de usuários",
    desc: "Posicionamento, funil de vendas, validação com usuários reais, criação de conteúdo e escala do SaaS.",
  },
];

const PIPELINE_STEPS = [
  { num: "01", label: "Servidor", sub: "VPS & Deploy", icon: Server },
  { num: "02", label: "Domínio", sub: "DNS & HTTPS", icon: Globe },
  { num: "03", label: "Código", sub: "Full-Stack + IA", icon: Code2 },
  { num: "04", label: "Banco de Dados", sub: "Supabase & APIs", icon: Database },
  { num: "05", label: "Lançamento", sub: "Go-Live Real", icon: Rocket },
  { num: "06", label: "Marketing & Escala", sub: "Faturamento", icon: TrendingUp },
];

export default function FsocietyRecruitmentPage() {
  const [subliminalIdx, setSubliminalIdx] = useState(0);
  const [glitchFlash, setGlitchFlash] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState<PublicRecruitmentConfig | null>(null);
  const [countdown, setCountdown] = useState({
    days: 8,
    hours: 9,
    minutes: 38,
    seconds: 0,
  });

  useEffect(() => {
    fetch("/api/recruitment")
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok && data.settings) {
          setConfig(data.settings as PublicRecruitmentConfig);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSubliminalIdx((prev) => (prev + 1) % SUBLIMINAL_MESSAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const targetIso = config?.deadlineIso || "2026-11-10T23:59:59-03:00";
    const deadline = new Date(targetIso).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, deadline - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds });
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [config?.deadlineIso]);

  function triggerSubliminalFlash(msg: string) {
    setGlitchFlash(msg);
    setTimeout(() => setGlitchFlash(null), 950);
  }

  function scrollToWizard() {
    setMobileMenuOpen(false);
    const el = document.getElementById("recrutamento");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  const discordInvite = config?.discordUrl || DEFAULT_DISCORD_INVITE;
  const instagramUrl = config?.instagramUrl || DEFAULT_INSTAGRAM_URL;
  const instagramHandle = config?.instagramHandle || "@daflones_";
  const totalSpots = config?.totalSpots ?? 3;
  const deadlineLabel = config?.deadlineLabel || "10/11";

  return (
    <div className="min-h-screen relative cyber-grid pb-20 sm:pb-0">
      {/* Flash Subliminar estilo Mr. Robot */}
      {glitchFlash && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/80 backdrop-blur-[2px] p-4">
          <div className="text-center px-5 py-4 border border-red-500/60 bg-black/95 shadow-[0_0_80px_rgba(239,68,68,0.45)] max-w-lg w-full">
            <p className="font-mono-code text-[10px] sm:text-xs uppercase tracking-[0.25em] text-red-500 mb-1">
              [SUBLIMINAL_INTERRUPT // FSOCIETY00.DAT]
            </p>
            <p className="font-hacker text-xl sm:text-4xl font-bold text-white tracking-wider">
              {glitchFlash}
            </p>
          </div>
        </div>
      )}

      {/* Banner de Aviso Customizado pelo Admin (se configurado) */}
      {config?.announcementBanner && (
        <div className="bg-gradient-to-r from-purple-900/90 via-violet-900/90 to-red-900/90 border-b border-purple-400/30 px-4 py-2 text-center text-xs font-mono-code text-white">
          ⚡ {config.announcementBanner}
        </div>
      )}

      {/* Top System Ticker Bar */}
      <div className="bg-[#090912] border-b border-purple-500/25 px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] font-mono-code">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-purple-300 min-w-0 flex-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-zinc-500 hidden sm:inline shrink-0">[fsociety00.dat]</span>
            <span className="truncate">{SUBLIMINAL_MESSAGES[subliminalIdx]}</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400 shrink-0">
            <span className="hidden md:inline text-emerald-400">
              VAGAS: <strong>0{totalSpots} SELECIONADOS</strong>
            </span>
            <span className="text-purple-400 font-semibold">
              ATÉ {deadlineLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Navbar Principal com Logo fsociety + Menu Mobile */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#050508]/90 border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          <a href="#" className="flex items-center gap-2.5 sm:gap-3.5 group min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-fsociety.jpg"
                alt="F.SOCIETY.DEV Logo"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-hacker text-lg sm:text-2xl font-bold tracking-wider text-white truncate">
                  F.SOCIETY<span className="text-purple-500">.DEV</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
                  00.dat
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-mono-code uppercase tracking-[0.16em] sm:tracking-[0.22em] text-zinc-400 truncate">
                APRENDA • DESENVOLVA • FATURE
              </p>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono-code uppercase tracking-wider text-zinc-400">
            <a href="#manifesto" className="hover:text-purple-400 transition">
              01. Manifesto
            </a>
            <a href="#arquitetura" className="hover:text-purple-400 transition">
              02. O Que Vamos Construir
            </a>
            <a href="#mentor" className="hover:text-purple-400 transition">
              03. Mr. Robot
            </a>
            <a href="#equipe" className="hover:text-purple-400 transition">
              04. As {totalSpots} Vagas
            </a>
            <a
              href="#recrutamento"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition"
            >
              05. Wizard de Inscrição
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:border-purple-500/40 text-xs font-mono-code text-zinc-300 transition min-h-[40px]"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              Discord
            </a>
            <button
              type="button"
              onClick={scrollToWizard}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-[0_0_25px_rgba(147,51,234,0.35)] transition cursor-pointer min-h-[40px]"
            >
              <span>Recrutamento</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Drawer de Navegação Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-800 bg-[#080810]/98 px-4 py-4 space-y-2 font-mono-code text-xs">
            <a
              href="#manifesto"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-zinc-900 text-zinc-200 min-h-[44px]"
            >
              <span>01. Manifesto Oficial (#recrutamento)</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </a>
            <a
              href="#arquitetura"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-zinc-900 text-zinc-200 min-h-[44px]"
            >
              <span>02. Arquitetura & Plano de 30 Dias</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </a>
            <a
              href="#mentor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-zinc-900 text-zinc-200 min-h-[44px]"
            >
              <span>03. O Mentor (Mr. Robot)</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </a>
            <a
              href="#equipe"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-zinc-900 text-zinc-200 min-h-[44px]"
            >
              <span>04. As {totalSpots} Vagas & Continuidade</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </a>
            <a
              href="#recrutamento"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-3 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-200 font-bold min-h-[44px]"
            >
              <span>05. Iniciar Wizard de Inscrição</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </a>
            <div className="pt-2 grid grid-cols-2 gap-2">
              <a
                href={discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 min-h-[42px]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                Discord
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 min-h-[42px]"
              >
                <span>{instagramHandle}</span>
                <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-7 pb-14 sm:pt-16 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Coluna Esquerda: Headline + Countdown + CTAs */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/40 bg-purple-950/30 text-purple-300 text-[11px] sm:text-xs font-mono-code">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>🖥️ F.SOCIETY.DEV — RECRUTAMENTO ATÉ {deadlineLabel}</span>
              </div>

              <h1 className="text-[28px] sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] sm:leading-[1.08]">
                Não vamos apenas estudar programação.{" "}
                <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Vamos construir um SaaS de verdade.
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
                Durante <strong className="text-white">30 dias</strong>, vou selecionar{" "}
                <strong className="text-purple-400 underline decoration-purple-500/60">
                  {totalSpots} pessoas
                </strong>{" "}
                para participar comigo (<strong className="text-red-400">Mr. Robot</strong>) da criação de uma aplicação{" "}
                <strong className="text-white">SaaS real</strong>, partindo praticamente do zero — e ao final do projeto,{" "}
                <strong className="text-emerald-400">
                  a responsabilidade pela continuidade ficará nas mãos dos {totalSpots} participantes selecionados.
                </strong>
              </p>

              {/* Painel de Contagem Regressiva até 10/11 + Status das 3 Vagas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
                <div className="rounded-xl border border-purple-500/30 bg-[#0b0b14]/90 p-3 sm:p-3.5 text-center">
                  <span className="text-xl sm:text-3xl font-extrabold font-mono-code text-white tabular-nums">
                    {String(countdown.days).padStart(2, "0")}d:{String(countdown.hours).padStart(2, "0")}h
                  </span>
                  <span className="block text-[10px] font-mono-code uppercase tracking-wider text-purple-300 mt-1">
                    Prazo ({deadlineLabel})
                  </span>
                </div>
                <div className="rounded-xl border border-purple-500/30 bg-[#0b0b14]/90 p-3 sm:p-3.5 text-center">
                  <span className="text-xl sm:text-3xl font-extrabold font-mono-code text-purple-400 tabular-nums">
                    0{totalSpots} VAGAS
                  </span>
                  <span className="block text-[10px] font-mono-code uppercase tracking-wider text-zinc-400 mt-1">
                    Equipe Selecionada
                  </span>
                </div>
                <div className="rounded-xl border border-purple-500/30 bg-[#0b0b14]/90 p-3 sm:p-3.5 text-center">
                  <span className="text-xl sm:text-3xl font-extrabold font-mono-code text-emerald-400 tabular-nums">
                    30 DIAS
                  </span>
                  <span className="block text-[10px] font-mono-code uppercase tracking-wider text-zinc-400 mt-1">
                    Do Zero ao Go-Live
                  </span>
                </div>
                <div className="rounded-xl border border-purple-500/30 bg-[#0b0b14]/90 p-3 sm:p-3.5 text-center">
                  <span className="text-xl sm:text-3xl font-extrabold font-mono-code text-white">
                    100% SEU
                  </span>
                  <span className="block text-[10px] font-mono-code uppercase tracking-wider text-zinc-400 mt-1">
                    Posse da Operação
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={scrollToWizard}
                  className="min-h-[50px] inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm sm:text-base shadow-[0_0_35px_rgba(147,51,234,0.45)] transition cursor-pointer"
                >
                  <Terminal className="w-5 h-5" />
                  <span>Candidatar-se às {totalSpots} Vagas (Até {deadlineLabel})</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href={discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-700 bg-zinc-900/70 hover:bg-zinc-800 hover:border-purple-500/50 text-zinc-200 font-semibold text-sm transition"
                >
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  Entrar no Discord
                </a>
              </div>

              {/* Subliminal interactive trigger */}
              <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-mono-code text-zinc-500">
                <span>&gt; We are not just learning to code. We are learning to build.</span>
                <button
                  type="button"
                  onClick={() =>
                    triggerSubliminalFlash("STOP WATCHING TUTORIALS. BUILD REAL SOFTWARE.")
                  }
                  className="text-purple-400/80 hover:text-purple-300 underline decoration-dotted cursor-pointer flex items-center gap-1 py-1"
                >
                  <Eye className="w-3.5 h-3.5" /> [decodificar_sinal]
                </button>
              </div>
            </div>

            {/* Coluna Direita: Emblema fsociety + Terminal Interativo */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-2xl border border-purple-500/35 bg-[#090912]/90 p-4 sm:p-5 shadow-[0_0_45px_rgba(147,51,234,0.18)]">
                <div className="flex items-center gap-3.5 sm:gap-4 mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-purple-500/40 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/logo-fsociety.jpg"
                      alt="fsociety mask glitch"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] sm:text-[11px] font-mono-code px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        OPERAÇÃO F.DEV #01
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-mono-code text-emerald-400">
                        • ONLINE
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-white font-hacker tracking-wide">
                      PROJETO PRÁTICO SAAS — 30 DIAS
                    </h2>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Comunidade para quem quer{" "}
                      <strong className="text-purple-300">aprender a programar</strong>,{" "}
                      <strong className="text-purple-300">criar sites/SaaS</strong> e{" "}
                      <strong className="text-emerald-400">ganhar dinheiro com a internet</strong>.
                    </p>
                  </div>
                </div>

                <InteractiveTerminal onStartWizard={scrollToWizard} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SEÇÃO 01: MANIFESTO OFICIAL (#recrutamento) ==================== */}
      <section
        id="manifesto"
        className="py-14 sm:py-20 border-t border-zinc-900 bg-[#07070d]/80"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-purple-500/35 bg-gradient-to-b from-[#110c1d] via-[#0a0912] to-[#07070c] overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.14)]">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#161024] border-b border-purple-500/25 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-purple-400 font-mono-code">
                  #
                </span>
                <span className="font-bold text-white text-sm sm:text-base">recrutamento</span>
                <span className="hidden sm:inline text-xs text-zinc-400 border-l border-zinc-700 pl-2.5">
                  🖥️ F.SOCIETY.DEV — RECRUTAMENTO ABERTO (fsociety00.dat)
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-mono-code text-purple-300 bg-purple-500/15 px-2.5 py-1 rounded border border-purple-500/30">
                TRANSMISSÃO OFICIAL // MR. ROBOT
              </span>
            </div>

            <div className="p-5 sm:p-10 space-y-4 sm:space-y-5 text-zinc-200 leading-relaxed text-sm sm:text-base">
              <div className="inline-flex items-center gap-2 text-xs font-mono-code uppercase tracking-widest text-purple-400">
                <span>🖥️ F.SOCIETY.DEV — RECRUTAMENTO ABERTO</span>
              </div>

              <p className="text-zinc-300 italic">Boa tarde, pessoal.</p>

              <p>
                Hoje, às <strong>17h</strong>, iniciaremos o recrutamento para o{" "}
                <strong className="text-white">primeiro projeto prático da F.SOCIETY.DEV</strong>.{" "}
                <span className="text-purple-300 font-semibold">
                  Inscrições feitas até o dia {deadlineLabel}.
                </span>
              </p>

              <p className="text-base sm:text-xl font-bold text-white border-l-4 border-purple-500 pl-4 py-1.5 bg-purple-950/20 rounded-r-lg">
                E dessa vez, não vamos apenas estudar programação. Vamos construir algo de verdade.
              </p>

              <p>
                Durante <strong className="text-white">30 dias</strong>, vou selecionar{" "}
                <strong className="text-purple-400">{totalSpots} pessoas</strong> para participar comigo da criação de uma{" "}
                <strong className="text-white">aplicação SaaS</strong>, partindo praticamente do zero.
              </p>

              <p>
                Não será apenas assistir alguém programando.{" "}
                <strong className="text-emerald-400">Vocês vão colocar a mão na massa.</strong>
              </p>

              <p>
                Vou disponibilizar uma estrutura inicial para trabalharmos e conduzir cada etapa, explicando as ferramentas, os conceitos e as decisões por trás do desenvolvimento.
              </p>

              <p>
                Ao final dos 30 dias, os três participantes terão vivenciado o processo de transformar uma ideia em um{" "}
                <strong className="text-white">produto digital funcional, pronto para ser lançado</strong>.
              </p>

              <div className="p-4 sm:p-5 rounded-xl border border-emerald-500/35 bg-emerald-950/15 text-emerald-200">
                <p className="font-semibold text-xs sm:text-base">
                  ⚡ E o mais importante: ao final do projeto, a responsabilidade pela continuidade ficará nas mãos dos participantes selecionados.
                </p>
              </div>

              <p>
                Não importa se você está começando agora ou já possui alguma experiência. O que importa é ter{" "}
                <strong className="text-white">vontade de aprender, construir e colocar a mão na massa</strong>.
              </p>

              <div className="pt-2 space-y-2 font-mono-code">
                <p className="text-purple-300 font-bold">
                  Serão apenas {totalSpots} vagas. Inscrições até {deadlineLabel}.
                </p>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  Você está pronto para construir algo que pode ir muito além de linhas de código?
                </p>
                <p className="text-base sm:text-lg font-extrabold text-white tracking-wider pt-1">
                  WELCOME TO F.SOCIETY.DEV.
                </p>
                <p className="text-xs sm:text-sm italic text-purple-400 underline">
                  We are not just learning to code. We are learning to build.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SEÇÃO 02: ARQUITETURA & PLANO DE 30 DIAS ==================== */}
      <section id="arquitetura" className="py-14 sm:py-20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="font-mono-code text-xs uppercase tracking-widest text-purple-400">
                [BLUEPRINT // O QUE VAMOS FAZER NOS 30 DIAS]
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Do Servidor ao Lançamento:{" "}
                <span className="text-purple-400">Todas as Etapas de um SaaS Real</span>
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                O projeto será desenvolvido em conjunto na nossa sala de operações. Nada de exemplos fictícios de &ldquo;todo-list&rdquo;: vamos arquitetar, programar, hospedar, blindar, integrar pagamentos reais e preparar a aquisição de clientes.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2">
                {PIPELINE_STEPS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.num}
                      className="p-3 sm:p-3.5 rounded-xl border border-purple-500/25 bg-[#0b0b15] flex items-center gap-2.5 sm:gap-3"
                    >
                      <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono-code text-purple-400 block">
                          FASE {item.num}
                        </span>
                        <span className="text-xs font-bold text-white block truncate">
                          {item.label}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-zinc-400 block truncate">
                          {item.sub}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/40 shadow-[0_0_50px_rgba(147,51,234,0.2)] group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/fsociety-planejando.webp"
                  alt="Integrantes da fsociety planejando a arquitetura do projeto na mesa"
                  className="w-full h-[240px] sm:h-[380px] object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 rounded-xl bg-black/85 backdrop-blur-md border border-purple-500/30 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono-code uppercase tracking-widest text-purple-400 block">
                      WAR ROOM // ARQUITETURA EM CONJUNTO
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      Planejamento estratégico, banco de dados, produto e lançamento em equipe.
                    </p>
                  </div>
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 shrink-0" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {PRACTICAL_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.code}
                  className="p-5 sm:p-6 rounded-2xl border border-zinc-800/90 bg-[#090912]/90 hover:border-purple-500/50 transition group"
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="p-2.5 sm:p-3 rounded-xl bg-purple-600/15 border border-purple-500/30 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono-code text-[11px] text-zinc-500 group-hover:text-purple-400 transition">
                      [{stage.code}]
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                    {stage.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== SEÇÃO 03: O MENTOR / MR. ROBOT ==================== */}
      <section
        id="mentor"
        className="py-14 sm:py-20 border-t border-zinc-900 bg-[#07070d]/90"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-5">
              <div className="relative max-w-sm sm:max-w-md mx-auto rounded-2xl overflow-hidden border border-red-500/40 shadow-[0_0_55px_rgba(239,68,68,0.18)] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/mr-robot.jpg"
                  alt="Mr. Robot — Líder do Projeto F.SOCIETY.DEV"
                  className="w-full h-auto object-cover"
                />
                <div className="p-3.5 sm:p-4 bg-gradient-to-t from-black via-black/95 to-black/70 border-t border-red-500/30 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono-code text-[10px] uppercase tracking-widest text-red-400 block">
                      PROJECT ARCHITECT // MENTOR
                    </span>
                    <span className="font-hacker text-base sm:text-lg font-bold text-white">
                      MR. ROBOT — F.SOCIETY.DEV
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-red-500/15 text-red-400 border border-red-500/30 font-mono-code text-[11px]">
                    ROOT_ACCESS
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono-code">
                <Shield className="w-3.5 h-3.5" />
                <span>LIDERANÇA TÉCNICA & EXECUÇÃO CONJUNTA</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                A criação será feita diretamente comigo.{" "}
                <span className="text-purple-400">Passo a passo, decisão por decisão.</span>
              </h2>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Eu já opero aplicações SaaS completas em produção — com infraestrutura real, agentes de Inteligência Artificial, gateways de pagamento (PIX & Cartão), banco de dados seguro e automação.
              </p>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Durante esses <strong className="text-white">30 dias</strong>, eu vou disponibilizar a estrutura inicial e guiar pessoalmente os{" "}
                <strong className="text-purple-400">{totalSpots} selecionados</strong> em cada camada do projeto, explicando na prática como pensar como um criador de SaaS e como usar IA para multiplicar sua velocidade de desenvolvimento em 10x.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400 font-mono-code text-xs font-bold">
                    <Zap className="w-4 h-4" /> ESTRUTURA INICIAL PRONTA
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Você não vai ficar perdido olhando para uma tela em branco. Vamos partir de uma base sólida e construir juntos.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono-code text-xs font-bold">
                    <Sparkles className="w-4 h-4" /> ENGENHARIA ASSISTIDA POR IA
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Aprenda na prática como programar, revisar, depurar e subir sistemas reais usando Inteligência Artificial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SEÇÃO 04: A EQUIPE DE 3 INTEGRANTES ==================== */}
      <section id="equipe" className="py-14 sm:py-20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 order-2 lg:order-1">
              <span className="font-mono-code text-xs uppercase tracking-widest text-emerald-400">
                [THE SQUAD // APENAS {totalSpots} INTEGRANTES]
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Mão na Massa em Equipe — e{" "}
                <span className="text-emerald-400">o SaaS fica nas mãos de vocês.</span>
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Por que apenas <strong className="text-white">{totalSpots} vagas</strong>? Porque em uma operação real não existe espaço para multidão assistindo passivamente. Com um esquadrão enxuto de {totalSpots} pessoas comigo no Discord, cada integrante participa ativamente do código, da infraestrutura e do lançamento.
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Equipe de {totalSpots} Integrantes:</strong> acompanhamento próximo, calls no canal de voz <code className="text-purple-300">Recrutamento F.Dev</code> e divisão real de missões.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Projeto com duração de 30 dias:</strong> ritmo focado para sair do zero até uma aplicação pronta para faturar.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-300">Posse & Continuidade:</strong> ao final dos 30 dias, a responsabilidade pela continuidade e evolução do SaaS ficará nas mãos dos {totalSpots} participantes selecionados.
                  </span>
                </li>
              </ul>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToWizard}
                  className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(147,51,234,0.35)] transition cursor-pointer"
                >
                  Preencher Wizard de Recrutamento Agora
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/40 shadow-[0_0_50px_rgba(147,51,234,0.2)] group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/fsociety-estudando.jpg"
                  alt="Integrantes da fsociety reunidos estudando e programando no notebook"
                  className="w-full h-[240px] sm:h-[380px] object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 rounded-xl bg-black/85 backdrop-blur-md border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono-code uppercase tracking-widest text-emerald-400 block">
                      HANDS-ON // MÃO NA MASSA
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      &ldquo;Não será apenas assistir alguém programando. Vocês vão colocar a mão na massa.&rdquo;
                    </p>
                  </div>
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SEÇÃO 05: WIZARD DE RECRUTAMENTO ==================== */}
      <section
        id="recrutamento"
        className="py-14 sm:py-20 border-t border-purple-500/20 bg-gradient-to-b from-[#07070f] to-[#050508]"
      >
        <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="text-center space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/35 text-purple-300 text-[11px] sm:text-xs font-mono-code">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                INSCRIÇÕES ATÉ {deadlineLabel} • APENAS {totalSpots} VAGAS
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Protocolo de Inscrição{" "}
              <span className="text-purple-400">F.SOCIETY.DEV</span>
            </h2>
            <p className="text-xs sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Complete as 5 etapas do Wizard abaixo para registrar seu perfil técnico, seus equipamentos, seu contato (
              <strong className="text-zinc-200">WhatsApp, E-mail e @ do Discord</strong>) e confirmar seu sinal de confiança.
            </p>
          </div>

          <RecruitmentWizard config={config} />
        </div>
      </section>

      {/* ==================== RODAPÉ COM IMAGEM OFICIAL ==================== */}
      <footer className="border-t border-zinc-900 bg-black pt-14 pb-12 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-6">
          <div
            onClick={() =>
              triggerSubliminalFlash("OUR DEMOCRACY HAS BEEN HACKED // WELCOME TO FSOCIETY.DEV")
            }
            title="Clique para decodificar transmissão"
            className="w-32 h-32 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-zinc-800 hover:border-red-500/60 shadow-[0_0_50px_rgba(239,68,68,0.15)] transition duration-500 cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/rodape-fsociety.webp"
              alt="FSOCIETY • OUR DEMOCRACY HAS BEEN HACKED"
              className="w-full h-full object-cover hover:scale-105 transition duration-500"
            />
          </div>

          <div className="space-y-2">
            <p className="font-hacker text-xl sm:text-3xl font-bold tracking-widest text-white">
              WELCOME TO F.SOCIETY<span className="text-purple-500">.DEV</span>
            </p>
            <p className="font-mono-code text-xs sm:text-sm text-purple-400 italic">
              &ldquo;We are not just learning to code. We are learning to build.&rdquo;
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto pt-1">
            <a
              href={discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/40 text-purple-200 text-xs font-mono-code transition"
            >
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Discord: discord.gg/qyEd3vrgd
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono-code transition"
            >
              <span>Instagram: {instagramHandle}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="w-full pt-8 border-t border-zinc-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono-code text-zinc-600">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              <span>F.SOCIETY.DEV © 2026 • fsociety00.dat</span>
            </div>
            <div className="flex items-center gap-3">
              <span>INSCRIÇÕES ATÉ {deadlineLabel} • {totalSpots} VAGAS</span>
              <a
                href="/admin"
                className="text-zinc-700 hover:text-purple-400 transition"
                title="Painel de Comando Admin"
              >
                [root@admin]
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Barra Fixa Mobile (inspirada no mobile-sticky-cta do SeekerAI) */}
      <div className="mobile-sticky-cta">
        <button
          type="button"
          onClick={scrollToWizard}
          className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-xs font-mono-code shadow-[0_0_25px_rgba(147,51,234,0.4)]"
        >
          <Terminal className="w-4 h-4" />
          <span>CANDIDATAR-SE ÀS {totalSpots} VAGAS (ATÉ {deadlineLabel})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
