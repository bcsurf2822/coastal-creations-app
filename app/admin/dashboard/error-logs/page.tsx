import ErrorLogs from "@/components/dashboard/errors-logs/ErrorLogs";

export default function ErrorLogsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Error Logs
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor and manage payment error logs from your events.
          </p>
        </div>

        <ErrorLogs />
      </div>
    </div>
  );
}
