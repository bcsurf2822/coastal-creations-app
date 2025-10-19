"use client";

import { ReactElement, ChangeEvent } from "react";
import { BillingInfo } from "./types";

interface BillingFieldsProps {
  billingInfo: BillingInfo;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\+\(\)]+$/;

export default function BillingFields({
  billingInfo,
  onInputChange,
}: BillingFieldsProps): ReactElement {
  const validateEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    return PHONE_REGEX.test(phone);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        Billing Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={billingInfo.firstName}
            onChange={onInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={billingInfo.lastName}
            onChange={onInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <div>
          <label
            htmlFor="emailAddress"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="emailAddress"
            name="emailAddress"
            value={billingInfo.emailAddress}
            onChange={onInputChange}
            className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:border-blue-500 transition ${
              billingInfo.emailAddress &&
              !validateEmail(billingInfo.emailAddress)
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            required
          />
          {billingInfo.emailAddress &&
            !validateEmail(billingInfo.emailAddress) && (
              <p className="text-sm text-red-500 mt-1">
                Please enter a valid email address
              </p>
            )}
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={billingInfo.phoneNumber}
            onChange={onInputChange}
            className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:border-blue-500 transition ${
              billingInfo.phoneNumber &&
              !validatePhone(billingInfo.phoneNumber)
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            required
          />
          {billingInfo.phoneNumber &&
            !validatePhone(billingInfo.phoneNumber) && (
              <p className="text-sm text-red-500 mt-1">
                Please enter a valid phone number
              </p>
            )}
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="addressLine1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="addressLine1"
            name="addressLine1"
            value={billingInfo.addressLine1}
            onChange={onInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="addressLine2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            id="addressLine2"
            name="addressLine2"
            value={billingInfo.addressLine2 || ""}
            onChange={onInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={billingInfo.city}
            onChange={onInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <div>
          <label
            htmlFor="stateProvince"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            State/Province <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="stateProvince"
            name="stateProvince"
            value={billingInfo.stateProvince}
            onChange={onInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <div>
          <label
            htmlFor="postalCode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Postal Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={billingInfo.postalCode}
            onChange={onInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Country <span className="text-red-500">*</span>
          </label>
          <select
            id="country"
            name="country"
            value={billingInfo.country}
            onChange={onInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>
        </div>
      </div>
    </div>
  );
}
