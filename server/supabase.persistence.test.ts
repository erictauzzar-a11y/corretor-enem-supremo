import { afterEach, describe, expect, it, vi } from "vitest";
import { listSupabaseCorrections, saveSupabaseCorrection } from "./supabase";

const user = {
  id: 1,
  openId: "manus-user-1",
  name: "Usuário de teste",
  email: "teste@example.com",
  loginMethod: "oauth",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("Supabase correction persistence", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("upserts the user and stores correction metadata without the image payload", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "user-row-1" }]), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "submission-row-1" }]), { status: 201 }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await saveSupabaseCorrection({
      user,
      originalText: "",
      imageSubmitted: true,
      transcription: "Texto transcrito",
      finalScore: 800,
      result: { finalScore: 800 },
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const userBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    const submissionBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    const correctionBody = JSON.parse(fetchMock.mock.calls[2][1].body);
    expect(userBody.manus_open_id).toBe("manus-user-1");
    expect(submissionBody.source_type).toBe("image");
    expect(correctionBody.submission_id).toBe("submission-row-1");
    expect(correctionBody.source_type).toBe("image");
    expect(correctionBody.transcription).toBe("Texto transcrito");
    expect(correctionBody).not.toHaveProperty("imageDataUrl");
  });

  it("queries history with the authenticated user's Supabase id filter", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "user-row-2" }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "correction-2", submission_id: "submission-2", source_type: "text", original_text: "Minha redação", transcription: "Minha redação", final_score: 800, result: {}, created_at: new Date().toISOString() }]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const history = await listSupabaseCorrections({ ...user, openId: "manus-user-2" });

    expect(history).toHaveLength(1);
    expect(fetchMock.mock.calls[1][0]).toContain("user_id=eq.user-row-2");
    expect(fetchMock.mock.calls[1][0]).not.toContain("manus-user-1");
  });
});
