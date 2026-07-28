/**
 * Launch gates.
 *
 * The online store ships dark: every store surface (/shop, /cart, /checkout and
 * the customer checkout APIs) renders "coming soon" until the flag is lifted by
 * setting NEXT_PUBLIC_SHOP_ENABLED=true in the deployment environment.
 * NEXT_PUBLIC_ vars are inlined at build time, so lifting the flag requires a
 * redeploy. Local development: add NEXT_PUBLIC_SHOP_ENABLED=true to .env.local.
 */
export function isShopEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SHOP_ENABLED === "true";
}
