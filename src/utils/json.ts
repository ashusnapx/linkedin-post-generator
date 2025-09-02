// src/utils/json.ts
/**
 * Try to clean common non-strict JSON wrapper issues and parse safely.
 * Returns parsed object or null if parsing fails.
 */
export function safeJSONParse(raw: string): unknown | null {
  try {
    let cleaned = (raw ?? "").toString().trim();

    // Remove triple backtick fences and optional language tag
    cleaned = cleaned
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    // Sometimes LLMs append stray text after JSON; attempt to extract the first JSON-like substring
    const firstBrace = cleaned.indexOf("{");
    const firstBracket = cleaned.indexOf("[");
    if (firstBrace > -1 || firstBracket > -1) {
      const start = Math.min(
        ...[firstBrace, firstBracket].filter((i) => i >= 0)
      );
      cleaned = cleaned.slice(start);
    }

    // Remove trailing commas before closing braces/brackets
    cleaned = cleaned.replace(/,\s*(\}|\])/g, "$1");

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("safeJSONParse error:", err);
    return null;
  }
}
