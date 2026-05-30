import {
  extractGeminiGeneratedText,
  validateGeminiGenerateContentResponse,
} from './gemini-response';

describe('validateGeminiGenerateContentResponse', () => {
  it('accepts a minimal valid response', () => {
    expect(
      validateGeminiGenerateContentResponse({
        candidates: [{ content: { parts: [{ text: 'Hello!' }] } }],
      }),
    ).toEqual([]);
  });

  it('rejects non-object payloads', () => {
    expect(validateGeminiGenerateContentResponse(null)).toEqual([
      'response must be a JSON object',
    ]);
  });

  it('rejects missing or empty candidates', () => {
    expect(validateGeminiGenerateContentResponse({ candidates: [] })).toEqual([
      'candidates must be a non-empty array',
    ]);
  });

  it('rejects missing text in the first part', () => {
    expect(
      validateGeminiGenerateContentResponse({
        candidates: [{ content: { parts: [{ text: '' }] } }],
      }),
    ).toEqual(['candidates[0].content.parts[0].text must be a non-empty string']);
  });
});

describe('extractGeminiGeneratedText', () => {
  it('returns the first candidate text', () => {
    expect(
      extractGeminiGeneratedText({
        candidates: [{ content: { parts: [{ text: 'Stay on track!' }] } }],
      }),
    ).toBe('Stay on track!');
  });

  it('throws with a descriptive error for malformed payloads', () => {
    expect(() => extractGeminiGeneratedText({ foo: 1 })).toThrow(
      /Invalid Gemini API response/,
    );
  });
});
