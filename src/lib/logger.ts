// src/lib/logger.ts
/**
 * Structured logging utility with metrics support.
 *
 * In production, this can be swapped for a more sophisticated
 * logging service (DataDog, LogRocket, etc.) by changing the
 * implementations here.
 */

interface MetricData {
  tokens?: number;
  costUSD?: number;
  latencyMs?: number;
  postCount?: number;
  [key: string]: unknown;
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.info("[info]", message, data ? JSON.stringify(data) : "");
  },

  warn: (message: string, data?: unknown) => {
    console.warn("[warn]", message, data ?? "");
  },

  error: (message: string, error?: unknown) => {
    console.error("[error]", message, error ?? "");
  },

  debug: (message: string, data?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === "development") {
      console.debug("[debug]", message, data ? JSON.stringify(data) : "");
    }
  },

  /**
   * Log structured metrics for cost/latency tracking.
   * In production, these could be sent to an analytics service.
   */
  metric: (event: string, data: MetricData) => {
    console.info(
      "[metric]",
      JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        ...data,
      })
    );
  },
};
