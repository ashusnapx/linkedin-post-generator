// app/api/health/route.ts
import { NextResponse } from "next/server";
import { logger } from "@/src/lib/logger";

/**
 * Health check endpoint with dependency status.
 *
 * Usage:
 *   GET /api/health
 *
 * Returns:
 *   - status: "ok" | "degraded" | "error"
 *   - dependencies: status of external services
 *   - timestamp: current server time
 */
export async function GET() {
  const checks: Record<string, string> = {};
  let overallStatus: "ok" | "degraded" | "error" = "ok";

  // Check Gemini API key is configured
  const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (geminiKey && geminiKey.length > 10) {
    checks.gemini = "configured";
  } else {
    checks.gemini = "missing";
    overallStatus = "degraded";
  }

  // Check Vercel KV (rate limiting) - optional
  const kvConfigured = !!(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  );
  checks.rateLimit = kvConfigured ? "configured" : "disabled";

  // Log health check
  logger.info("Health check", { status: overallStatus, checks });

  return NextResponse.json(
    {
      status: overallStatus,
      dependencies: checks,
      version: process.env.npm_package_version ?? "dev",
      timestamp: new Date().toISOString(),
    },
    { status: (overallStatus as string) === "error" ? 503 : 200 }
  );
}
