import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { DEFAULT_SEARCH_LIMIT, MAX_PARAGRAPHS, MAX_SUMMARY_LENGTH, MIN_PARAGRAPH_LENGTH, TOP_SUMMARIZE_COUNT, USER_AGENT } from "../config/constants";

/**
 * Extract real URL from DuckDuckGo redirect link
 */
function cleanDuckLink(rawUrl: string): string | null {
  try {
    if (rawUrl.startsWith("//")) rawUrl = "https:" + rawUrl;
    const urlObj = new URL(rawUrl);
    const uddg = urlObj.searchParams.get("uddg");
    return uddg ? decodeURIComponent(uddg) : rawUrl;
  } catch {
    return null;
  }
}

/**
 * Search DuckDuckGo HTML results and return top N clean links
 */
async function searchLinks(
  query: string,
  limit = DEFAULT_SEARCH_LIMIT
): Promise<string[]> {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  const html = await res.text();

  const $ = cheerio.load(html);
  const links: string[] = [];

  $("a.result__a").each((_, el) => {
    const raw = $(el).attr("href");
    if (raw) {
      const clean = cleanDuckLink(raw);
      if (clean) links.push(clean);
    }
  });

  return links.slice(0, limit);
}

/**
 * Fetch page content and extract text summary from <p> tags
 */
async function fetchPageContent(
  url: string
): Promise<{ title: string; paragraphs: string[] }> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $("title").text() || "";
    const paragraphs = $("p")
      .map((_, el) => $(el).text())
      .get()
      .filter((t) => t.length > MIN_PARAGRAPH_LENGTH);

    return { title, paragraphs };
  } catch (err) {
    console.error(`⚠️ Failed to fetch page content for ${url}:`, err);
    return { title: "", paragraphs: [] };
  }
}

/**
 * Score page based on relevance
 */
function scorePageContent(
  title: string,
  paragraphs: string[],
  topic: string
): number {
  let score = 0;

  // 1. Title relevance
  if (title.toLowerCase().includes(topic.toLowerCase())) score += 3;

  // 2. Keyword frequency in paragraphs
  const keywordCount =
    paragraphs.join(" ").toLowerCase().split(topic.toLowerCase()).length - 1;
  score += Math.min(keywordCount, 5);

  // 3. Content length
  const contentLength = paragraphs.join(" ").length;
  if (contentLength > 500) score += 2;
  if (contentLength > 1000) score += 1; // bonus

  return score;
}

/**
 * Convert paragraphs to summary
 */
function summarizeParagraphs(paragraphs: string[]): string {
  const content = paragraphs.slice(0, MAX_PARAGRAPHS).join(" ");
  return content.length > MAX_SUMMARY_LENGTH
    ? content.slice(0, MAX_SUMMARY_LENGTH) + "..."
    : content;
}

/**
 * Main: Fetch facts from web via DDG search + top scored summaries
 */
export async function fetchFacts(topic: string): Promise<string> {
  try {
    console.log(`🔍 Searching web for: "${topic}"`);
    const links = await searchLinks(topic, DEFAULT_SEARCH_LIMIT);
    if (!links.length) {
      console.warn("❌ No links found.");
      return "";
    }

    console.log("🌐 Candidate links:", links);

    // Score all links
    const scoredPages: { url: string; score: number; paragraphs: string[] }[] =
      [];
    for (const url of links) {
      const { title, paragraphs } = await fetchPageContent(url);
      if (paragraphs.length === 0) continue;
      const score = scorePageContent(title, paragraphs, topic);
      scoredPages.push({ url, score, paragraphs });
    }

    if (!scoredPages.length) {
      console.warn("❌ No valid pages found for summarization.");
      return "";
    }

    // Select top N scored pages
    scoredPages.sort((a, b) => b.score - a.score);
    const topPages = scoredPages.slice(0, TOP_SUMMARIZE_COUNT);

    // Summarize
    const summaries = topPages.map((p) => summarizeParagraphs(p.paragraphs));
    const combined = summaries.join(" ");

    console.log("✅ Combined Summary:", combined.slice(0, 300) + "...");
    return combined;
  } catch (err) {
    console.error("Fact fetch failed:", err);
    return "";
  }
}
