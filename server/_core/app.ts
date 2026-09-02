import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook } from "../billing";
import type { Server } from "http";

export async function createApp(options: { server?: Server; serveFrontend?: boolean } = {}) {
  const app = express();

  // Stripe webhook must receive the raw body before JSON parsing for signature verification.
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
    void handleStripeWebhook(req.body as Buffer, req.header("stripe-signature"), res);
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ ok: true, service: "aprovai-api" });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (options.serveFrontend !== false) {
    if (process.env.NODE_ENV === "development" && options.server) {
      await setupVite(app, options.server);
    } else {
      serveStatic(app);
    }
  }

  return app;
}
