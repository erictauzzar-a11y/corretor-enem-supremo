import { describe, expect, it } from "vitest";
import Stripe from "stripe";
import { ANNUAL_PRICE_BRL, buildCheckoutParameters, getCorrectionAccess, handleStripeWebhook, hasPaidAccess } from "./billing";
import { toFreeCorrection } from "./routers";

describe("billing access", () => {
  it("defines the annual offer at R$ 37", () => {
    expect(ANNUAL_PRICE_BRL).toBe(3700);
  });

  it("builds a yearly BRL checkout linked to the authenticated user", () => {
    const params = buildCheckoutParameters({ openId: "user-123", email: "aluno@example.com", name: "Aluno", id: 1, role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, "https://corretor.example");
    expect(params.mode).toBe("subscription");
    expect(params.line_items[0]?.price_data.currency).toBe("brl");
    expect(params.line_items[0]?.price_data.unit_amount).toBe(3700);
    expect(params.line_items[0]?.price_data.recurring.interval).toBe("year");
    expect(params.client_reference_id).toBe("user-123");
    expect(params.metadata.user_open_id).toBe("user-123");
  });

  it("enforces the free correction policy server-side", () => {
    expect(getCorrectionAccess(undefined, { text: "redação" })).toMatchObject({ paid: false, allowed: true });
    expect(getCorrectionAccess(undefined, { imageDataUrl: "data:image/png;base64,abc" })).toMatchObject({ paid: false, allowed: false });
    expect(getCorrectionAccess({ freeCorrectionUsedAt: new Date() } as never, { text: "segunda" })).toMatchObject({ paid: false, allowed: false });
    expect(getCorrectionAccess({ subscriptionStatus: "active", currentPeriodEnd: new Date(Date.now() + 86_400_000) } as never, { imageDataUrl: "data:image/png;base64,abc" })).toMatchObject({ paid: true, allowed: true });
  });

  it("allows access only for an active, non-expired subscription", () => {
    expect(hasPaidAccess({ subscriptionStatus: "active", currentPeriodEnd: new Date(Date.now() + 86_400_000) } as never)).toBe(true);
    expect(hasPaidAccess({ subscriptionStatus: "active", currentPeriodEnd: new Date(Date.now() - 86_400_000) } as never)).toBe(false);
    expect(hasPaidAccess({ subscriptionStatus: "canceled", currentPeriodEnd: new Date(Date.now() + 86_400_000) } as never)).toBe(false);
    expect(hasPaidAccess(undefined)).toBe(false);
  });

  it("accepts a correctly signed Stripe test webhook", async () => {
    const secret = "whsec_test_secret";
    process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_local";
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    const payload = JSON.stringify({ id: "evt_test_verification", object: "event", api_version: "2026-08-26.dahlia", created: 1, livemode: false, pending_webhooks: 0, request: null, type: "checkout.session.expired", data: { object: { id: "cs_test_1", object: "checkout.session", metadata: { user_open_id: "test-user" }, client_reference_id: "test-user" } } });
    const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret });
    const response = { status: () => response, json: (body: unknown) => body } as never;
    const result = await handleStripeWebhook(Buffer.from(payload), signature, response);
    expect(result).toEqual({ verified: true });
  });

  it("removes premium pedagogical details from the free response", () => {
    const correction = { finalScore: 800, transcription: "texto", competencies: Array.from({ length: 5 }, (_, index) => ({ score: 160 as const, title: `C${index + 1}`, summary: "detalhe", details: ["detalhe"], evidence: ["evidência"], verdict: "veredito", protocolFindings: { grammar: "detalhe" } })), intervention: { agent: "agente", action: "ação", means: "meio", purpose: "fim", detail: "detalhe", viability: "viável", checklist: { agent: "agente", action: "ação", means: "meio", purpose: "fim", detail: "detalhe" } }, pedagogicalReport: "relatório completo", warning: "" };
    const free = toFreeCorrection(correction as never);
    expect(free.freeMode).toBe(true);
    expect(free.pedagogicalReport).toBe("Disponível no plano anual.");
    expect(free.competencies[0]?.evidence).toEqual(["Disponível no plano anual."]);
    expect(free.intervention.action).toBe("Disponível no plano anual.");
  });
});
