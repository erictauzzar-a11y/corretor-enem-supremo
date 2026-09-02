import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { authenticateSupabaseRequest } from "../supabase";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    const authorization = opts.req.headers.authorization;
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;
    user = await authenticateSupabaseRequest(accessToken);
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
