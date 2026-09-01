import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
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

const correctionJsonSchema = {
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
            score: { type: "integer", enum: [0, 40, 80, 120, 160, 200] },
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

const systemPrompt = `Você é o Corretor ENEM Supremo, especialista na matriz oficial do ENEM. Corrija a redação com rigor, precisão e acolhimento pedagógico. A nota de cada competência só pode ser 0, 40, 80, 120, 160 ou 200; a nota final é a soma. Analise norma culta, tema, tipo dissertativo-argumentativo, repertório legítimo e produtivo, projeto de texto, coerência, coesão e proposta de intervenção. Para a Competência 5, avalie agente, ação, meio/modo, finalidade/efeito e detalhamento. Nunca invente erros: cite apenas problemas observáveis. Em namedFindings, use rótulos explícitos quando aplicável: "Desvios Gramaticais e Ortográficos", "Falhas de Estrutura Sintática", "Adequação ao Tema", "Tipo Textual", "Repertório Legítimo e Produtivo", "Projeto de Texto", "Coerência e Argumentação", "Coesão Interparágrafos", "Coesão Intraparágrafos" e "Inadequações Coesivas". Na intervenção, cada campo deve começar por "Identificado —" ou "Não identificado —", com a explicação correspondente. Se a imagem estiver ilegível, indique isso em warning. Responda exclusivamente no JSON solicitado, em português do Brasil.`;

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
        const content = [
          { type: "text" as const, text: `Faça a correção completa seguindo o protocolo. ${input.text?.trim() ? `Redação digitada:\n${input.text.trim()}` : "A redação foi enviada como imagem; transcreva-a antes da análise."}` },
          ...(input.imageDataUrl ? [{ type: "image_url" as const, image_url: { url: input.imageDataUrl, detail: "high" as const } }] : []),
        ];
        const response = await invokeLLM({
          model: "gemini-3-flash-preview",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content }],
          maxTokens: 12000,
          responseFormat: { type: "json_schema", json_schema: correctionJsonSchema },
        });
        const raw = response.choices[0]?.message?.content;
        const jsonText = typeof raw === "string" ? raw : JSON.stringify(raw);
        return correctionSchema.parse(JSON.parse(jsonText));
      }),
  }),
});

export type AppRouter = typeof appRouter;
