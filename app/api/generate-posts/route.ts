// app/api/generate-posts/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * 🔐 Server-only API keys
 * - GEMINI_API_KEY (required)
 * - SERPER_API_KEY (optional: lightweight web search)
 */
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in server environment.");
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * ---- Config / Limits ----
 */
const MAX_POST_COUNT = 10;
const MAX_PROMPT_CHARS = 60_000;
const MAX_OUTPUT_CHARS = 250_000;
const GENERATE_TIMEOUT_MS = 45_000;
const MODEL_NAME = process.env.NEXT_PUBLIC_LLM_MODEL_NAME || "gemini-2.5-pro";
const PLANNER_MODEL = process.env.NEXT_PUBLIC_LLM_PLANNER_MODEL || MODEL_NAME;
const DRAFTER_MODEL = process.env.NEXT_PUBLIC_LLM_DRAFTER_MODEL || MODEL_NAME;
const TOOL_MODEL = process.env.NEXT_PUBLIC_LLM_TOOL_MODEL || MODEL_NAME;

/**
 * Pricing (approx) per 1k tokens. Update as needed.
 */
const GEMINI_RATES: Record<
  string,
  { inputPer1kUSD: number; outputPer1kUSD: number }
> = {
  [MODEL_NAME]: { inputPer1kUSD: 0.000075, outputPer1kUSD: 0.0003 },
  [PLANNER_MODEL]: { inputPer1kUSD: 0.000075, outputPer1kUSD: 0.0003 },
  [DRAFTER_MODEL]: { inputPer1kUSD: 0.000075, outputPer1kUSD: 0.0003 },
  [TOOL_MODEL]: { inputPer1kUSD: 0.000075, outputPer1kUSD: 0.0003 },
};

/**
 * Types
 */
interface GeneratePostRequest {
  topic: string;
  tone?: string;
  audience?: string;
  length?: number | string;
  postCount?: number;
  addHashtags?: boolean;
  addCTA?: boolean;
  language?: string;
  allowEmojis?: boolean;
  includeLinks?: boolean; // if true, agent may run web search and cite
  temperature?: number;
  hashtagLimit?: number;
  ctaStyle?: string;
  readingLevel?: string;
  examples?: string;
  // agent toggles (optional; defaults are safe)
  doPlan?: boolean; // step 1: planner
  doSearch?: boolean; // step 2: web search grounding (if includeLinks also true)
  doGuardrails?: boolean; // step 3: quality filter
}

interface PostOut {
  id: number;
  content: string; // ready-to-render Markdown (with [1], [2] style citations if present)
  citations?: { label: string; url: string }[];
  hashtags?: string[];
  cta?: string;
  flags?: { profanity?: boolean; riskyClaims?: string[] };
}

/**
 * Utilities
 */
async function safeJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

function sanitizeInput(s: unknown, maxChars = 2000): string {
  if (!s && s !== "") return "";
  const str = String(s);
  const cleaned = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
  return cleaned.length <= maxChars ? cleaned : cleaned.slice(0, maxChars);
}

function validatePayload(raw: GeneratePostRequest): GeneratePostRequest {
  if (!raw || !raw.topic) throw new Error("Missing required field: topic");
  const topic = sanitizeInput(raw.topic, 2000);
  if (!topic) throw new Error("topic cannot be empty after sanitization");

  const postCount = Math.max(
    1,
    Math.min(MAX_POST_COUNT, Number(raw.postCount ?? 3) || 3)
  );
  const lengthNum =
    typeof raw.length === "number"
      ? Math.max(20, Math.min(2000, raw.length))
      : (() => {
          const parsed = parseInt(String(raw.length ?? "200"), 10);
          return isNaN(parsed) ? 200 : Math.max(20, Math.min(2000, parsed));
        })();

  return {
    topic,
    tone: sanitizeInput(raw.tone ?? "Startup Founder", 200),
    audience: sanitizeInput(raw.audience ?? "general professionals", 200),
    length: lengthNum,
    postCount,
    addHashtags: Boolean(raw.addHashtags ?? true),
    addCTA: Boolean(raw.addCTA ?? true),
    language: sanitizeInput(raw.language ?? "English", 100),
    allowEmojis: Boolean(raw.allowEmojis ?? true),
    includeLinks: Boolean(raw.includeLinks ?? false),
    temperature:
      typeof raw.temperature === "number"
        ? Math.max(0, Math.min(1, raw.temperature))
        : Number(raw.temperature ?? 0.6),
    hashtagLimit: Math.max(0, Math.min(20, Number(raw.hashtagLimit ?? 5))),
    ctaStyle: sanitizeInput(raw.ctaStyle ?? "Question", 100),
    readingLevel: sanitizeInput(raw.readingLevel ?? "Professional", 100),
    examples: sanitizeInput(raw.examples ?? "", 2000),
    doPlan: raw.doPlan ?? true,
    doSearch: raw.doSearch ?? false, // opt-in search
    doGuardrails: raw.doGuardrails ?? true,
  };
}

/**
 * Web search (optional) via Serper (Google-like JSON). If SERPER_API_KEY missing, returns [].
 */
async function webSearchSerper(
  q: string
): Promise<{ title: string; url: string; snippet?: string }[]> {
  const key = process.env.SERPER_API_KEY;
  if (!key) return [];
  const r = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": key,
    },
    body: JSON.stringify({ q, num: 5 }),
    // You could add gl/country or hl/lang if you want India bias
  });
  if (!r.ok) return [];
  const data = (await r.json()) as any;
  const items = (data?.organic ?? []) as any[];
  return items
    .slice(0, 5)
    .map((it) => ({ title: it.title, url: it.link, snippet: it.snippet }));
}

/**
 * Token counting helper (Gemini SDK APIs sometimes shift; keep try/catch)
 */
async function countTokens(
  modelName: string,
  role: "user" | "model",
  text: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    // @ts-ignore
    const res = await model.countTokens({
      contents: [{ role, parts: [{ text }] }],
    });
    return Number((res as any)?.totalTokens ?? 0);
  } catch {
    return 0;
  }
}

function computeCostUSD(
  modelName: string,
  inToks: number,
  outToks: number
): number {
  const rates = GEMINI_RATES[modelName] ?? {
    inputPer1kUSD: 0.000075,
    outputPer1kUSD: 0.0003,
  };
  const cost =
    (inToks / 1000) * rates.inputPer1kUSD +
    (outToks / 1000) * rates.outputPer1kUSD;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

function buildPlannerPrompt(d: GeneratePostRequest): string {
  const t = `You are a senior LinkedIn content strategist. Create distinct, high-level plans for ${
    d.postCount
  } LinkedIn posts on the topic "${d.topic}" for the audience "${
    d.audience
  }" in a ${d.tone} tone.
- Each plan contains: Hook idea, 3-5 talking points, suggested CTA (${
    d.addCTA ? d.ctaStyle : "None"
  }), and optional example angle.
- Keep language: ${d.language}. Reading level: ${d.readingLevel}. Emojis: ${
    d.allowEmojis ? "Allowed" : "Disallowed"
  }.
- Output as JSON array under key "plans". Example: {"plans":[{"hook":"...","points":["..."],"cta":"..."}]}.
${d.examples ? `Reference style hints: ${d.examples}` : ""}`;
  return t.slice(0, MAX_PROMPT_CHARS);
}

function buildDraftPrompt(
  d: GeneratePostRequest,
  planJson: string,
  searchNotes?: string
): string {
  const citationsGuide = d.includeLinks
    ? `\nCitations: If you use facts from SOURCES, add bracketed numeric citations like [1], [2] inline. After the post, add a \nReferences: list mapping [n] to URLs used.`
    : "";
  const searchBlock = searchNotes
    ? `\nSOURCES (may cite):\n${searchNotes}`
    : "";
  const t = `You are an expert LinkedIn copywriter. Draft ${
    d.postCount
  } concise, high-engagement posts based on the provided PLANS.${citationsGuide}
Audience: ${d.audience} | Tone: ${d.tone} | Language: ${
    d.language
  } | Target length: ~${d.length} words/post | Emojis: ${
    d.allowEmojis ? "Allowed" : "Forbidden"
  }
Hashtags: ${d.addHashtags ? `Yes (max ${d.hashtagLimit})` : "No"} | CTA: ${
    d.addCTA ? `Yes (${d.ctaStyle})` : "No"
  }
Do not number posts. Output RAW Markdown posts only. Separate posts with a line that contains exactly three dashes (---). Each post must start with a bold, scroll-stopping hook line (<= 20 words).${searchBlock}
\nPLANS JSON:\n${planJson}\n`;
  return t.slice(0, MAX_PROMPT_CHARS);
}

function buildHashCtaPrompt(d: GeneratePostRequest, rawPosts: string): string {
  return `Extract up to ${
    d.hashtagLimit
  } unique, relevant hashtags for each post and a single-sentence CTA in the style ${
    d.ctaStyle
  }. Return JSON with array key "enrich" of objects {index: <1-based>, hashtags:["#..."], cta:"..."}. Posts:\n${rawPosts.slice(
    0,
    50_000
  )}`;
}

function extractTextFromResult(result: any): string {
  try {
    if (result?.response?.text && typeof result.response.text === "function")
      return String(result.response.text()).trim();
  } catch {}
  try {
    const cand = result?.response?.candidates;
    if (Array.isArray(cand) && cand.length > 0) {
      const parts = cand[0]?.content?.parts;
      if (Array.isArray(parts)) {
        const joined = parts
          .map((p: any) => p.text ?? "")
          .join("\n")
          .trim();
        if (joined) return joined;
      }
    }
  } catch {}
  if (typeof result?.outputText === "string" && result.outputText.trim())
    return result.outputText.trim();
  try {
    return JSON.stringify(result.response ?? result, null, 2).slice(
      0,
      MAX_OUTPUT_CHARS
    );
  } catch {
    return String(result).slice(0, MAX_OUTPUT_CHARS);
  }
}

function parsePosts(rawText: string): { id: number; content: string }[] {
  if (!rawText) return [];
  let splitPosts = rawText
    .split(/\n-{3,}\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
  if (splitPosts.length === 0) {
    splitPosts = rawText
      .split(/\n{2,}/g)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return splitPosts.map((content, idx) => ({ id: idx + 1, content }));
}

const PROFANITY = [
  "damn",
  "shit",
  "bastard",
  "crap",
  "asshole",
  "dumbass",
  "fuck",
  "bloody",
];
const riskyClaimRegexes = [
  /(\b(fastest|guaranteed|#1|no\s*risk|beat\s*the\s*market)\b)/i,
  /(\d{2,}%)/, // bold percentages
  /(\b(triple|10x|100x)\b)/i,
];

function runGuardrails(text: string) {
  const lower = text.toLowerCase();
  const profanity = PROFANITY.some((w) => lower.includes(w));
  const risky: string[] = [];
  riskyClaimRegexes.forEach((re) => {
    const m = text.match(re);
    if (m) risky.push(m[0]);
  });
  return { profanity, riskyClaims: risky };
}

async function withTimeout<T>(promise: Promise<T>, ms = GENERATE_TIMEOUT_MS) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Operation timed out after ${ms} ms`)),
      ms
    );
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

/**
 * Main handler
 */
export async function POST(req: Request) {
  try {
    const raw = await safeJson<GeneratePostRequest>(req);
    if (!raw)
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    let payload: GeneratePostRequest;
    try {
      payload = validatePayload(raw);
    } catch (e: any) {
      return NextResponse.json(
        { error: e?.message || "Invalid request" },
        { status: 400 }
      );
    }

    // --- Step 0: Planning (agent) ---
    let plansJson = "";
    let planTokensIn = 0,
      planTokensOut = 0,
      planLatency = 0;
    if (payload.doPlan) {
      const plannerPrompt = buildPlannerPrompt(payload);
      planTokensIn = await countTokens(PLANNER_MODEL, "user", plannerPrompt);
      const model = genAI.getGenerativeModel({ model: PLANNER_MODEL });
      const t0 = performance.now();
      const planRes = await withTimeout(
        model.generateContent(plannerPrompt) as any
      );
      planLatency = Math.round(performance.now() - t0);
      plansJson = extractTextFromResult(planRes);
      planTokensOut = await countTokens(PLANNER_MODEL, "model", plansJson);

      // Try to ensure valid JSON root
      if (!plansJson.trim().startsWith("{")) {
        plansJson = `{"plans": ${
          plansJson.trim().startsWith("[") ? plansJson.trim() : "[]"
        }}`;
      }
    }

    // --- Step 1: Optional search grounding ---
    let sources: { title: string; url: string; snippet?: string }[] = [];
    if (payload.includeLinks && payload.doSearch) {
      try {
        sources = await webSearchSerper(payload.topic);
      } catch {}
    }
    const searchNotes = sources.length
      ? sources
          .map(
            (s, i) =>
              `[${i + 1}] ${s.title} — ${s.url}${
                s.snippet ? `\n${s.snippet}` : ""
              }`
          )
          .join("\n\n")
      : "";

    // --- Step 2: Drafting (agent) ---
    const draftPrompt = buildDraftPrompt(
      payload,
      plansJson || '{"plans":[]}',
      searchNotes
    );
    const draftModel = genAI.getGenerativeModel({ model: DRAFTER_MODEL });
    const draftTokensIn = await countTokens(DRAFTER_MODEL, "user", draftPrompt);
    const t1 = performance.now();
    const draftRes = await withTimeout(
      draftModel.generateContent(draftPrompt) as any
    );
    const draftLatency = Math.round(performance.now() - t1);
    const rawDraft = extractTextFromResult(draftRes);
    const draftTokensOut = await countTokens(DRAFTER_MODEL, "model", rawDraft);

    // Parse posts
    let posts = parsePosts(rawDraft);

    // --- Step 3: Enrichment (hashtags + CTA as separate tool-use) ---
    let enrichLatency = 0,
      enrichTokensIn = 0,
      enrichTokensOut = 0;
    let enrichMap = new Map<number, { hashtags?: string[]; cta?: string }>();
    if (payload.addHashtags || payload.addCTA) {
      const toolPrompt = buildHashCtaPrompt(payload, rawDraft);
      const toolModel = genAI.getGenerativeModel({ model: TOOL_MODEL });
      enrichTokensIn = await countTokens(TOOL_MODEL, "user", toolPrompt);
      const t2 = performance.now();
      const toolRes = await withTimeout(
        toolModel.generateContent(toolPrompt) as any
      );
      enrichLatency = Math.round(performance.now() - t2);
      const toolText = extractTextFromResult(toolRes);
      enrichTokensOut = await countTokens(TOOL_MODEL, "model", toolText);
      try {
        const parsed = JSON.parse(toolText);
        const arr = Array.isArray(parsed?.enrich) ? parsed.enrich : [];
        for (const item of arr) {
          if (typeof item?.index === "number") {
            enrichMap.set(Number(item.index), {
              hashtags: item.hashtags ?? [],
              cta: item.cta ?? undefined,
            });
          }
        }
      } catch {
        // ignore JSON errors; enrichment is optional
      }
    }

    // --- Step 4: Guardrails ---
    const final: PostOut[] = posts.map(({ id, content }) => {
      const flags = payload.doGuardrails
        ? runGuardrails(content)
        : { profanity: false, riskyClaims: [] as string[] };

      // Gather citations for each post by scanning trailing "References:" list
      let citations: { label: string; url: string }[] | undefined;
      if (payload.includeLinks) {
        const refsMatch = content.match(/References:\n([\s\S]*)$/i);
        if (refsMatch) {
          const lines = refsMatch[1]
            .split(/\n+/)
            .map((l) => l.trim())
            .filter(Boolean);
          citations = lines
            .map((l) => {
              const m = l.match(/\[(\d+)\]\s*(https?:[^\s]+)/i);
              if (m) return { label: `[${m[1]}]`, url: m[2] };
              const n = l.match(/\[(\d+)\]\s*([^\s]+\.[^\s]+)/i);
              if (n) return { label: `[${n[1]}]`, url: n[2] };
              return null;
            })
            .filter(Boolean) as any;
        }
      }

      // Apply enrichment if present
      const enrich = enrichMap.get(id);
      return {
        id,
        content,
        citations,
        hashtags: enrich?.hashtags,
        cta: enrich?.cta,
        flags,
      };
    });

    // Meta accounting
    const inputTokens = planTokensIn + draftTokensIn + enrichTokensIn;
    const outputTokens = planTokensOut + draftTokensOut + enrichTokensOut;
    const totalTokens = inputTokens + outputTokens;
    const costUSD = computeCostUSD(MODEL_NAME, inputTokens, outputTokens);

    const meta = {
      model: {
        planner: PLANNER_MODEL,
        drafter: DRAFTER_MODEL,
        tool: TOOL_MODEL,
      },
      tokens: {
        input: inputTokens,
        output: outputTokens,
        total: totalTokens,
      },
      latencyMs: {
        plan: planLatency,
        draft: draftLatency,
        enrich: enrichLatency,
        total: planLatency + draftLatency + enrichLatency,
      },
      costUSD,
      sources, // surfaced so UI can render link pills under each card
    };

    // 👇 Debug logs
    console.log("---- API Debug Output ----");
    console.log("Final Posts:", JSON.stringify(final, null, 2));
    console.log("Meta:", JSON.stringify(meta, null, 2));
    console.log("--------------------------");

    return NextResponse.json({ posts: final, meta });

  } catch (err: any) {
    console.error("Unexpected server error:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
