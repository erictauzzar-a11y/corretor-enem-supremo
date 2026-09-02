import { describe, expect, it } from "vitest";
import { isSupportQuestionInScope, supportInputSchema, supportOutOfScopeMessage } from "./routers";

describe("support input", () => {
  it("aceita uma pergunta contextual com histórico curto", () => {
    expect(supportInputSchema.parse({ message: "Como baixo meu PDF?", history: [] })).toMatchObject({ message: "Como baixo meu PDF?", history: [] });
  });

  it("limita a mensagem e o histórico enviados ao modelo", () => {
    expect(() => supportInputSchema.parse({ message: "x", history: [] })).toThrow();
    expect(() => supportInputSchema.parse({ message: "Como funciona?", history: Array.from({ length: 9 }, () => ({ role: "user", content: "Oi" })) })).toThrow();
    expect(supportInputSchema.parse({ message: "Por que tirei 120 na C2?", history: [], correctionContext: "C2: 120" })).toMatchObject({ correctionContext: "C2: 120" });
  });

  it("classifica e bloqueia assuntos fora do escopo", () => {
    expect(isSupportQuestionInScope("Como posso melhorar minha competência 2?"),).toBe(true);
    expect(isSupportQuestionInScope("Qual é a previsão do tempo?"),).toBe(false);
    expect(supportOutOfScopeMessage).toContain("AprovAI");
  });
});
