"use client";

import { submitPayment } from "@/app/actions/actions";
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";

export default function Payment() {
  const appId = process.env.NEXT_PUBLIC_SANDBOX_APPLICATION_ID || "";
  const locationId = "main";

  return (
    <PaymentForm
      applicationId={appId}
      locationId={locationId}
      cardTokenizeResponseReceived={async (token) => {
        if (token.token) {
          const result = await submitPayment(token.token);
          console.log(result);
        } else {
          console.error("Payment token is undefined");
        }
      }}
    >
      <CreditCard />
    </PaymentForm>
  );
}
