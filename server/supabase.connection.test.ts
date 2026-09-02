import { describe, expect, it } from "vitest";

describe("Supabase server connection", () => {
  it("authenticates against the configured REST endpoint", async () => {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(url, "SUPABASE_URL must be configured").toBeTruthy();
    expect(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY must be configured").toBeTruthy();
    expect(url).toMatch(/^https:\/\/[^/]+\.supabase\.co\/?$/);

    const response = await fetch(`${url!.replace(/\/$/, "")}/rest/v1/`, {
      headers: {
        apikey: serviceRoleKey!,
        Authorization: `Bearer ${serviceRoleKey!}`,
      },
    });

    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  }, 15_000);
});
