"use client";

import {
  PaymentForm,
  CreditCard,
  ApplePay,
} from "react-square-web-payments-sdk";

const SquarePaymentForm = () => {
  const applicationId = process.env.NEXT_PUBLIC_SANDBOX_APPLICATION_ID || "";
  const locationId = process.env.NEXT_PUBLIC_SANDBOX_LOCATION_ID || "";
  console.log("Application ID:", applicationId);
  console.log("Location ID:", locationId);
  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded-lg">
      <PaymentForm
        applicationId={applicationId}
        locationId={locationId}
        cardTokenizeResponseReceived={async (token, buyer) => {
          const response = await fetch("/api/customer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, buyer }),
          });

          const result = await response.json();
          if (result.success) {
            alert("Payment successful!");
          } else {
            alert("Payment failed: " + result.message);
          }
        }}
        createPaymentRequest={() => ({
          countryCode: "US",
          currencyCode: "USD",
          total: {
            amount: "1.00",
            label: "Total",
          },
        })}
      >
        <CreditCard>
          <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded">
            Pay with Card
          </button>
        </CreditCard>

        <ApplePay>
          <button className="w-full mt-4 py-2 bg-black text-white rounded">
            Pay with Apple Pay
          </button>
        </ApplePay>
      </PaymentForm>
    </div>
  );
};

export default SquarePaymentForm;
