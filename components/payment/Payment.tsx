"use client";

import { submitPayment } from "@/app/actions/actions";
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";
import { useState, ChangeEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Payment() {
  const appId = process.env.NEXT_PUBLIC_SANDBOX_APPLICATION_ID || "";
  const locationId = "main";
  const redirectUrl =
    process.env.NEXT_PUBLIC_SANDBOX_REDIRECT_URL || "/payment-success";
  const router = useRouter();

  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") || "";
  const eventTitle = searchParams.get("eventTitle") || "";

  const [billingDetails, setBillingDetails] = useState({
    addressLine1: "",
    addressLine2: "",
    familyName: "",
    givenName: "",
    countryCode: "GB",
    city: "",
    state: "",
    postalCode: "",
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {eventTitle && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center mb-2">Registration</h1>
          <p className="text-lg text-center">
            You&apos;re registering for:{" "}
            <span className="font-semibold">{eventTitle}</span>
          </p>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Billing Information</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="givenName" className="block text-sm font-medium mb-1">
            First Name
          </label>
          <input
            type="text"
            id="givenName"
            name="givenName"
            value={billingDetails.givenName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label
            htmlFor="familyName"
            className="block text-sm font-medium mb-1"
          >
            Last Name
          </label>
          <input
            type="text"
            id="familyName"
            name="familyName"
            value={billingDetails.familyName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label
            htmlFor="addressLine1"
            className="block text-sm font-medium mb-1"
          >
            Address Line 1
          </label>
          <input
            type="text"
            id="addressLine1"
            name="addressLine1"
            value={billingDetails.addressLine1}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label
            htmlFor="addressLine2"
            className="block text-sm font-medium mb-1"
          >
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            id="addressLine2"
            name="addressLine2"
            value={billingDetails.addressLine2}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={billingDetails.city}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">
            State/Province
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={billingDetails.state}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label
            htmlFor="postalCode"
            className="block text-sm font-medium mb-1"
          >
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={billingDetails.postalCode}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label
            htmlFor="countryCode"
            className="block text-sm font-medium mb-1"
          >
            Country
          </label>
          <select
            id="countryCode"
            name="countryCode"
            value={billingDetails.countryCode}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="GB">United Kingdom</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            {/* Add more countries as needed */}
          </select>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Payment Details</h2>
      <PaymentForm
        applicationId={appId}
        locationId={locationId}
        cardTokenizeResponseReceived={async (token) => {
          if (token.token) {
            // Prepare billing contact from form inputs
            const contact = {
              addressLines: [
                billingDetails.addressLine1,
                billingDetails.addressLine2,
              ].filter(Boolean),
              familyName: billingDetails.familyName,
              givenName: billingDetails.givenName,
              countryCode: billingDetails.countryCode,
              city: billingDetails.city,
              state: billingDetails.state,
              postalCode: billingDetails.postalCode,
            };

            console.log("Billing contact:", contact);
            try {
              const result = await submitPayment(token.token, {
                ...billingDetails,
                eventId,
                eventTitle,
              });

              console.log(result);

              if (result?.result?.payment?.status === "COMPLETED") {
                const paymentId = result.result.payment.id;
                const receiptUrl = result.result.payment.receiptUrl || "";

                // Use environment variable for redirect URL
                router.push(
                  `${redirectUrl}?paymentId=${paymentId}&receiptUrl=${encodeURIComponent(
                    receiptUrl
                  )}`
                );
              } else {
                // Handle payment not completed
                console.error("Payment not completed");
              }
            } catch (error) {
              console.error("Payment error:", error);
            }
          } else {
            console.error("Payment token is undefined");
          }
        }}
      >
        <CreditCard />
      </PaymentForm>
    </div>
  );
}
