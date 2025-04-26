"use client";


import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";

export default function Payment() {
  const appId = process.env.NEXT_PUBLIC_SANDBOX_APPLICATION_ID || "";
  const locationId = "main";

  return (
    <PaymentForm
      applicationId={appId}
      locationId={locationId}
      cardTokenizeResponseReceived={async (token) => {
        console.log(token);
      }}
    >
      <CreditCard />
    </PaymentForm>
  );
}
