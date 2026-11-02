"use client";

import { useState } from "react";
import { Terminal, Sparkles, ChevronRight } from "lucide-react";

const COMMAND_RESPONSES: Record<string, string[]> = {
  help: [
    "Comandos disponíveis no terminal fsociety00.dat:",
    "  manifesto  -> Exibe a diretriz central da operação",
    "  vagas      -> Status das 3 vagas e prazo (10/11)",
    "  stack      -> O que vamos construir nos 30 dias",
    "  mrrobot    -> Quem vai conduzir o projeto",
    "  secret     -> Descriptografa mensagem subliminar oculta",
    "  clear      -> Limpa o buffer do terminal",
  ],
  manifesto: [
    "[FSOCIETY.DEV // MANIFESTO]",
    "Não vamos apenas estudar programação. Vamos construir algo de verdade.",
    "Enquanto 99% ficam presos em cursos infinitos assistindo aulas passivamente,",
    "3 pessoas vão construir um SaaS real do zero ao lançamento em 30 dias — e assumir a operação no final.",
    "We are not just learning to code. We are learning to build.",
  ],
  vagas: [
    "[STATUS DO RECRUTAMENTO]",
    "• Vagas totais: APENAS 3 INTEGRANTES",
    "• Encerramento das inscrições: 10/11 às 23:59",
    "• Duração da operação: 30 dias intensivos",
    "• Sinal de comprometimento: R$ 10,00 (PIX MercosulPay ou Cartão Mercado Pago)",
  ],
  stack: [
    "[PIPELINE DE 30 DIAS — DO ZERO AO SAAS]",
    "01. VPS, Linux, Docker & Hospedagem em Produção",
    "02. Domínios, DNS, Redirecionamentos, SSL/HTTPS & Cloudflare",
    "03. Backend, APIs, Edge Functions & Banco de Dados (Supabase/Postgres)",
    "04. Desenvolvimento Full-Stack assistido por IA de ponta",
    "05. UI/UX, Identidade Visual & Alta Conversão",
    "06. Gateways de Pagamento (PIX & Cartão) e Monetização",
    "07. Lançamento, Tráfego, Marketing & Aquisição de Clientes",
  ],
  mrrobot: [
    "[OPERATIVE LEADER // MR. ROBOT]",
    "A criação será feita diretamente comigo.",
    "Vou disponibilizar a estrutura inicial e conduzir cada etapa ao vivo no Discord,",
    "explicando as ferramentas, os conceitos e as decisões reais por trás do SaaS.",
  ],
  secret: [
    "DECRYPTING /dev/fsociety00.dat ...",
    "01000110 01010011 01001111 01000011 01001001 01000101 01010100 01011001",
    "\"Control is an illusion. Mas quem domina código, IA e distribuição constrói a própria liberdade.\"",
    "DICA SUBLIMINAR: O sinal de R$ 10 não compra um curso — ele filtra os 99% que só falam dos 1% que executam.",
  ],
};

export function InteractiveTerminal({ onStartWizard }: { onStartWizard: () => void }) {
  const [history, setHistory] = useState<{ cmd: string; out: string[] }[]>([
    {
      cmd: "./init_recruitment.sh --channel=#recrutamento",
      out: [
        "Conectado a fsociety00.dat [SECURE_SHELL_V4.2]",
        "Status: RECRUTAMENTO ABERTO ATÉ 10/11 • 3 VAGAS DISPONÍVEIS",
        "Digite 'help' ou clique em um comando abaixo para inspecionar a operação.",
      ],
    },
  ]);
  const [input, setInput] = useState("");

  function runCommand(rawCmd: string) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === "clear") {
      setHistory([]);
      setInput("");
      return;
    }
    if (cmd === "join" || cmd === "recrutar") {
      onStartWizard();
      setInput("");
      return;
    }
    const response = COMMAND_RESPONSES[cmd] ?? [
      `Comando '${cmd}' não reconhecido. Digite 'help' para listar os protocolos disponíveis.`,
    ];
    setHistory((prev) => [...prev, { cmd: rawCmd, out: response }]);
    setInput("");
  }

  return (
    <div className="rounded-xl border border-purple-500/30 bg-[#07070c]/95 shadow-[0_0_40px_rgba(147,51,234,0.15)] overflow-hidden font-mono-code text-xs sm:text-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f0f18] border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-zinc-400 flex items-center gap-1.5 text-xs">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            root@fsociety.dev:~/fsociety00.dat
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
          TTY // ENCRYPTED
        </span>
      </div>

      <div className="p-4 space-y-3 max-h-64 overflow-y-auto text-zinc-300">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-1.5 text-purple-400">
              <span>mr.robot@fsociety:~$</span>
              <span className="text-zinc-100">{item.cmd}</span>
            </div>
            <div className="pl-3 border-l border-purple-500/30 space-y-0.5 text-zinc-300/90">
              {item.out.map((line, i) => (
                <p key={i} className="leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 bg-[#0b0b14] border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-zinc-500 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" /> Atalhos:
        </span>
        {["manifesto", "vagas", "stack", "mrrobot", "secret", "clear"].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => runCommand(preset)}
            className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 hover:bg-purple-950/60 text-zinc-300 hover:text-purple-300 border border-zinc-800 hover:border-purple-500/40 transition cursor-pointer"
          >
            {preset}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runCommand(input);
        }}
        className="flex items-center px-4 py-2.5 bg-[#050509] border-t border-purple-500/20"
      >
        <span className="text-purple-400 mr-2 flex items-center">
          <ChevronRight className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite um comando (ex: secret, stack, vagas)..."
          className="w-full bg-transparent text-zinc-100 placeholder-zinc-600 focus:outline-none text-xs sm:text-sm"
        />
        <button
          type="submit"
          className="ml-2 px-2.5 py-1 rounded bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs transition cursor-pointer"
        >
          EXEC
        </button>
      </form>
    </div>
  );
}
