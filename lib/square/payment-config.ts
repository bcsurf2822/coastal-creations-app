/**
 * Square Payment Configuration
 * Centralized configuration for all Square payment methods
 */

export interface PaymentConfig {
  applicationId: string;
  locationId: string;
  environment: "sandbox" | "production";
}

export interface WalletPaymentOptions {
  applePay: {
    enabled: boolean;
  };
  googlePay: {
    enabled: boolean;
    buttonColor: "default" | "black" | "white";
    buttonType: "buy" | "plain" | "donate" | "book" | "checkout" | "order" | "pay" | "subscribe";
  };
  cashAppPay: {
    enabled: boolean;
    redirectUrl: string;
  };
}

export interface PaymentRequest {
  countryCode: string;
  currencyCode: string;
  total: {
    amount: string;
    label: string;
  };
}

/**
 * Get Square payment configuration from environment
 */
export function getPaymentConfig(): PaymentConfig {
  return {
    applicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || process.env.APPLICATION_ID || "",
    locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "main",
    environment: (process.env.SQUARE_ENVIRONMENT as "sandbox" | "production") || "sandbox",
  };
}

/**
 * Get wallet payment options
 * All wallet payments are enabled by default - they auto-hide when unavailable
 */
export function getWalletOptions(baseUrl: string): WalletPaymentOptions {
  return {
    applePay: {
      enabled: true,
    },
    googlePay: {
      enabled: true,
      buttonColor: "black",
      buttonType: "plain",
    },
    cashAppPay: {
      enabled: true,
      redirectUrl: `${baseUrl}/payment/cashapp-callback`,
    },
  };
}

/**
 * Create a payment request object for Square
 */
export function createPaymentRequest(
  amount: string,
  label: string = "Total"
): PaymentRequest {
  return {
    countryCode: "US",
    currencyCode: "USD",
    total: {
      amount,
      label,
    },
  };
}
