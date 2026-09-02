import { useState } from "react";
import { BookOpenCheck, Loader2, Send, X } from "lucide-react";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

type ChatMessage = { role: "user" | "assistant"; content: string };
type TutorCorrection = { finalScore: number; competencies: Array<{ title: string; score: number; summary: string; details: string[]; verdict: string }>; pedagogicalReport: string; intervention: { agent: string; action: string; means: string; purpose: string; detail: string } };

const welcome: ChatMessage = {
  role: "assistant",
  content: "Olá! Eu sou o Tutor de Redação do AprovAI. Posso explicar sua nota, suas competências e o que você pode fazer para evoluir em direção aos 1000 pontos.",
};

const suggestedQuestions = ["Por que minha nota foi essa?", "O que falta para eu chegar aos 1000?", "Como posso melhorar minha competência mais fraca?"];

export default function SupportChat({ correction }: { correction?: TutorCorrection | null }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const tutor = trpc.support.ask.useMutation({
    onSuccess: data => setMessages(current => [...current, { role: "assistant", content: data.answer }]),
  });

  const correctionContext = correction ? JSON.stringify({
    notaEstimada: correction.finalScore,
    competencias: correction.competencies.map((item, index) => ({ competencia: `C${index + 1}`, titulo: item.title, nota: item.score, resumo: item.summary, pontos: item.details, veredito: item.verdict })),
    parecerPedagogico: correction.pedagogicalReport,
    propostaDeIntervencao: correction.intervention,
  }) : undefined;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || tutor.isPending) return;
    const next = [...messages, { role: "user" as const, content: message }];
    setMessages(next);
    setInput("");
    tutor.mutate({ message, history: next.slice(-8), correctionContext });
  };

  const askSuggested = (question: string) => {
    setInput(question);
    requestAnimationFrame(() => document.getElementById("tutor-input")?.focus());
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-3">
      {open && <div className="w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-[#dce4f5] bg-white shadow-[0_18px_55px_rgba(32,49,91,0.2)]">
        <div className="flex items-center justify-between bg-[#17233d] px-5 py-4 text-white">
          <div><p className="flex items-center gap-2 text-sm font-bold"><BookOpenCheck className="h-4 w-4 text-[#b9c8ff]" />Tutor de Redação</p><p className="mt-1 text-[11px] text-[#c8d2ef]">Dúvidas sobre sua correção e o ENEM</p></div>
          <button aria-label="Fechar Tutor de Redação" onClick={() => setOpen(false)} className="rounded-full p-1.5 text-[#c8d2ef] transition hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[390px] space-y-3 overflow-y-auto bg-[#f8f9fd] p-4">
          {!correction && <div className="rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-3 text-xs leading-5 text-[#59657f]">Faça uma correção para que eu também possa explicar sua nota e seus pontos específicos.</div>}
          {messages.length === 1 && <div className="flex flex-wrap gap-2">{suggestedQuestions.map(question => <button key={question} onClick={() => askSuggested(question)} className="rounded-full border border-[#dbe3fa] bg-white px-3 py-2 text-left text-xs font-semibold text-[#3155d8] transition hover:bg-[#eef2ff]">{question}</button>)}</div>}
          {messages.map((item, index) => <div key={`${item.role}-${index}`} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${item.role === "user" ? "rounded-br-md bg-[#3155d8] text-white" : "rounded-bl-md border border-[#e4e8f2] bg-white text-[#4d5972]"}`}>{item.role === "assistant" ? <Streamdown>{item.content}</Streamdown> : item.content}</div></div>)}
          {tutor.isPending && <div className="flex items-center gap-2 text-xs text-[#78839b]"><Loader2 className="h-3.5 w-3.5 animate-spin text-[#3155d8]" />Analisando sua dúvida...</div>}
          {tutor.error && <p className="rounded-xl bg-[#fff5f5] px-3 py-2 text-xs text-[#b94242]">Não consegui responder agora. Aguarde alguns segundos e tente novamente.</p>}
        </div>
        <form onSubmit={submit} className="flex gap-2 border-t border-[#edf0f6] bg-white p-3"><Input id="tutor-input" value={input} onChange={event => setInput(event.target.value)} placeholder="Pergunte sobre sua redação..." maxLength={2000} className="h-10 rounded-xl border-[#dfe4ef] text-sm" aria-label="Pergunta para o Tutor de Redação" /><Button type="submit" disabled={!input.trim() || tutor.isPending} size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-[#3155d8] hover:bg-[#2546c3]" aria-label="Enviar pergunta ao Tutor"><Send className="h-4 w-4" /></Button></form>
      </div>}
      <Button onClick={() => setOpen(value => !value)} className="h-12 gap-2 rounded-full bg-[#3155d8] px-5 font-semibold shadow-[0_10px_26px_rgba(49,85,216,0.28)] hover:bg-[#2546c3]" aria-expanded={open}><BookOpenCheck className="h-4 w-4" />Tutor de Redação</Button>
    </div>
  );
}
