import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseAuthConfigured, supabase } from "@/lib/supabase";
import { Loader2, LogIn, LogOut, UserRound } from "lucide-react";
import type { User } from "@supabase/supabase-js";

type AuthDialogProps = {
  user: User | null;
  onUserChange: (user: User | null) => void;
  triggerLabel?: string;
  triggerClassName?: string;
};

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (normalized.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (normalized.includes("user already registered")) return "Este e-mail já possui cadastro. Tente entrar.";
  if (normalized.includes("password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (normalized.includes("unsupported provider") || normalized.includes("provider is not enabled")) return "O login com Google ainda não está ativado no Supabase. Ative Google em Authentication → Providers → Google e salve a configuração.";
  return message;
}

export default function AuthDialog({ user, onUserChange, triggerLabel = "Entrar", triggerClassName = "" }: AuthDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => onUserChange(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, [onUserChange]);

  const runAuth = async (action: () => Promise<{ error: { message: string } | null }>) => {
    setBusy(true);
    toast.dismiss();
    try {
      const { error: authError } = await action();
      if (authError) throw authError;
      toast.success(mode === "signup" ? "Cadastro criado com sucesso." : "Login realizado com sucesso.");
    } catch (authError) {
      toast.error(friendlyAuthError(authError instanceof Error ? authError.message : "Não foi possível concluir a autenticação."));
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    const client = supabase;
    if (password.length < 6) {
      toast.info("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    await runAuth(async () => {
      if (mode === "signup") {
        const result = await client.auth.signUp({ email: email.trim(), password });
        if (!result.error && !result.data.session) toast.info("Cadastro criado. Confira seu e-mail para confirmar a conta.");
        return result;
      }
      const result = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (!result.error) setOpen(false);
      return result;
    });
  };

  const loginWithGoogle = () => {
    if (!supabase) return;
    const client = supabase;
    void runAuth(() => client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } }));
  };

  const resetPassword = async () => {
    if (!supabase || !email.trim()) {
      toast.info("Informe seu e-mail para recuperar a senha.");
      return;
    }
    const client = supabase;
    await runAuth(() => client.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/` }));
    toast.success("Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.");
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    onUserChange(null);
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-[180px] truncate text-xs font-semibold text-[#66708a] sm:inline">{user.email}</span>
        <Button variant="outline" size="sm" onClick={() => void signOut()} className="gap-2 rounded-full border-[#dfe4f1] bg-white">
          <LogOut className="h-3.5 w-3.5" /> Sair
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={`gap-2 rounded-full border-[#dfe4f1] bg-white text-[#3155d8] ${triggerClassName}`}>
          <UserRound className="h-3.5 w-3.5" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-0 p-6 sm:max-w-[430px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#17233d]">{mode === "login" ? "Acesse sua conta" : "Crie sua conta"}</DialogTitle>
          <DialogDescription className="text-[#66708a]">Salve suas correções e acompanhe sua evolução.</DialogDescription>
        </DialogHeader>
        {!isSupabaseAuthConfigured && <p className="text-xs font-medium text-[#b94242]">A autenticação ainda não foi configurada neste ambiente.</p>}
        <div className="space-y-4 pt-2">
          <Button type="button" variant="outline" disabled={busy || !supabase} onClick={loginWithGoogle} className="h-11 w-full gap-3 rounded-xl border-[#d9deeb] bg-white font-semibold text-[#17233d]">
            <span className="text-lg font-bold text-[#4285F4]">G</span> Continuar com Google
          </Button>
          <div className="flex items-center gap-3 text-xs text-[#9aa2b5]"><div className="h-px flex-1 bg-[#e6e9f2]" />ou<div className="h-px flex-1 bg-[#e6e9f2]" /></div>
          <form onSubmit={(event) => void submitEmail(event)} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="auth-email">E-mail</Label><Input id="auth-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" required /></div>
            <div className="space-y-2"><Label htmlFor="auth-password">Senha</Label><Input id="auth-password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 6 caracteres" minLength={6} required /></div>
            <Button type="submit" disabled={busy || !supabase} className="h-11 w-full rounded-xl bg-[#3155d8] font-semibold hover:bg-[#2747be]">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}{mode === "login" ? "Entrar com e-mail" : "Criar cadastro"}</Button>
          </form>
          {mode === "login" && <button type="button" onClick={() => void resetPassword()} className="w-full text-center text-xs font-semibold text-[#3155d8] hover:underline">Esqueci minha senha</button>}
          <div className="text-center text-sm text-[#66708a]">{mode === "login" ? "Ainda não tem conta?" : "Já possui cadastro?"}{" "}<button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); toast.dismiss(); }} className="font-bold text-[#3155d8] hover:underline">{mode === "login" ? "Criar agora" : "Entrar"}</button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
