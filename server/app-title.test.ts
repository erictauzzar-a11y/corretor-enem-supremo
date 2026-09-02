import { describe, expect, it } from "vitest";

describe("public app configuration", () => {
  it("loads the managed AprovAI title", async () => {
    const response = await fetch("https://example.com", { method: "HEAD" });
    expect(response.ok).toBe(true);
    expect(process.env.VITE_APP_TITLE).toBe("AprovAI");
  });
});
