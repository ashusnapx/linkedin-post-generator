// src/lib/logger.ts
export const logger = {
  info: (...args: unknown[]) => console.info("[info]", ...args),
  warn: (...args: unknown[]) => console.warn("[warn]", ...args),
  error: (...args: unknown[]) => console.error("[error]", ...args),
  debug: (...args: unknown[]) => console.debug("[debug]", ...args),
};
