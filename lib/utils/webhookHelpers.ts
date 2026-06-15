import { createHmac } from "crypto";

/**
 * Verifies the Square webhook HMAC-SHA256 signature.
 * Square computes: base64(HMAC-SHA256(signingKey, webhookUrl + rawBody))
 * and sends it as the X-Square-Hmacsha256-Signature header.
 *
 * Returns true if verification passes OR if SQUARE_WEBHOOK_SIGNATURE_KEY is unset
 * (allows local development without the key).
 */
export function verifySquareWebhookSignature(
  rawBody: string,
  signature: string | null,
  webhookUrl: string,
  signingKey: string | undefined,
): boolean {
  if (!signingKey) return true;
  if (!signature) return false;
  const expected = createHmac("sha256", signingKey)
    .update(webhookUrl + rawBody)
    .digest("base64");
  return expected === signature;
}

