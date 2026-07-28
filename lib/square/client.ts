/**
 * Single configured Square v44 native client.
 * Replaces the per-file legacy `new Client({ accessToken, environment })` construction.
 * Server-only — reads SQUARE_ACCESS_TOKEN + SQUARE_ENVIRONMENT once and memoizes.
 */
import { SquareClient, SquareEnvironment } from "square";

let cached: SquareClient | null = null;

export function getSquareClient(): SquareClient {
  if (!cached) {
    cached = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment:
        process.env.SQUARE_ENVIRONMENT === "sandbox"
          ? SquareEnvironment.Sandbox
          : SquareEnvironment.Production,
    });
  }
  return cached;
}
