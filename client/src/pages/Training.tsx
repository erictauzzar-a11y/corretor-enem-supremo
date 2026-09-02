import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import AuthDialog from "@/components/AuthDialog";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";

const exercises = [
  { category: "Introdução", prompt: "Escreva uma introdução com contextualização, tese e dois argumentos para um tema social do ENEM." },
  { category: "Argumentação", prompt: "Explique como a falta de políticas públicas pode agravar um problema social sem apenas repetir a afirmação." },
  { category: "Repertório", prompt: "Use um repertório sociocultural pertinente para sustentar um argumento e explique a relação dele com o tema." },
  { category: "Coesão", prompt: "Reescreva um período usando um conectivo que estabeleça uma relação clara de causa, oposição ou consequência." },
  { category: "Proposta de intervenção", prompt: "Escreva uma proposta de intervenção completa com agente, ação, meio, finalidade e detalhamento." },
];

export default function Training() {
  const [authUser, setAuthUser] = useState<import("@supabase/supabase-js").User | null>(null);
  const [selected, setSelected] = useState(exercises[0]);
  const [answer, setAnswer] = useState("");
  const evaluation = trpc.training.evaluate.useMutation({ onSuccess: () => toast.success("Treino avaliado.") , onError: error => toast.error(error.message || "Não foi possível avaliar este treino.") });
  useEffect(() => { if (!supabase) return; void supabase.auth.getUser().then(({ data }) => setAuthUser(data.user)); }, []);
  if (!authUser) return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-5"><Card className="max-w-md rounded-3xl text-center"><CardContent className="p-8"><Sparkles className="mx-auto h-10 w-10 text-[#3155d8]" /><h1 className="mt-4 text-2xl font-extrabold">Treine suas habilidades</h1><p className="mt-3 text-sm leading-6 text-[#66708a]">Entre para praticar e receber feedback específico da IA.</p><AuthDialog user={authUser} onUserChange={setAuthUser} triggerLabel="Entrar ou criar conta" triggerClassName="mt-6 h-11 rounded-xl bg-[#3155d8] text-white hover:bg-[#2546c3] hover:text-white" /></CardContent></Card></main>;
  const submit = () => { if (answer.trim().length < 10) { toast.info("Escreva pelo menos uma resposta com 10 caracteres."); return; } evaluation.mutate({ category: selected.category, prompt: selected.prompt, answer: answer.trim() }); };
  return <main className="min-h-screen bg-[#f7f8fc] px-5 py-8 text-[#17233d] sm:py-12"><div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/painel"><span className="flex items-center gap-2 text-sm font-semibold text-[#66708a] hover:text-[#3155d8]"><ArrowLeft className="h-4 w-4" />Voltar ao painel</span></Link><h1 className="mt-5 text-3xl font-extrabold tracking-tight">Treine suas habilidades</h1><p className="mt-2 text-sm text-[#66708a]">Pratique uma habilidade por vez e receba uma orientação objetiva.</p></div><AuthDialog user={authUser} onUserChange={setAuthUser} /></header><div className="mt-8 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]"><Card className="border-[#e7eaf2] shadow-sm"><CardHeader><CardTitle className="text-lg">Escolha uma habilidade</CardTitle></CardHeader><CardContent className="space-y-2">{exercises.map(exercise => <button key={exercise.category} onClick={() => { setSelected(exercise); setAnswer(""); evaluation.reset(); }} className={`w-full rounded-xl p-3 text-left text-sm font-semibold transition ${selected.category === exercise.category ? "bg-[#3155d8] text-white" : "bg-[#f7f8fc] text-[#59657f] hover:bg-[#eef2ff] hover:text-[#3155d8]"}`}>{exercise.category}</button>)}</CardContent></Card><Card className="border-[#e7eaf2] shadow-sm"><CardHeader><div className="flex items-center gap-2 text-[#3155d8]"><Sparkles className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">Exercício de {selected.category}</span></div><CardTitle className="mt-2 text-xl">{selected.prompt}</CardTitle></CardHeader><CardContent><Textarea value={answer} onChange={event => setAnswer(event.target.value)} placeholder="Escreva sua resposta aqui..." className="min-h-[180px] resize-none rounded-2xl border-[#e2e5ee] bg-[#fbfcfe] p-4 leading-7" /><Button onClick={submit} disabled={evaluation.isPending} className="mt-5 rounded-xl bg-[#3155d8] font-bold">{evaluation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}Avaliar meu treino</Button>{evaluation.data && <div className="mt-6 rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#3155d8]">Feedback do tutor</p><p className="mt-3 text-sm leading-7 text-[#4e5a73]">{evaluation.data.feedback}</p><p className="mt-4 text-sm font-bold text-[#35425f]">Próximo passo: <span className="font-normal">{evaluation.data.nextStep}</span></p></div>}</CardContent></Card></div></div></main>;
}
