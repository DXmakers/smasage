/**
 * Gemini generateContent response validation — Issue #124.
 *
 * `response.json()` is typed as `unknown` under strict mode. These helpers
 * validate the minimal shape we depend on before reading generated text.
 */

export interface GeminiGenerateContentResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Validate an unknown JSON value as a Gemini generateContent response.
 * Returns a list of human-readable errors; empty list means valid.
 */
export function validateGeminiGenerateContentResponse(
  data: unknown,
): string[] {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return ['response must be a JSON object'];
  }

  const candidates = data.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    errors.push('candidates must be a non-empty array');
    return errors;
  }

  const first = candidates[0];
  if (!isRecord(first)) {
    errors.push('candidates[0] must be an object');
    return errors;
  }

  const content = first.content;
  if (!isRecord(content)) {
    errors.push('candidates[0].content must be an object');
    return errors;
  }

  const parts = content.parts;
  if (!Array.isArray(parts) || parts.length === 0) {
    errors.push('candidates[0].content.parts must be a non-empty array');
    return errors;
  }

  const firstPart = parts[0];
  if (!isRecord(firstPart)) {
    errors.push('candidates[0].content.parts[0] must be an object');
    return errors;
  }

  if (!isNonEmptyString(firstPart.text)) {
    errors.push('candidates[0].content.parts[0].text must be a non-empty string');
  }

  return errors;
}

/**
 * Extract generated text from a validated Gemini response.
 * Throws if the payload does not match the expected shape.
 */
export function extractGeminiGeneratedText(data: unknown): string {
  const errors = validateGeminiGenerateContentResponse(data);
  if (errors.length > 0) {
    throw new Error(`Invalid Gemini API response: ${errors.join('; ')}`);
  }

  const response = data as GeminiGenerateContentResponse;
  return response.candidates[0].content.parts[0].text;
}
