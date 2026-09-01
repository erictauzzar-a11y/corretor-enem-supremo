import { describe, expect, it } from "vitest";

describe("Gemini API configuration", () => {
  it("accepts the configured API key", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey, "GEMINI_API_KEY must be configured").toBeTruthy();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey!)}`);
    expect(response.ok, `Gemini API returned ${response.status}`).toBe(true);
  }, 30_000);
});
