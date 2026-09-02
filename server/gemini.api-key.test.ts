import { describe, expect, it } from "vitest";
import { GEMINI_GENERATION_CONFIG } from "./routers";

describe("Gemini API configuration", () => {
  it("uses deterministic generation settings for scoring", () => {
    expect(GEMINI_GENERATION_CONFIG.temperature).toBe(0);
    expect(GEMINI_GENERATION_CONFIG.topP).toBe(0.1);
    expect(GEMINI_GENERATION_CONFIG.seed).toBe(17);
    expect(GEMINI_GENERATION_CONFIG.candidateCount).toBe(1);
  });

  it("accepts the configured API key", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey, "GEMINI_API_KEY must be configured").toBeTruthy();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey!)}`);
    expect(response.ok, `Gemini API returned ${response.status}`).toBe(true);
  }, 30_000);
});
