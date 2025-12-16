"use client";

import { useHours } from "@/hooks/queries";
import type { ReactElement } from "react";

export default function TestReactQueryPage(): ReactElement {
  const { data: hours, isLoading, isError, error, isFetching, isStale } = useHours();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">React Query Test Page</h1>

      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold mb-2">Query Status:</h2>
        <ul className="space-y-1 text-sm">
          <li>isLoading: <span className={isLoading ? "text-yellow-600" : "text-gray-600"}>{String(isLoading)}</span></li>
          <li>isFetching: <span className={isFetching ? "text-blue-600" : "text-gray-600"}>{String(isFetching)}</span></li>
          <li>isStale: <span className={isStale ? "text-orange-600" : "text-green-600"}>{String(isStale)}</span></li>
          <li>isError: <span className={isError ? "text-red-600" : "text-gray-600"}>{String(isError)}</span></li>
        </ul>
      </div>

      {isLoading && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">Loading hours of operation...</p>
        </div>
      )}

      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">Error: {error?.message}</p>
        </div>
      )}

      {hours && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">React Query is working correctly!</p>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h2 className="font-semibold mb-3">Hours of Operation Data:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const).map((day) => (
                <div key={day} className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="capitalize font-medium">{day}:</span>
                  <span>
                    {hours[day]?.isClosed
                      ? "Closed"
                      : hours[day]?.hours
                        ? `${hours[day].hours?.open} - ${hours[day].hours?.close}`
                        : "Not set"
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="font-semibold mb-2">Raw JSON Response:</h2>
            <pre className="text-xs overflow-auto bg-gray-800 text-green-400 p-3 rounded">
              {JSON.stringify(hours, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="font-semibold mb-2">Testing Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Open React Query DevTools (flower icon in bottom-right corner)</li>
          <li>You should see a &quot;hours&quot; query in the list</li>
          <li>Navigate away from this page and return - data should load instantly (cached)</li>
          <li>Check Network tab - should only see one /api/hours request initially</li>
          <li>Wait 5 minutes, then refresh - you&apos;ll see a new request (staleTime expired)</li>
        </ol>
      </div>
    </div>
  );
}
