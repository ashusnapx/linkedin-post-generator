import fetch from "node-fetch";
import * as cheerio from "cheerio"; // npm install cheerio

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
async function searchLinks(query: string, limit = 5): Promise<string[]> {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
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
async function fetchPageSummary(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const html = await res.text();

    const $ = cheerio.load(html);
    const paragraphs = $("p")
      .map((_, el) => $(el).text())
      .get()
      .filter((t) => t.length > 50);

    const content = paragraphs.slice(0, 5).join(" ");
    return content.length > 500 ? content.slice(0, 500) + "..." : content;
  } catch (err) {
    console.error(`⚠️ Failed to fetch page summary for ${url}:`, err);
    return "";
  }
}

/**
 * Main: Fetch facts from web via DDG search + summaries
 */
export async function fetchFacts(topic: string): Promise<string> {
  try {
    console.log(`🔍 Searching web for: "${topic}"`);

    const links = await searchLinks(topic, 5);
    if (!links.length) {
      console.warn("❌ No links found.");
      return "";
    }

    console.log("🌐 Cleaned Top links:", links);

    const summaries: string[] = [];
    for (const url of links.slice(0, 2)) {
      const summary = await fetchPageSummary(url);
      if (summary) summaries.push(summary);
    }

    if (!summaries.length) {
      console.warn("❌ No summaries extracted.");
      return "";
    }

    const combined = summaries.join(" ");
    console.log("✅ Combined Summary:", combined.slice(0, 300) + "...");
    return combined;
  } catch (err) {
    console.error("Fact fetch failed:", err);
    return "";
  }
}
