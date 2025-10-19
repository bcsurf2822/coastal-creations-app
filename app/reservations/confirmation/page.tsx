import { ReactElement } from "react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ bookingId?: string; total?: string; name?: string }>;
}

export default async function ConfirmationPage({
  searchParams,
}: Props): Promise<ReactElement> {
  const params = await searchParams;
  const { bookingId, total, name } = params;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success Checkmark */}
        <div className="flex justify-center mb-8">
          <div className="rounded-full bg-green-100 p-6">
            <svg
              className="w-16 h-16 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Reservation Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your payment has been processed successfully.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Booking Summary
          </h2>

          {bookingId && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
              <p className="text-lg font-mono text-gray-900">{bookingId}</p>
            </div>
          )}

          {name && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Reservation</p>
              <p className="text-lg text-gray-900">{name}</p>
            </div>
          )}

          {total && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ${parseFloat(total).toFixed(2)}
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Confirmation Email Sent
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  A confirmation email with your reservation details has been
                  sent to your email address.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            What&apos;s Next?
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Check your email for detailed reservation information
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Add the dates to your calendar so you don&apos;t miss your
                reservation
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Contact us if you have any questions about your reservation
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/calendar"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors duration-200"
          >
            View Calendar
          </Link>
          <Link
            href="/reservations"
            className="flex-1 bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-lg border-2 border-blue-600 text-center transition-colors duration-200"
          >
            Book Another Reservation
          </Link>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Questions about your reservation?</p>
          <p className="mt-1">
            Contact us at{" "}
            <a
              href="mailto:info@coastalcreationsstudio.com"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              info@coastalcreationsstudio.com
            </a>
          </p>
          <p className="mt-1">
            Coastal Creations Studio
            <br />
            411 E 8th Street, Ocean City, NJ 08226
          </p>
        </div>
      </div>
    </div>
  );
}
