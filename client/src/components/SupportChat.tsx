import { useState } from "react";
import { HelpCircle, Loader2, MessageCircle, Send, X } from "lucide-react";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

type ChatMessage = { role: "user" | "assistant"; content: string };

const welcome: ChatMessage = {
  role: "assistant",
  content: "Olá, eu sou a Jamily. Posso ajudar com o uso do AprovAI, correção de redações, competências do ENEM, histórico, login e relatórios em PDF.",
};

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const support = trpc.support.ask.useMutation({
    onSuccess: data => setMessages(current => [...current, { role: "assistant", content: data.answer }]),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || support.isPending) return;
    const next = [...messages, { role: "user" as const, content: message }];
    setMessages(next);
    setInput("");
    support.mutate({ message, history: next.slice(-8) });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && <div className="w-[min(370px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-[#e1e6f2] bg-white shadow-[0_18px_55px_rgba(32,49,91,0.18)]">
        <div className="flex items-center justify-between bg-[#17233d] px-5 py-4 text-white">
          <div><p className="flex items-center gap-2 text-sm font-bold"><MessageCircle className="h-4 w-4 text-[#b9c8ff]" />Suporte do Corretor</p><p className="mt-1 text-[11px] text-[#c8d2ef]">Jamily · suporte da plataforma</p></div>
          <button aria-label="Fechar suporte" onClick={() => setOpen(false)} className="rounded-full p-1.5 text-[#c8d2ef] transition hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[340px] space-y-3 overflow-y-auto bg-[#f8f9fd] p-4">
          {messages.map((item, index) => <div key={`${item.role}-${index}`} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${item.role === "user" ? "rounded-br-md bg-[#3155d8] text-white" : "rounded-bl-md border border-[#e4e8f2] bg-white text-[#4d5972]"}`}>{item.role === "assistant" ? <Streamdown>{item.content}</Streamdown> : item.content}</div></div>)}
          {support.isPending && <div className="flex items-center gap-2 text-xs text-[#78839b]"><Loader2 className="h-3.5 w-3.5 animate-spin text-[#3155d8]" />Consultando o suporte...</div>}
          {support.error && <p className="rounded-xl bg-[#fff5f5] px-3 py-2 text-xs text-[#b94242]">Não consegui responder agora. Tente novamente em alguns instantes.</p>}
        </div>
        <form onSubmit={submit} className="flex gap-2 border-t border-[#edf0f6] bg-white p-3"><Input value={input} onChange={event => setInput(event.target.value)} placeholder="Como posso ajudar?" maxLength={2000} className="h-10 rounded-xl border-[#dfe4ef] text-sm" aria-label="Pergunta para o suporte" /><Button type="submit" disabled={!input.trim() || support.isPending} size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-[#3155d8] hover:bg-[#2546c3]" aria-label="Enviar pergunta"><Send className="h-4 w-4" /></Button></form>
      </div>}
      <Button onClick={() => setOpen(value => !value)} className="h-12 gap-2 rounded-full bg-[#3155d8] px-5 font-semibold shadow-[0_10px_26px_rgba(49,85,216,0.28)] hover:bg-[#2546c3]" aria-expanded={open}><HelpCircle className="h-4 w-4" />Suporte</Button>
    </div>
  );
}
