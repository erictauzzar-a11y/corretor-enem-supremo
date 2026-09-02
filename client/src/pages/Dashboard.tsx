import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BarChart3, BookOpen, Crown, LineChart as LineChartIcon, Target, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/AuthDialog";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";

type HistoryItem = { id: string; original_text: string | null; final_score: number; created_at: string; result: unknown };
type ResultShape = { competencies?: Array<{ score?: number; title?: string }> };

function resultOf(item: HistoryItem) {
  return (item.result && typeof item.result === "object" ? item.result : {}) as ResultShape;
}

export default function Dashboard() {
  const [authUser, setAuthUser] = useState<import("@supabase/supabase-js").User | null>(null);
  const historyQuery = trpc.correction.history.useQuery(undefined, { enabled: Boolean(authUser), retry: false });

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setAuthUser(data.user));
  }, []);

  const items = useMemo(() => [...(historyQuery.data ?? [])].reverse() as HistoryItem[], [historyQuery.data]);
  const stats = useMemo(() => {
    const scores = items.map(item => item.final_score).filter(score => Number.isFinite(score));
    const latest = scores.at(-1) ?? 0;
    const best = scores.length ? Math.max(...scores) : 0;
    const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    const first = scores[0] ?? 0;
    const byCompetency = [0, 1, 2, 3, 4].map(index => {
      const values = items.map(item => resultOf(item).competencies?.[index]?.score ?? 0).filter(Boolean);
      return values.length ? Math.round(values.reduce((sum, score) => sum + score, 0) / values.length) : 0;
    });
    const weakest = byCompetency.indexOf(Math.min(...byCompetency.filter(Boolean)));
    return { latest, best, average, count: scores.length, growth: latest - first, byCompetency, weakest: weakest >= 0 ? weakest : 0 };
  }, [items]);

  if (!authUser) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-5"><Card className="max-w-md rounded-3xl border-[#e4e8f1] p-2 text-center shadow-sm"><CardContent className="p-8"><BarChart3 className="mx-auto h-10 w-10 text-[#3155d8]" /><h1 className="mt-4 text-2xl font-extrabold text-[#17233d]">Seu painel de evolução</h1><p className="mt-3 text-sm leading-6 text-[#66708a]">Entre ou crie sua conta para acompanhar suas notas, histórico e próximos passos.</p><AuthDialog user={authUser} onUserChange={setAuthUser} triggerLabel="Entrar ou criar conta" triggerClassName="mt-6 h-11 rounded-xl bg-[#3155d8] text-white hover:bg-[#2546c3] hover:text-white" /></CardContent></Card></main>;
  }

  const name = authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? authUser.email?.split("@")[0] ?? "aluno";
  const competencyNames = ["Norma culta", "Tema e repertório", "Argumentação", "Coesão", "Intervenção"];
  const chartData = items.map((item, index) => ({ name: `#${index + 1}`, nota: item.final_score }));

  return <main className="min-h-screen bg-[#f7f8fc] px-5 py-8 text-[#17233d] sm:py-12"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow"><span className="eyebrow-dot" /> SEU TREINO DE REDAÇÃO</p><h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Olá, {name}.</h1><p className="mt-2 text-sm text-[#66708a]">Veja seu progresso e escolha o próximo passo para evoluir.</p></div><div className="flex flex-wrap items-center gap-2"><Link href="/redacoes"><Button variant="outline" className="rounded-xl border-[#dfe4ef] bg-white">Minhas redações</Button></Link><Link href="/desempenho"><Button variant="outline" className="rounded-xl border-[#dfe4ef] bg-white">Meu desempenho</Button></Link><Link href="/treinos"><Button variant="outline" className="rounded-xl border-[#dfe4ef] bg-white">Treinar habilidades</Button></Link><Link href="/"><Button variant="outline" className="rounded-xl border-[#dfe4ef] bg-white">Nova redação</Button></Link><AuthDialog user={authUser} onUserChange={setAuthUser} /></div></header>
    {items.length === 0 ? <Card className="mt-8 rounded-3xl border-[#dfe5ff] bg-[#f7f9ff]"><CardContent className="p-8"><BookOpen className="h-8 w-8 text-[#3155d8]" /><h2 className="mt-4 text-2xl font-extrabold">Comece sua primeira jornada</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#66708a]">Envie uma redação para receber sua primeira nota e liberar seu painel de evolução.</p><Link href="/"><Button className="mt-5 rounded-xl bg-[#3155d8]">Enviar redação <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></CardContent></Card> : <><section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[{ label: "Última nota", value: stats.latest, icon: Target }, { label: "Melhor nota", value: stats.best, icon: Crown }, { label: "Média", value: stats.average, icon: BarChart3 }, { label: "Redações corrigidas", value: stats.count, icon: BookOpen }, { label: "Evolução", value: `${stats.growth >= 0 ? "+" : ""}${stats.growth}`, icon: TrendingUp }].map(({ label, value, icon: Icon }) => <Card key={label} className="border-[#e7eaf2] shadow-sm"><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-[#7b849a]">{label}</span><Icon className="h-4 w-4 text-[#3155d8]" /></div><p className="mt-3 text-3xl font-extrabold tracking-tight text-[#17233d]">{value}{label === "Última nota" || label === "Melhor nota" || label === "Média" ? <small className="ml-1 text-xs font-semibold text-[#9ba3b5]">/1000</small> : null}</p></CardContent></Card>)}</section>
    <section className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]"><Card className="border-[#e7eaf2] shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><LineChartIcon className="h-5 w-5 text-[#3155d8]" />Evolução das notas</CardTitle></CardHeader><CardContent><div className="h-64">{chartData.length > 1 ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis domain={[0, 1000]} axisLine={false} tickLine={false} width={36} /><Tooltip formatter={(value: number) => [`${value}/1000`, "Nota"]} /><Line type="monotone" dataKey="nota" stroke="#3155d8" strokeWidth={3} dot={{ fill: "#3155d8", r: 4 }} /></LineChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-center text-sm text-[#8891a6]">Faça mais uma redação para visualizar sua evolução.</div>}</div></CardContent></Card><Card className="border-[#dfe5ff] bg-[#f7f9ff] shadow-sm"><CardContent className="p-6"><div className="flex items-center gap-2 text-[#3155d8]"><Target className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">Seu principal ponto de atenção</span></div><h2 className="mt-4 text-xl font-extrabold">Competência {stats.weakest + 1} — {competencyNames[stats.weakest]}</h2><p className="mt-3 text-sm leading-6 text-[#66708a]">Essa é a competência que mais pode aumentar sua nota neste momento. Treine com base nos exemplos da sua última correção.</p><Link href="/plano"><Button variant="outline" className="mt-5 rounded-xl border-[#cfd8f5] bg-white text-[#3155d8]">Ver plano de evolução <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></CardContent></Card></section></>}
  </div></main>;
}
