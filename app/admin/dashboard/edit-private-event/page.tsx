"use client";

import { ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import EditPrivateEventForm from "@/components/dashboard/private-event-form/EditPrivateEventForm";

const EditPrivateEventPage = (): ReactElement => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const privateEventId = searchParams.get("id");

  const handleSuccess = () => {
    router.push("/admin/dashboard");
  };

  const handleCancel = () => {
    router.push("/admin/dashboard");
  };

  if (!privateEventId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Missing Private Event ID
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>No private event ID provided. Please select a private event to edit.</p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium text-red-800 underline hover:text-red-900"
                  >
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div>
                  <Link
                    href="/admin/dashboard"
                    className="text-gray-400 hover:text-gray-500"
                  >
                    Dashboard
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-gray-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">
                    Edit Private Event
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <EditPrivateEventForm
          privateEventId={privateEventId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EditPrivateEventPage;