import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { z } from "zod";

const officialScore = z.union([z.literal(0), z.literal(40), z.literal(80), z.literal(120), z.literal(160), z.literal(200)]);

export const competencySchema = z.object({
  score: officialScore,
  title: z.string(),
  summary: z.string(),
  details: z.array(z.string()),
  verdict: z.string(),
  protocolFindings: z.object({ grammar: z.string(), syntax: z.string(), theme: z.string(), textType: z.string(), repertoire: z.string(), project: z.string(), coherence: z.string(), interparagraphCohesion: z.string(), intraparagraphCohesion: z.string(), cohesionInadequacies: z.string() }),
});

export const correctionSchema = z.object({
  finalScore: z.number().int().min(0).max(1000),
  transcription: z.string(),
  competencies: z.array(competencySchema).length(5),
  intervention: z.object({
    agent: z.string(),
    action: z.string(),
    means: z.string(),
    purpose: z.string(),
    detail: z.string(),
    viability: z.string(),
    checklist: z.object({ agent: z.string(), action: z.string(), means: z.string(), purpose: z.string(), detail: z.string() }),
  }),
  pedagogicalReport: z.string(),
  warning: z.string(),
}).superRefine((value, ctx) => {
  const sum = value.competencies.reduce((total, item) => total + item.score, 0);
  if (sum !== value.finalScore) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["finalScore"], message: "A nota final deve ser a soma das cinco competências." });
});

export const correctionJsonSchema = {
  name: "enem_correction",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["finalScore", "transcription", "competencies", "intervention", "pedagogicalReport", "warning"],
    properties: {
      finalScore: { type: "integer", minimum: 0, maximum: 1000 },
      transcription: { type: "string" },
      competencies: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["score", "title", "summary", "details", "verdict", "protocolFindings"],
          properties: {
            score: { type: "integer", minimum: 0, maximum: 200, multipleOf: 40 },
            title: { type: "string" },
            summary: { type: "string" },
            details: { type: "array", items: { type: "string" } },
            verdict: { type: "string" },
            protocolFindings: { type: "object", additionalProperties: false, required: ["grammar", "syntax", "theme", "textType", "repertoire", "project", "coherence", "interparagraphCohesion", "intraparagraphCohesion", "cohesionInadequacies"], properties: { grammar: { type: "string" }, syntax: { type: "string" }, theme: { type: "string" }, textType: { type: "string" }, repertoire: { type: "string" }, project: { type: "string" }, coherence: { type: "string" }, interparagraphCohesion: { type: "string" }, intraparagraphCohesion: { type: "string" }, cohesionInadequacies: { type: "string" } } },
          },
        },
      },
      intervention: {
        type: "object",
        additionalProperties: false,
        required: ["agent", "action", "means", "purpose", "detail", "viability", "checklist"],
        properties: {
          agent: { type: "string" },
          action: { type: "string" },
          means: { type: "string" },
          purpose: { type: "string" },
          detail: { type: "string" },
          viability: { type: "string" }, checklist: { type: "object", additionalProperties: false, required: ["agent", "action", "means", "purpose", "detail"], properties: { agent: { type: "string" }, action: { type: "string" }, means: { type: "string" }, purpose: { type: "string" }, detail: { type: "string" } } },
        },
      },
      pedagogicalReport: { type: "string" },
      warning: { type: "string" },
    },
  },
} as const;

export const correctionInputSchema = z.object({
  text: z.string().max(20000).optional(),
  imageDataUrl: z.string().max(12000000).optional(),
}).refine(input => Boolean(input.text?.trim() || input.imageDataUrl), { message: "Envie o texto ou uma imagem da redação." });

const systemPrompt = `Você é o Corretor ENEM Supremo, especialista na matriz oficial do ENEM. Corrija a redação com rigor, precisão e acolhimento pedagógico. A nota de cada competência só pode ser 0, 40, 80, 120, 160 ou 200; a nota final é a soma. Analise norma culta, tema, tipo dissertativo-argumentativo, repertório legítimo e produtivo, projeto de texto, coerência, coesão e proposta de intervenção. Para a Competência 5, avalie agente, ação, meio/modo, finalidade/efeito e detalhamento. Nunca invente erros: cite apenas problemas observáveis. Em protocolFindings, use exatamente as chaves técnicas do contrato e escreva os valores em português claro. Na intervenção, cada campo deve começar por "Identificado —" ou "Não identificado —", com a explicação correspondente. Se a imagem estiver ilegível, indique isso em warning. Responda exclusivamente no JSON solicitado, em português do Brasil.`;

const geminiSchema = {
  type: "OBJECT",
  properties: {
    finalScore: { type: "INTEGER" }, transcription: { type: "STRING" },
    competencies: { type: "ARRAY", items: { type: "OBJECT", properties: {
      score: { type: "INTEGER" }, title: { type: "STRING" }, summary: { type: "STRING" }, details: { type: "ARRAY", items: { type: "STRING" } }, verdict: { type: "STRING" },
      protocolFindings: { type: "OBJECT", properties: {
        grammar: { type: "STRING" }, syntax: { type: "STRING" }, theme: { type: "STRING" }, textType: { type: "STRING" }, repertoire: { type: "STRING" }, project: { type: "STRING" }, coherence: { type: "STRING" }, interparagraphCohesion: { type: "STRING" }, intraparagraphCohesion: { type: "STRING" }, cohesionInadequacies: { type: "STRING" }
      }, required: ["grammar", "syntax", "theme", "textType", "repertoire", "project", "coherence", "interparagraphCohesion", "intraparagraphCohesion", "cohesionInadequacies"] }
    }, required: ["score", "title", "summary", "details", "verdict", "protocolFindings"] } },
    intervention: { type: "OBJECT", properties: {
      agent: { type: "STRING" }, action: { type: "STRING" }, means: { type: "STRING" }, purpose: { type: "STRING" }, detail: { type: "STRING" }, viability: { type: "STRING" },
      checklist: { type: "OBJECT", properties: { agent: { type: "STRING" }, action: { type: "STRING" }, means: { type: "STRING" }, purpose: { type: "STRING" }, detail: { type: "STRING" } }, required: ["agent", "action", "means", "purpose", "detail"] }
    }, required: ["agent", "action", "means", "purpose", "detail", "viability", "checklist"] },
    pedagogicalReport: { type: "STRING" }, warning: { type: "STRING" }
  }, required: ["finalScore", "transcription", "competencies", "intervention", "pedagogicalReport", "warning"]
} as const;

async function invokeGemini(text: string, imageDataUrl?: string) {
  if (!ENV.geminiApiKey) throw new Error("GEMINI_API_KEY não configurada no servidor.");
  const parts: Array<Record<string, unknown>> = [{ text }];
  if (imageDataUrl) {
    const match = imageDataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!match) throw new Error("Imagem inválida: envie JPG ou PNG em formato válido.");
    parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
  }
  const requestBody = JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents: [{ role: "user", parts }], generationConfig: { temperature: 0.2, responseMimeType: "application/json", responseSchema: geminiSchema } });
  let response: Response;
  let payload = {} as { error?: { message?: string }; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${ENV.geminiModel}:generateContent?key=${encodeURIComponent(ENV.geminiApiKey)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: requestBody });
    payload = await response.json() as typeof payload;
    if (response.ok) break;
    if (![429, 500, 503].includes(response.status) || attempt === 2) throw new Error(`Gemini API (${response.status}): ${payload.error?.message ?? "erro desconhecido"}`);
    await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
  }
  const jsonText = payload.candidates?.[0]?.content?.parts?.map(part => part.text ?? "").join("").trim();
  if (!jsonText) throw new Error("O Gemini não retornou uma análise utilizável.");
  return JSON.parse(jsonText);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie("app_session_id", { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  correction: router({
    analyze: publicProcedure
      .input(correctionInputSchema)
      .mutation(async ({ input }) => {
        const prompt = `Faça a correção completa seguindo o protocolo. ${input.text?.trim() ? `Redação digitada:\n${input.text.trim()}` : "A redação foi enviada como imagem; transcreva-a antes da análise."}`;
        const raw = await invokeGemini(prompt, input.imageDataUrl);
        return correctionSchema.parse(raw);
      }),
  }),
});

export type AppRouter = typeof appRouter;
