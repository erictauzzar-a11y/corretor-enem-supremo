import { useEffect, useRef, useState } from "react";
import AuthDialog from "@/components/AuthDialog";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { BookOpen, Check, ChevronRight, Clock3, Download, FileImage, FileText, GraduationCap, Lightbulb, Loader2, RotateCcw, Sparkles, Target, Upload, X, Crown, LockKeyhole, ShieldCheck } from "lucide-react";
import { downloadCorrectionPdf } from "@/lib/pdf";
import SupportChat from "@/components/SupportChat";
import { useLocation } from "wouter";

type HistoryItem = {
  id: string;
  source_type: string;
  original_text: string | null;
  final_score: number;
  created_at: string;
};

type Correction = {
  finalScore: number;
  transcription: string;
  competencies: Array<{ score: number; title: string; summary: string; details: string[]; evidence: string[]; verdict: string; protocolFindings: Record<string, string> }>;
  intervention: { agent: string; action: string; means: string; purpose: string; detail: string; viability: string; checklist: Record<string, string> };
  pedagogicalReport: string;
  warning: string;
  freeMode?: boolean;
};

const competencies = ["Norma culta", "Compreensão do tema", "Projeto de texto", "Coesão", "Intervenção"];

function correctionPriorities(correction: Correction) {
  const ranked = correction.competencies.map((item, index) => ({ item, index })).sort((a, b) => a.item.score - b.item.score);
  return { priorities: ranked.slice(0, 2), strength: [...ranked].sort((a, b) => b.item.score - a.item.score)[0] };
}

function correctionErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.toLowerCase().includes("too small") || message.toLowerCase().includes("zoderror")) {
    return "A análise retornou um formato incompleto. Tente enviar novamente; o sistema já está preparado para corrigir esse caso.";
  }
  if (message.toLowerCase().includes("gemini") || message.toLowerCase().includes("api")) {
    return "O serviço de análise demorou ou ficou indisponível. Aguarde alguns segundos e tente novamente.";
  }
  return "Não foi possível concluir a correção. Verifique o envio e tente novamente.";
}

const criteria = [
  { number: "01", title: "Domínio da modalidade escrita formal", text: "Avalia o controle da norma-padrão na construção do texto. Entram aqui ortografia, acentuação, pontuação, concordância, regência, colocação pronominal, escolha vocabular e organização sintática. O corretor observa não apenas quantos desvios existem, mas também sua gravidade, recorrência e impacto na clareza.", focus: "O que diferencia as notas altas: poucos desvios e frases bem construídas, com variedade de períodos sem perder a precisão.", tip: "Como melhorar: revise a redação procurando primeiro erros recorrentes e depois leia cada período perguntando quem pratica a ação, qual é o verbo e se a relação entre as partes está clara.", avoid: "Evite linguagem excessivamente informal, abreviações, frases longas sem pontuação e repetir a mesma palavra quando existe uma alternativa adequada.", example: "Exemplo: em vez de ‘as pessoas não tem acesso’, use ‘as pessoas não têm acesso’; em vez de ligar várias ideias apenas por vírgulas, separe os períodos e use conectivos adequados." },
  { number: "02", title: "Compreensão da proposta e repertório", text: "Verifica se o participante compreende exatamente o recorte temático, desenvolve o assunto sem fugir dele e respeita o texto dissertativo-argumentativo. Também avalia o repertório sociocultural: conhecimentos de história, filosofia, sociologia, ciência, literatura, legislação ou atualidades devem ser pertinentes, legítimos e utilizados para explicar o argumento, não apenas citados.", focus: "O que diferencia as notas altas: uma tese diretamente relacionada ao tema e referências externas conectadas ao raciocínio do parágrafo.", tip: "Como melhorar: transforme cada repertório em argumento, explicando o que ele demonstra e como se relaciona com o problema discutido.", avoid: "Evite mencionar uma personalidade, lei ou dado de forma decorativa, usar informações duvidosas ou discutir apenas o assunto geral sem atender ao recorte proposto.", example: "Exemplo: citar a Constituição Federal é insuficiente sozinho; é melhor explicar que o princípio da igualdade fundamenta a necessidade de combater a desigualdade discutida." },
  { number: "03", title: "Seleção e organização dos argumentos", text: "Analisa o projeto de texto, isto é, o planejamento que sustenta o ponto de vista do início ao fim. O corretor observa se os argumentos são selecionados, relacionados, organizados em uma progressão lógica e interpretados com autoria. Cada parágrafo de desenvolvimento deve cumprir uma função e contribuir para provar a tese.", focus: "O que diferencia as notas altas: argumentos específicos, aprofundados e articulados, em vez de uma sequência de opiniões genéricas.", tip: "Como melhorar: antes de escrever, formule uma tese e escolha dois eixos de discussão; em cada desenvolvimento, apresente a ideia, explique sua causa ou consequência e conecte-a ao tema.", avoid: "Evite repetir a introdução, listar problemas sem analisá-los, contradizer sua própria tese ou terminar um parágrafo sem concluir a relação com o ponto de vista.", example: "Exemplo: não basta afirmar que a exclusão digital é injusta; explique como a falta de infraestrutura limita a aprendizagem e reproduz desigualdades sociais." },
  { number: "04", title: "Conhecimento dos mecanismos de coesão", text: "Observa como as palavras, frases e parágrafos são ligados para formar uma unidade de sentido. São avaliados conectivos, pronomes, sinônimos, elipses e outros recursos que indicam causa, oposição, consequência, explicação e conclusão. A coesão precisa ser variada, correta e coerente com a relação entre as ideias.", focus: "O que diferencia as notas altas: relações de sentido explícitas, retomadas claras e conectivos usados com precisão, sem parecer uma lista decorada.", tip: "Como melhorar: revise o início de cada parágrafo e confira se o leitor entende como ele se relaciona com o anterior; alterne conectores de acordo com a função que exercem.", avoid: "Evite começar todos os parágrafos da mesma maneira, usar ‘portanto’ sem conclusão ou empregar pronomes cujo referente não fica claro.", example: "Exemplo: use ‘além disso’ para adicionar uma ideia, ‘entretanto’ para contrastar e ‘portanto’ para concluir — não como substitutos universais de qualquer ligação." },
  { number: "05", title: "Proposta de intervenção", text: "Avalia a solução apresentada para o problema, que deve ser concreta, detalhada, viável e compatível com os argumentos desenvolvidos. Para construir uma proposta completa, confira se os cinco elementos aparecem de forma identificável: agente, ação, meio ou modo, finalidade ou efeito e detalhamento. A intervenção também deve respeitar os direitos humanos e não pode propor violência, discriminação ou supressão de direitos.", focus: "O que diferencia as notas altas: uma intervenção que responde diretamente ao problema, deixa claro quem fará o quê, como isso será executado, com qual objetivo e qual detalhe torna a medida verificável.", tip: "Como melhorar: transforme cada argumento do desenvolvimento em uma resposta possível. Depois, sublinhe na sua frase quem age, o que será feito, como será feito, para quê e qual informação concreta detalha a proposta.", avoid: "Evite soluções vagas como ‘o governo deve conscientizar’, agentes genéricos sem responsabilidade definida, ações sem meio de execução, finalidades que apenas repetem o problema e medidas impossíveis ou contrárias aos direitos humanos.", example: "Exemplo completo: o Ministério da Educação (agente) deve ampliar a internet nas escolas públicas (ação), por meio de repasses monitorados e formação técnica (meio), para reduzir a desigualdade de acesso (finalidade), com metas divulgadas por município e acompanhamento semestral (detalhamento).", elements: [{ label: "Agente", explanation: "Quem será responsável por executar ou coordenar a medida? Prefira instituições, órgãos, escolas, empresas ou grupos com atribuição relacionada ao problema." }, { label: "Ação", explanation: "O que será feito para enfrentar a causa ou consequência discutida? Use um verbo claro e executável, como ampliar, fiscalizar, oferecer, regulamentar ou criar." }, { label: "Meio / modo", explanation: "Como a ação sairá do papel? Indique recursos, canais, estratégias, parcerias, campanhas, formação, fiscalização ou etapas de execução." }, { label: "Finalidade / efeito", explanation: "Para que a medida será realizada? Explique o resultado esperado e conecte-o ao problema e aos argumentos da redação." }, { label: "Detalhamento", explanation: "Acrescente uma informação concreta que especifique o agente, a ação, o meio ou a finalidade, como público-alvo, frequência, local, instrumento, prazo ou forma de acompanhamento." }] },
];

export default function Home() {
  const [authUser, setAuthUser] = useState<import("@supabase/supabase-js").User | null>(null);
  const [text, setText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string>();
  const [imageName, setImageName] = useState("");
  const [result, setResult] = useState<Correction>();
  const [mode, setMode] = useState<"text" | "image">("text");
  const [, navigate] = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);
  const correction = trpc.correction.analyze.useMutation({ onSuccess: data => { setResult(data as Correction); toast.success("Sua correção foi finalizada."); } });
  const billingQuery = trpc.billing.status.useQuery(undefined, { enabled: Boolean(authUser), retry: false });
  const historyQuery = trpc.correction.history.useQuery(undefined, { enabled: Boolean(authUser), retry: false });
  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setAuthUser(data.user));
  }, []);
  useEffect(() => {
    if (correction.error) toast.error(correctionErrorMessage(correction.error));
  }, [correction.error]);
  useEffect(() => {
    const checkoutState = new URLSearchParams(window.location.search).get("checkout");
    if (checkoutState === "success") {
      toast.success("Pagamento recebido. Seu plano será ativado após a confirmação.");
      void billingQuery.refetch();
    } else if (checkoutState === "cancelled") {
      toast.info("A compra foi cancelada. Você pode tentar novamente quando quiser.");
    }
  }, [billingQuery.refetch]);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
      toast.info("Escolha uma imagem JPG ou PNG com até 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setImageDataUrl(String(reader.result)); setImageName(file.name); };
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!authUser) { toast.info("Crie uma conta ou entre para usar a correção gratuita."); return; }
    if (!billingQuery.data?.paid && mode === "image") { toast.info("A correção por imagem está disponível no plano anual."); return; }
    if (mode === "text" && !text.trim()) { toast.info("Digite ou cole sua redação antes de continuar."); return; }
    if (mode === "image" && !imageDataUrl) { toast.info("Selecione uma imagem da redação antes de continuar."); return; }
    correction.mutate({ text: mode === "text" ? text : undefined, imageDataUrl: mode === "image" ? imageDataUrl : undefined });
  };
  const reset = () => { setResult(undefined); setText(""); setImageDataUrl(undefined); setImageName(""); correction.reset(); };
  const buyPlan = () => {
    navigate("/comprar");
  };

  const downloadPdf = () => {
    if (result) downloadCorrectionPdf(result);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#17233d]">
      <header className="border-b border-[#e8eaf2] bg-white/85 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="brand-mark"><GraduationCap className="h-5 w-5" /></div>
            <div><p className="text-[15px] font-bold tracking-tight">AprovAI</p><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#788199]">AprovAI</p></div>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-[#788199]"><div className="hidden items-center gap-6 md:flex"><a href="#como-funciona" className="transition hover:text-[#3155d8]">Como funciona</a><a href="#criterios" className="transition hover:text-[#3155d8]">Critérios</a>{authUser && <a href="/painel" className="transition hover:text-[#3155d8]">Meu painel</a>}<Badge className="rounded-full bg-[#edf1ff] px-3 py-1 text-[#3155d8] hover:bg-[#edf1ff]">IA pedagógica</Badge></div><AuthDialog user={authUser} onUserChange={setAuthUser} /></div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-8 lg:pt-16">
        <section className="grid items-start gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20">
          <div className="pt-3">
            <div className="eyebrow"><span className="eyebrow-dot" /> CORREÇÃO COM MÉTODO</div>
            <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-[#17233d] sm:text-5xl lg:text-[4.2rem]">Sua redação, <span className="text-[#3155d8]">lapidada</span> para o ENEM.</h1>
            <p className="mt-6 max-w-lg text-[17px] leading-8 text-[#66708a]">Receba uma análise precisa, acolhedora e completa, baseada nas cinco competências oficiais do ENEM.</p>
            <div className="mt-9 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">
              {[{ icon: Target, label: "5 competências" }, { icon: Sparkles, label: "Nota de 0 a 1000" }, { icon: Lightbulb, label: "Dicas práticas" }].map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-2 rounded-xl border border-[#e6e9f2] bg-white px-3 py-3 text-xs font-semibold text-[#4b5875] shadow-sm"><Icon className="h-4 w-4 text-[#3155d8]" />{label}</div>)}
            </div>
            <div className="mt-12 hidden items-center gap-3 border-t border-[#e4e7f0] pt-5 text-xs text-[#7b849a] sm:flex"><div className="flex -space-x-2"><span className="avatar bg-[#dfe8ff]">A</span><span className="avatar bg-[#ffe6d8]">M</span><span className="avatar bg-[#dff2e7]">L</span></div><span>Feito para quem quer evoluir<br /><strong className="font-semibold text-[#4c5871]">uma competência por vez.</strong></span></div>
          </div>

          <Card className="overflow-hidden rounded-[24px] border-0 bg-white shadow-[0_24px_70px_rgba(39,57,107,0.12)]">
            <CardHeader className="border-b border-[#eef0f6] px-6 pb-5 pt-6 sm:px-8"><div className="flex items-start justify-between"><div><CardTitle className="text-xl font-bold tracking-tight">Comece sua correção</CardTitle><p className="mt-1.5 text-sm text-[#8891a6]">Escolha como deseja enviar sua redação.</p></div><div className="rounded-xl bg-[#f1f4ff] p-2.5 text-[#3155d8]"><BookOpen className="h-5 w-5" /></div></div></CardHeader>
            <CardContent className="px-6 pb-7 pt-6 sm:px-8">
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-[#f5f6fa] p-1.5"><button onClick={() => setMode("text")} className={`mode-tab ${mode === "text" ? "mode-tab-active" : ""}`}><FileText className="h-4 w-4" />Texto digitado</button><button onClick={() => { if (billingQuery.data?.paid) setMode("image"); else toast.info("A correção por imagem está disponível no plano anual."); }} className={`mode-tab ${mode === "image" ? "mode-tab-active" : ""} ${!billingQuery.data?.paid ? "opacity-60" : ""}`}><FileImage className="h-4 w-4" />Imagem {!billingQuery.data?.paid && <LockKeyhole className="h-3 w-3" />}</button></div>
              {mode === "text" ? <div><Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Cole ou digite sua redação aqui..." className="min-h-[250px] resize-none rounded-2xl border-[#e2e5ee] bg-[#fbfcfe] p-4 text-[15px] leading-7 shadow-none placeholder:text-[#a9b0c1] focus-visible:ring-[#bfcaff]" /><div className="mt-2 flex justify-between text-xs text-[#9aa2b4]"><span>Recomendado: entre 20 e 30 linhas</span><span>{text.length} caracteres</span></div></div> : <div className="relative flex min-h-[250px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cfd7f5] bg-[#fafbff] px-6 text-center"><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />{imageDataUrl ? <><img src={imageDataUrl} alt="Pré-visualização da redação" className="max-h-44 rounded-lg object-contain shadow-sm" /><div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#45516d]"><FileImage className="h-4 w-4 text-[#3155d8]" />{imageName}<button onClick={() => { setImageDataUrl(undefined); setImageName(""); }} aria-label="Remover imagem"><X className="h-4 w-4 text-[#9aa2b4]" /></button></div></> : <><div className="mb-3 rounded-full bg-[#eaf0ff] p-3 text-[#3155d8]"><Upload className="h-5 w-5" /></div><p className="text-sm font-semibold text-[#46536e]">Envie uma foto da sua redação</p><p className="mt-1 text-xs text-[#9aa2b4]">JPG ou PNG, até 8 MB</p><Button onClick={() => fileRef.current?.click()} variant="outline" className="mt-4 rounded-xl border-[#dbe1f3] bg-white text-[#3155d8] hover:bg-[#f1f4ff]">Selecionar arquivo</Button></>}</div>}
                      <Button onClick={submit} disabled={correction.isPending || (mode === "text" ? !text.trim() : !imageDataUrl)} className="mt-6 h-12 w-full rounded-xl bg-[#3155d8] text-sm font-bold shadow-[0_8px_20px_rgba(49,85,216,0.22)] transition hover:bg-[#2546c3] active:scale-[0.98]">{correction.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analisando sua redação...</> : <>Corrigir minha redação <ChevronRight className="ml-2 h-4 w-4" /></>}</Button>
              <p className="mt-3 text-center text-[11px] text-[#9aa2b4]">Sua redação é usada apenas para gerar esta análise.</p>
            </CardContent>
          </Card>
        </section>

        <section id="plano" className="mt-14 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <Card className="border-[#dfe5ff] bg-[#f7f9ff] shadow-sm"><CardContent className="p-6 sm:p-8"><div className="flex items-center gap-2 text-[#3155d8]"><Crown className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.18em]">Plano AprovAI</span></div><h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#17233d]">{billingQuery.data?.paid ? "Seu plano AprovAI está ativo" : "Correções ilimitadas por R$ 53,90 ao ano"}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#66708a]">Faça quantas correções precisar, por texto ou imagem, com histórico, PDF e análise pedagógica completa.</p><Button onClick={buyPlan} disabled={billingQuery.data?.paid} className="mt-6 rounded-xl bg-[#3155d8] font-bold text-white hover:bg-[#2546c3]">{billingQuery.data?.paid ? <ShieldCheck className="mr-2 h-4 w-4" /> : <Crown className="mr-2 h-4 w-4" />}{billingQuery.data?.paid ? "Plano ativo" : "Ativar plano anual"}</Button><p className="mt-3 text-xs text-[#7d88a0]">Checkout seguro processado pelo Stripe. Renovação automática anual.</p></CardContent></Card>
          <Card className="border-[#e7eaf2] bg-white shadow-sm"><CardContent className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8"><div><div className="flex items-center gap-2 text-[#3155d8]"><LockKeyhole className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wider">Grátis</span></div><p className="mt-2 text-sm leading-6 text-[#66708a]">1 correção por texto após criar sua conta.</p></div><div><div className="flex items-center gap-2 text-[#24734a]"><ShieldCheck className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wider">AprovAI</span></div><p className="mt-2 text-sm leading-6 text-[#66708a]">Texto, imagem, PDF, histórico e análise pedagógica ilimitados.</p></div></CardContent></Card>
        </section>

        {result && <section className="result-section mt-16" id="resultado"><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="eyebrow"><span className="eyebrow-dot" /> RESULTADO DA ANÁLISE</div><h2 className="mt-3 text-3xl font-extrabold tracking-tight">Seu diagnóstico completo</h2></div><div className="flex flex-wrap gap-2">{!result.freeMode && <Button onClick={downloadPdf} className="w-fit rounded-xl bg-[#3155d8] text-white hover:bg-[#2546c3]"><Download className="mr-2 h-4 w-4" />Baixar PDF</Button>}{result.freeMode && <Button onClick={buyPlan} className="w-fit rounded-xl bg-[#3155d8] text-white hover:bg-[#2546c3]"><Crown className="mr-2 h-4 w-4" />Liberar PDF e análise completa</Button>}<Button onClick={reset} variant="outline" className="w-fit rounded-xl border-[#dfe4ef] bg-white"><RotateCcw className="mr-2 h-4 w-4" />Nova correção</Button></div></div>
          <div className="grid gap-5 lg:grid-cols-[260px_1fr]"><Card className="score-card border-0 text-white"><CardContent className="flex h-full flex-col justify-between p-7"><div><p className="text-sm font-semibold text-white/70">NOTA ESTIMADA</p><div className="mt-4 text-6xl font-extrabold tracking-[-0.06em]">{result.finalScore}<span className="ml-1 text-2xl font-semibold text-white/60">/1000</span></div><p className="mt-3 text-xs leading-5 text-white/65">Estimativa orientativa baseada nos critérios do ENEM; não é uma nota oficial.</p></div><div className="mt-8 flex items-center gap-2 text-sm font-medium text-white/80"><Check className="h-4 w-4" />Análise concluída</div></CardContent></Card><Card className="border-[#e7eaf2] shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-lg">Desempenho por competência</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{result.competencies.map((item, index) => <div key={item.title} className="rounded-xl bg-[#f7f8fc] p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold text-[#3155d8]">C{index + 1}</span><span className="text-sm font-extrabold text-[#293653]">{item.score}<small className="font-medium text-[#9ba3b5">/200</small></span></div><p className="mt-3 text-xs font-semibold leading-5 text-[#5c6780]">{item.title}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e1e5ef]"><div className="h-full rounded-full bg-[#3155d8]" style={{ width: `${item.score / 2}%` }} /></div></div>)}</CardContent></Card></div>
          {(() => { const pedagogical = correctionPriorities(result); return <Card className="mt-5 border-[#dfe5ff] bg-[#f7f9ff] shadow-sm"><CardHeader><CardTitle className="text-lg">O que você precisa melhorar?</CardTitle><p className="text-sm leading-6 text-[#66708a]">Prioridades identificadas a partir desta redação, para orientar seu próximo treino.</p></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">{pedagogical.priorities.map(({ item, index }, priority) => <div key={item.title} className="rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#b35a38]">Prioridade {priority + 1} · C{index + 1}</p><p className="mt-2 font-bold text-[#35425f]">{item.title}</p><p className="mt-2 text-sm leading-6 text-[#59657f]">{item.summary}</p><p className="mt-3 border-t border-[#eef0f5] pt-3 text-sm leading-6 text-[#4e5a73]"><strong>Como melhorar: </strong>{item.details[0]}</p></div>)}{pedagogical.strength && <div className="rounded-xl bg-[#f4fbf7] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#24734a]">Ponto forte · C{pedagogical.strength.index + 1}</p><p className="mt-2 font-bold text-[#35425f]">{pedagogical.strength.item.title}</p><p className="mt-2 text-sm leading-6 text-[#4e6c5a]">{pedagogical.strength.item.verdict}</p></div>}</CardContent></Card>; })()}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">{result.competencies.map((item, index) => <Card key={item.title} className="border-[#e7eaf2] shadow-sm"><CardHeader className="pb-3"><div className="flex items-center justify-between gap-3"><CardTitle className="text-base"><span className="mr-2 text-[#3155d8]">C{index + 1}</span>{item.title}</CardTitle><Badge variant="outline" className="border-[#dbe2f7] text-[#3155d8]">{item.score}/200</Badge></div></CardHeader><CardContent><p className="text-sm leading-6 text-[#66708a]">{item.summary}</p><div className="mt-4 space-y-2">{Object.entries(item.protocolFindings).map(([label, content]) => <div key={label} className="rounded-lg bg-[#f7f8fc] px-3 py-2.5"><p className="text-[10px] font-bold uppercase tracking-wide text-[#3155d8]">{{ grammar: "Desvios gramaticais e ortográficos", syntax: "Falhas de estrutura sintática", theme: "Adequação ao tema", textType: "Tipo textual", repertoire: "Repertório legítimo e produtivo", project: "Projeto de texto", coherence: "Coerência e argumentação", interparagraphCohesion: "Coesão interparágrafos", intraparagraphCohesion: "Coesão intraparágrafos", cohesionInadequacies: "Inadequações coesivas" }[label] || label}</p><p className="mt-1 text-sm leading-5 text-[#4e5a73]">{content}</p></div>)}</div><ul className="mt-3 space-y-2">{item.details.map(detail => <li key={detail} className="flex gap-2 text-sm leading-5 text-[#4e5a73]"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7890e8]" />{detail}</li>)}</ul><div className="mt-4 rounded-lg border border-[#dce4ff] bg-[#f7f9ff] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-[#3155d8]">Evidências observáveis</p><ul className="mt-1 space-y-1">{item.evidence.map(evidence => <li key={evidence} className="text-sm leading-5 text-[#4e5a73]">{evidence}</li>)}</ul></div><p className="mt-4 border-t border-[#eef0f5] pt-3 text-sm font-medium leading-6 text-[#35425f]"><strong>Veredito: </strong>{item.verdict}</p></CardContent></Card>)}</div>
          <Card className="mt-5 border-[#dce4ff] bg-[#f7f9ff] shadow-sm"><CardHeader><CardTitle className="text-lg">Proposta de intervenção</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries({ Agente: result.intervention.agent, Ação: result.intervention.action, "Meio / modo": result.intervention.means, Finalidade: result.intervention.purpose, Detalhamento: result.intervention.detail }).map(([key, value]) => <div key={key} className="rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#3155d8]">{key}</p><p className="mt-2 text-sm leading-6 text-[#59657f]">{value}</p></div>)}<div className="sm:col-span-2 lg:col-span-3"><p className="text-sm leading-6 text-[#59657f]"><strong className="text-[#35425f]">Viabilidade: </strong>{result.intervention.viability}</p></div><div className="sm:col-span-2 lg:col-span-3 border-t border-[#dce4ff] pt-4"><p className="text-xs font-bold uppercase tracking-wider text-[#3155d8]">Checklist dos 5 elementos</p><div className="mt-3 grid gap-2 sm:grid-cols-5">{Object.entries(result.intervention.checklist).map(([key, value]) => <div key={key} className="rounded-lg bg-white p-3 text-xs leading-5 text-[#59657f]"><strong className="block text-[#35425f]">{key === "agent" ? "Agente" : key === "action" ? "Ação" : key === "means" ? "Meio / modo" : key === "purpose" ? "Finalidade" : "Detalhamento"}</strong>{value}</div>)}</div></div></CardContent></Card>
          {!result.freeMode ? <Card className="mt-5 border-0 bg-[#17233d] text-white shadow-sm"><CardContent className="p-7"><div className="flex items-center gap-2 text-[#aebeff]"><Lightbulb className="h-5 w-5" /><span className="text-sm font-bold uppercase tracking-wider">Parecer pedagógico</span></div><p className="mt-4 max-w-4xl text-[15px] leading-8 text-white/80">{result.pedagogicalReport}</p>{result.warning && <p className="mt-4 text-sm text-[#ffd991]">Observação: {result.warning}</p>}</CardContent></Card> : <Card className="mt-5 border-[#dfe5ff] bg-[#f7f9ff] shadow-sm"><CardContent className="p-7"><div className="flex items-center gap-2 text-[#3155d8]"><LockKeyhole className="h-5 w-5" /><span className="text-sm font-bold uppercase tracking-wider">Conteúdo premium</span></div><p className="mt-3 text-sm leading-6 text-[#66708a]">Ative o plano anual para desbloquear o parecer pedagógico completo e baixar o relatório em PDF.</p><Button onClick={buyPlan} className="mt-5 rounded-xl bg-[#3155d8] text-white hover:bg-[#2546c3]"><Crown className="mr-2 h-4 w-4" />Ativar por R$ 53,90 ao ano</Button></CardContent></Card>}
        </section>}

        {authUser && historyQuery.data && historyQuery.data.length > 0 && <section className="mt-16" aria-labelledby="historico-title"><div className="mb-5 flex items-end justify-between gap-4"><div><div className="eyebrow"><span className="eyebrow-dot" /> SUA EVOLUÇÃO</div><h2 id="historico-title" className="mt-3 text-2xl font-extrabold tracking-tight">Histórico de correções</h2></div><Clock3 className="h-6 w-6 text-[#3155d8]" /></div><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{(historyQuery.data as HistoryItem[]).map(item => <Card key={item.id} className="border-[#e7eaf2] shadow-sm"><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-[#7c87a0]">{new Date(item.created_at).toLocaleDateString("pt-BR")}</span><span className="text-xl font-extrabold text-[#3155d8]">{item.final_score}<small className="ml-1 text-xs font-medium text-[#8e98ad">/1000</small></span></div><p className="mt-3 line-clamp-2 text-sm leading-6 text-[#59657f]">{item.original_text || "Correção enviada por imagem"}</p></CardContent></Card>)}</div></section>}

        {!result && <section id="como-funciona" className="mt-24 border-t border-[#e5e8f0] pt-12"><div className="grid gap-8 md:grid-cols-3">{[{ n: "01", title: "Envie sua redação", text: "Cole o texto ou envie uma foto nítida da versão manuscrita." }, { n: "02", title: "Receba a análise", text: "Nosso corretor avalia cada competência com critérios claros." }, { n: "03", title: "Evolua na prática", text: "Use o diagnóstico para reescrever melhor e subir sua nota." }].map(item => <div key={item.n} className="flex gap-4"><span className="text-sm font-extrabold text-[#3155d8]">{item.n}</span><div><h3 className="font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#778198]">{item.text}</p></div></div>)}</div></section>}
        <section id="criterios" className="mt-24 scroll-mt-24 border-t border-[#e5e8f0] pt-12"><div className="mx-auto max-w-3xl text-center"><div className="eyebrow justify-center"><span className="eyebrow-dot" /> COMO A NOTA É FORMADA</div><h2 className="mt-3 text-3xl font-extrabold tracking-tight">Critérios de correção do ENEM</h2><p className="mt-3 text-sm leading-6 text-[#778198]">Clique em cada competência para entender o que os corretores observam. Cada uma vale até 200 pontos, totalizando 1000.</p></div><div className="mx-auto mt-8 max-w-4xl space-y-3">{criteria.map(item => <details key={item.number} className="group rounded-2xl border border-[#e4e8f1] bg-white shadow-sm"><summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 [&::-webkit-details-marker]:hidden"><span className="text-sm font-extrabold text-[#3155d8]">{item.number}</span><span className="flex-1 text-left text-sm font-bold text-[#35425f]">{item.title}</span><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f3ff] text-lg font-medium text-[#3155d8] transition-transform group-open:rotate-45">+</span></summary><div className="border-t border-[#eef0f5] px-5 pb-5 pt-4 pl-[4.25rem] text-sm leading-7 text-[#68738b]"><p>{item.text}</p>{item.elements && <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{item.elements.map(element => <div key={element.label} className="rounded-xl border border-[#dce4ff] bg-[#f7f9ff] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#3155d8]">{element.label}</p><p className="mt-2 text-sm leading-6 text-[#5f6b84]">{element.explanation}</p></div>)}</div>}<div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[#f7f9ff] p-3"><p className="text-xs font-bold uppercase tracking-wide text-[#3155d8]">O que observar</p><p className="mt-1 text-sm leading-6 text-[#5f6b84]">{item.focus}</p></div><div className="rounded-xl bg-[#f7f9ff] p-3"><p className="text-xs font-bold uppercase tracking-wide text-[#3155d8]">Como melhorar</p><p className="mt-1 text-sm leading-6 text-[#5f6b84]">{item.tip}</p></div><div className="rounded-xl bg-[#fffaf2] p-3"><p className="text-xs font-bold uppercase tracking-wide text-[#a66a00]">Evite</p><p className="mt-1 text-sm leading-6 text-[#6f604b]">{item.avoid}</p></div><div className="rounded-xl bg-[#f4fbf7] p-3"><p className="text-xs font-bold uppercase tracking-wide text-[#24734a]">Exemplo</p><p className="mt-1 text-sm leading-6 text-[#4e6c5a]">{item.example}</p></div></div><div className="mt-4 text-xs font-semibold text-[#3155d8]">Régua: 0 · 40 · 80 · 120 · 160 · 200 pontos</div></div></details>)}</div><p className="mx-auto mt-5 max-w-4xl text-center text-[11px] leading-5 text-[#9aa2b4]">Referência: <a className="underline hover:text-[#3155d8]" href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/a-redacao-do-enem-cartilha-do-a-participante" target="_blank" rel="noreferrer">Cartilha do Participante — A Redação do ENEM, INEP</a>.</p></section>
      </main>
      <footer className="border-t border-[#e5e8f0] bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-[#8b94a7] sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>AprovAI · Ferramenta educacional</span><span>Correção orientativa baseada nas competências do ENEM.</span></div></footer>
        <SupportChat correction={result} />
    </div>
  );
}
