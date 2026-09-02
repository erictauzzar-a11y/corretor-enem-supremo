import { describe, expect, it, vi } from "vitest";

vi.mock("./billing", async () => {
  const actual = await vi.importActual<typeof import("./billing")>("./billing");
  return { ...actual, createAnnualCheckout: vi.fn().mockResolvedValue("https://checkout.stripe.com/c/test-session") };
});

const { appRouter } = await import("./routers");

describe("billing.checkout", () => {
  it("returns a Stripe checkout URL for an authenticated user", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "user-123", email: "aluno@example.com", name: "Aluno", loginMethod: "supabase", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", get: () => "corretor.example", headers: {} } as never,
      res: {} as never,
    });
    await expect(caller.billing.checkout()).resolves.toEqual({ url: "https://checkout.stripe.com/c/test-session" });
  });
});
