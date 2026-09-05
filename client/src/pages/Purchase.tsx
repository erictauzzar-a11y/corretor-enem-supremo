import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Crown, ArrowLeft, Check, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthDialog from "@/components/AuthDialog";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";

const benefits = [
  "Correções ilimitadas por texto e imagem",
  "Análise pedagógica completa das cinco competências",
  "Histórico de redações por conta",
  "Relatório em PDF para estudar e revisar",
];

export default function Purchase() {
  const [, navigate] = useLocation();
  const [authUser, setAuthUser] = useState<import("@supabase/supabase-js").User | null>(null);
  const billingQuery = trpc.billing.status.useQuery(undefined, { enabled: Boolean(authUser), retry: false });
  const checkout = trpc.billing.checkout.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: error => toast.error(error.message || "Não foi possível iniciar a compra."),
  });

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setAuthUser(data.user));
  }, []);

  useEffect(() => {
    if (billingQuery.data?.paid) toast.success("Sua assinatura AprovAI já está ativa.");
  }, [billingQuery.data?.paid]);

  const startCheckout = () => {
    if (!authUser) {
      toast.info("Crie sua conta ou entre antes de continuar para o pagamento.");
      return;
    }
    checkout.mutate();
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-5 py-8 text-[#17233d] sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm font-semibold text-[#66708a] transition hover:text-[#3155d8]"><ArrowLeft className="h-4 w-4" />Voltar para a correção</button>
          <AuthDialog user={authUser} onUserChange={setAuthUser} />
        </div>
        <section className="mt-12 grid items-stretch gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="pt-3">
            <div className="eyebrow"><span className="eyebrow-dot" /> PLANO APROVAI</div>
            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-[-0.04em] sm:text-5xl">Estude com um diagnóstico completo da sua redação.</h1>
            <p className="mt-6 max-w-xl text-[17px] leading-8 text-[#66708a]">Crie sua conta, ative o plano anual e tenha acesso a todos os recursos que ajudam você a evoluir uma competência por vez.</p>
            <div className="mt-8 space-y-3">{benefits.map(benefit => <div key={benefit} className="flex items-center gap-3 text-sm font-semibold text-[#4b5875]"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e5ecff] text-[#3155d8]"><Check className="h-4 w-4" /></span>{benefit}</div>)}</div>
          </div>
          <Card className="rounded-[24px] border-[#dfe5ff] bg-white shadow-[0_24px_70px_rgba(39,57,107,0.12)]">
            <CardHeader className="border-b border-[#eef0f6] px-7 pb-5 pt-7"><div className="flex items-center gap-2 text-[#3155d8]"><Crown className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.18em]">AprovAI anual</span></div><CardTitle className="mt-3 text-3xl font-extrabold">R$ 53,90<span className="text-base font-semibold text-[#8891a6]"> / ano</span></CardTitle><p className="text-sm leading-6 text-[#66708a]">Renovação automática anual.</p></CardHeader>
            <CardContent className="px-7 pb-7 pt-6">
              {billingQuery.data?.paid ? <div className="rounded-2xl bg-[#f2fbf5] p-4 text-sm leading-6 text-[#24734a]"><div className="flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4" />Plano ativo</div><p className="mt-2">Sua conta já possui acesso completo ao AprovAI.</p></div> : <><p className="text-sm leading-6 text-[#66708a]">Você poderá criar sua conta ou entrar antes de concluir o pagamento seguro.</p>{authUser ? <Button onClick={startCheckout} disabled={checkout.isPending} className="mt-6 h-12 w-full rounded-xl bg-[#3155d8] font-bold text-white hover:bg-[#2546c3]">{checkout.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crown className="mr-2 h-4 w-4" />}Continuar para pagamento</Button> : <div className="mt-6"><AuthDialog user={authUser} onUserChange={setAuthUser} triggerLabel="Criar conta e continuar" triggerClassName="h-12 w-full rounded-xl border-[#3155d8] bg-[#3155d8] text-white hover:bg-[#2546c3] hover:text-white" /></div>}<p className="mt-4 text-center text-xs leading-5 text-[#8891a6]">O pagamento será conectado ao checkout seguro configurado no servidor.</p></>}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
