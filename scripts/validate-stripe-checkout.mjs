import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("STRIPE_SECRET_KEY ausente");
const stripe = new Stripe(key);
const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [{ price_data: { currency: "brl", unit_amount: 3700, recurring: { interval: "year" }, product_data: { name: "Corretor ENEM Supremo — Plano Anual" } }, quantity: 1 }],
  client_reference_id: "integration-test",
  metadata: { user_open_id: "integration-test" },
  subscription_data: { metadata: { user_open_id: "integration-test" } },
  success_url: "https://example.com/success",
  cancel_url: "https://example.com/cancel",
});
console.log(JSON.stringify({ idPrefix: session.id.slice(0, 8), hasUrl: Boolean(session.url), mode: session.mode, amount: session.amount_total ?? null }));
