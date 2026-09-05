import Stripe from "stripe";
import type { Response } from "express";
import { getBillingAccount, getBillingAccountByCustomerId, upsertBillingAccount } from "./db";
import { ANNUAL_PLAN } from "./products";
import type { User } from "../drizzle/schema";

export const ANNUAL_PRICE_BRL = ANNUAL_PLAN.unitAmount;
export const ANNUAL_PRODUCT_NAME = ANNUAL_PLAN.name;

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY não configurada.");
  return new Stripe(key);
}

export function hasPaidAccess(account: Awaited<ReturnType<typeof getBillingAccount>>) {
  if (!account || account.subscriptionStatus !== "active") return false;
  return !account.currentPeriodEnd || account.currentPeriodEnd.getTime() > Date.now();
}

export function getCorrectionAccess(account: Awaited<ReturnType<typeof getBillingAccount>>, input: { text?: string; imageDataUrl?: string }) {
  const paid = hasPaidAccess(account);
  if (!paid && input.imageDataUrl) return { paid, allowed: false, reason: "A correção por imagem está disponível no plano anual." };
  if (!paid && account?.freeCorrectionUsedAt) return { paid, allowed: false, reason: "Sua correção gratuita já foi utilizada. Ative o plano anual para continuar." };
  return { paid, allowed: true, reason: undefined };
}

export function buildCheckoutParameters(user: User, origin: string, customerId?: string) {
  return {
    mode: "subscription" as const,
    line_items: [{ price: ANNUAL_PLAN.stripePriceId, quantity: 1 }],
    customer: customerId ?? undefined,
    customer_email: customerId ? undefined : user.email ?? undefined,
    client_reference_id: user.openId,
    metadata: { user_open_id: user.openId, customer_email: user.email ?? "", customer_name: user.name ?? "" },
    subscription_data: { metadata: { user_open_id: user.openId } },
    allow_promotion_codes: true,
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
  };
}

export async function createAnnualCheckout(user: User, origin: string) {
  const stripe = stripeClient();
  const account = await getBillingAccount(user.openId);
  const session = await stripe.checkout.sessions.create(buildCheckoutParameters(user, origin, account?.stripeCustomerId ?? undefined));
  if (!session.url) throw new Error("O Stripe não retornou uma URL de checkout.");
  if (session.customer) await upsertBillingAccount({ openId: user.openId, stripeCustomerId: String(session.customer) });
  return session.url;
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string | undefined, res: Response) {
  const stripe = stripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: "STRIPE_WEBHOOK_SECRET não configurada." });
  if (!signature) return res.status(400).json({ error: "Assinatura do webhook ausente." });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return res.status(400).json({ error: "Assinatura do webhook inválida." });
  }
  if (event.id.startsWith("evt_test_")) return res.json({ verified: true });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const openId = session.metadata?.user_open_id ?? session.client_reference_id;
    if (openId) await upsertBillingAccount({ openId, stripeCustomerId: session.customer ? String(session.customer) : null, stripeSubscriptionId: session.subscription ? String(session.subscription) : null, subscriptionStatus: "active" });
  }
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const metadataOpenId = (invoice as unknown as { subscription_details?: { metadata?: { user_open_id?: string } } }).subscription_details?.metadata?.user_open_id;
    const customerId = invoice.customer ? String(invoice.customer) : undefined;
    const existing = customerId ? await getBillingAccountByCustomerId(customerId) : undefined;
    const openId = metadataOpenId ?? existing?.openId;
    if (openId) await upsertBillingAccount({ openId, stripeCustomerId: customerId ?? existing?.stripeCustomerId ?? null, stripeSubscriptionId: existing?.stripeSubscriptionId ?? null, subscriptionStatus: "past_due", currentPeriodEnd: existing?.currentPeriodEnd ?? null });
  }
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const openId = session.metadata?.user_open_id ?? session.client_reference_id;
    if (openId) {
      const existing = await getBillingAccount(openId);
      await upsertBillingAccount({ openId, stripeCustomerId: existing?.stripeCustomerId ?? null, stripeSubscriptionId: existing?.stripeSubscriptionId ?? null, subscriptionStatus: "checkout_expired", currentPeriodEnd: existing?.currentPeriodEnd ?? null, freeCorrectionUsedAt: existing?.freeCorrectionUsedAt ?? null });
    }
  }
  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const openId = subscription.metadata?.user_open_id;
    const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
    if (openId) await upsertBillingAccount({ openId, stripeCustomerId: String(subscription.customer), stripeSubscriptionId: subscription.id, subscriptionStatus: subscription.status, currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null });
  }
  return res.json({ received: true });
}
