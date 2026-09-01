import type { User } from "../drizzle/schema";
import { ENV } from "./_core/env";

export type SupabaseCorrection = {
  id: string;
  submission_id: string;
  source_type: "text" | "image";
  original_text: string | null;
  transcription: string;
  final_score: number;
  result: unknown;
  created_at: string;
};

type SupabaseUserRow = { id: string };

function getSupabaseConfig() {
  const url = ENV.supabaseUrl.replace(/\/$/, "");
  const key = ENV.supabaseServiceRoleKey;
  if (!url || !key) return null;
  return { url, key };
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase não está configurado no servidor.");
  const headers = new Headers(init.headers);
  headers.set("apikey", config.key);
  headers.set("Authorization", `Bearer ${config.key}`);
  headers.set("Content-Type", "application/json");
  return fetch(`${config.url}/rest/v1/${path}`, { ...init, headers });
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseConfig());
}

export async function upsertSupabaseUser(user: User) {
  const response = await supabaseFetch("app_users?on_conflict=manus_open_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      manus_open_id: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      login_method: user.loginMethod ?? null,
      role: user.role,
      updated_at: new Date().toISOString(),
      last_signed_in: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error(`Supabase users (${response.status}): ${await response.text()}`);
  const rows = await response.json() as SupabaseUserRow[];
  if (!rows[0]?.id) throw new Error("Supabase não retornou o identificador do usuário.");
  return rows[0].id;
}

async function createSupabaseSubmission(input: { userId: string; originalText?: string; imageSubmitted: boolean }) {
  const response = await supabaseFetch("submissions", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      user_id: input.userId,
      source_type: input.imageSubmitted ? "image" : "text",
      original_text: input.originalText?.trim() || null,
    }),
  });
  if (!response.ok) throw new Error(`Supabase submissions (${response.status}): ${await response.text()}`);
  const rows = await response.json() as Array<{ id: string }>;
  if (!rows[0]?.id) throw new Error("Supabase não retornou o identificador da redação.");
  return rows[0].id;
}

export async function saveSupabaseCorrection(input: {
  user: User;
  originalText?: string;
  imageSubmitted: boolean;
  transcription: string;
  finalScore: number;
  result: unknown;
}) {
  const userId = await upsertSupabaseUser(input.user);
  const submissionId = await createSupabaseSubmission({ userId, originalText: input.originalText, imageSubmitted: input.imageSubmitted });
  const response = await supabaseFetch("corrections", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      user_id: userId,
      submission_id: submissionId,
      source_type: input.imageSubmitted ? "image" : "text",
      original_text: input.originalText?.trim() || null,
      transcription: input.transcription,
      final_score: input.finalScore,
      result: input.result,
    }),
  });
  if (!response.ok) throw new Error(`Supabase corrections (${response.status}): ${await response.text()}`);
}

export async function listSupabaseCorrections(user: User, limit = 20) {
  const userId = await upsertSupabaseUser(user);
  const response = await supabaseFetch(`corrections?user_id=eq.${encodeURIComponent(userId)}&select=id,submission_id,source_type,original_text,transcription,final_score,result,created_at&order=created_at.desc&limit=${Math.min(Math.max(limit, 1), 50)}`);
  if (!response.ok) throw new Error(`Supabase history (${response.status}): ${await response.text()}`);
  return await response.json() as SupabaseCorrection[];
}
