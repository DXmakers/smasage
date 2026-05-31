import {
  extractGeminiGeneratedText,
  extractGeminiGeneratedTextSafe,
  validateGeminiGenerateContentResponse,
} from "./gemini-response";

describe("validateGeminiGenerateContentResponse", () => {
  it("accepts a minimal valid response", () => {
    expect(
      validateGeminiGenerateContentResponse({
        candidates: [{ content: { parts: [{ text: "Hello!" }] } }],
      }),
    ).toEqual([]);
  });

  it("rejects non-object payloads", () => {
    expect(validateGeminiGenerateContentResponse(null)).toEqual([
      "response must be a JSON object",
    ]);
  });

  it("rejects missing or empty candidates", () => {
    expect(validateGeminiGenerateContentResponse({ candidates: [] })).toEqual([
      "candidates must be a non-empty array",
    ]);
  });

  it("rejects missing text in the first part", () => {
    expect(
      validateGeminiGenerateContentResponse({
        candidates: [{ content: { parts: [{ text: "" }] } }],
      }),
    ).toEqual([
      "candidates[0].content.parts[0].text must be a non-empty string",
    ]);
  });
});

describe("extractGeminiGeneratedText", () => {
  it("returns the first candidate text", () => {
    expect(
      extractGeminiGeneratedText({
        candidates: [{ content: { parts: [{ text: "Stay on track!" }] } }],
      }),
    ).toBe("Stay on track!");
  });

  it("throws with a descriptive error for malformed payloads", () => {
    expect(() => extractGeminiGeneratedText({ foo: 1 })).toThrow(
      /Invalid Gemini API response/,
    );
  });
});

describe("extractGeminiGeneratedTextSafe", () => {
  it("returns the extracted text for valid responses", () => {
    const result = extractGeminiGeneratedTextSafe(
      {
        candidates: [
          { content: { parts: [{ text: "AI generated message" }] } },
        ],
      },
      "fallback message",
    );
    expect(result).toBe("AI generated message");
  });

  it("returns the fallback for malformed responses", () => {
    const result = extractGeminiGeneratedTextSafe(
      { invalid: "response" },
      "fallback message",
    );
    expect(result).toBe("fallback message");
  });

  it("returns the fallback for null responses", () => {
    const result = extractGeminiGeneratedTextSafe(null, "fallback message");
    expect(result).toBe("fallback message");
  });

  it("returns the fallback for empty candidates", () => {
    const result = extractGeminiGeneratedTextSafe(
      { candidates: [] },
      "fallback message",
    );
    expect(result).toBe("fallback message");
  });

  it("returns the fallback for missing text", () => {
    const result = extractGeminiGeneratedTextSafe(
      {
        candidates: [{ content: { parts: [{ text: "" }] } }],
      },
      "fallback message",
    );
    expect(result).toBe("fallback message");
  });

  it("never throws, even for completely invalid data", () => {
    expect(() => {
      extractGeminiGeneratedTextSafe("not an object", "fallback");
    }).not.toThrow();
  });
});
