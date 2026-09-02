import { describe, expect, it } from "vitest";
import { appRouter, correctionInputSchema, correctionSchema } from "./routers";

const competency = (score: number) => ({ score, title: "Competência", summary: "Resumo", details: ["Observação"], evidence: ["Trecho observável da redação"], verdict: "Veredito", protocolFindings: { grammar: "Identificado — análise", syntax: "Identificado — análise", theme: "Identificado — análise", textType: "Identificado — análise", repertoire: "Identificado — análise", project: "Identificado — análise", coherence: "Identificado — análise", interparagraphCohesion: "Identificado — análise", intraparagraphCohesion: "Identificado — análise", cohesionInadequacies: "Não identificado — sem ocorrência" } });

const validCorrection = {
  finalScore: 800,
  transcription: "Texto transcrito",
  competencies: [competency(160), competency(160), competency(160), competency(160), competency(160)],
  intervention: { agent: "Estado", action: "promover", means: "por meio de campanhas", purpose: "para ampliar o acesso", detail: "com foco em escolas públicas", viability: "É viável e respeita os direitos humanos.", checklist: { agent: "Identificado — Estado", action: "Identificado — promover", means: "Identificado — campanhas", purpose: "Identificado — ampliar acesso", detail: "Identificado — foco em escolas públicas" } },
  pedagogicalReport: "Continue praticando.",
  warning: "",
};

describe("correctionSchema", () => {
  it("aceita exatamente cinco competências e uma nota final válida", () => {
    expect(correctionSchema.parse(validCorrection).competencies).toHaveLength(5);
  });

  it("rejeita uma entrada sem texto e sem imagem", async () => {
    expect(() => correctionInputSchema.parse({})).toThrow();
    const caller = appRouter.createCaller({} as never);
    await expect(caller.correction.analyze({})).rejects.toThrow();
  });

  it("rejeita uma nota final que não corresponde à soma das competências", () => {
    expect(() => correctionSchema.parse({ ...validCorrection, finalScore: 760 })).toThrow("A nota final deve ser a soma das cinco competências.");
  });

  it("rejeita uma correção com seis competências", () => {
    expect(() => correctionSchema.parse({ ...validCorrection, competencies: [...validCorrection.competencies, competency(200)] })).toThrow();
  });

  it("aceita evidência curta, desde que não esteja vazia", () => {
    const correction = {
      ...validCorrection,
      competencies: validCorrection.competencies.map((item, index) => index === 3 ? { ...item, evidence: ["C1"] } : item),
    };
    expect(correctionSchema.parse(correction).competencies[3]?.evidence).toEqual(["C1"]);
  });
});
