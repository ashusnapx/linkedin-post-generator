/**
 * Compute cost estimate from token usage.
 * Default rate: 0.03 USD / 1k tokens unless overridden by env.
 */
export function computeCostFromTokens(tokens?: number): number | undefined {
  if (tokens === undefined) return undefined;

  const defaultPer1k = 0.03;
  const envRate = Number(process.env.NEXT_PUBLIC_COST_PER_1K_TOKENS);
  const per1k = !isNaN(envRate) && envRate > 0 ? envRate : defaultPer1k;

  const cost = (tokens / 1000) * per1k;
  return Math.round(cost * 1_000_000) / 1_000_000; // round to 6 decimals
}
