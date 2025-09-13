"use client";

import { useState, useEffect, useMemo } from "react";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiSearchLine,
  RiCalendarLine,
} from "react-icons/ri";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import ErrorReportPDF from "./ErrorReportPDF";

interface PaymentError {
  code: string;
  detail: string;
  category: string;
}

interface ErrorLog {
  _id: string;
  eventId: string;
  eventTitle: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  paymentAmount: number;
  sourceId: string;
  paymentErrors: PaymentError[];
  rawErrorResponse: {
    stack: string;
    message: string;
    request: {
      method?: string;
      url?: string;
      headers?: Record<string, string>;
      body?: Record<string, unknown>;
    };
    statusCode: number;
    headers?: Record<string, string>;
    body?: string;
    result?: Record<string, unknown>;
  };
  errors: PaymentError[];
  attemptedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ErrorLogsResponse {
  success: boolean;
  paymentErrors: ErrorLog[];
  count: number;
}

export default function ErrorLogs() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [deletingLog, setDeletingLog] = useState<string | null>(null);

  // New filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchErrorLogs();
  }, []);

  // Filter logs based on search term and date range
  const filteredLogs = useMemo(() => {
    let filtered = errorLogs;

    // Filter by customer name search
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (log) =>
          log.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(
        (log) => new Date(log.attemptedAt) >= new Date(startDate)
      );
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(
        (log) => new Date(log.attemptedAt) <= endDateTime
      );
    }

    return filtered;
  }, [errorLogs, searchTerm, startDate, endDate]);

  const fetchErrorLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payment-errors?all=true");
      const data: ErrorLogsResponse = await response.json();

      if (data.success) {
        setErrorLogs(data.paymentErrors);
      } else {
        setError("Failed to fetch error logs");
      }
    } catch (err) {
      setError("An error occurred while fetching logs");
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = async () => {
    try {
      setIsGeneratingPDF(true);

      const reportData = {
        logs: filteredLogs,
        filters: {
          searchTerm,
          startDate,
          endDate,
        },
        generatedAt: new Date().toISOString(),
        totalErrors: filteredLogs.length,
      };

      const blob = await pdf(<ErrorReportPDF data={reportData} />).toBlob();

      const fileName = `error-report-${new Date().toISOString().split("T")[0]}.pdf`;
      saveAs(blob, fileName);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF report");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  const deleteErrorLog = async (id: string) => {
    try {
      setDeletingLog(id);
      const response = await fetch(`/api/payment-errors?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setErrorLogs((prev) => prev.filter((log) => log._id !== id));
        if (expandedLog === id) {
          setExpandedLog(null);
        }
      } else {
        alert("Failed to delete error log");
      }
    } catch (err) {
      alert("An error occurred while deleting the log");
      console.error("Error deleting log:", err);
    } finally {
      setDeletingLog(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedLog(expandedLog === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchErrorLogs}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* <h2 className="text-2xl font-bold text-gray-900">
            Payment Error Logs
          </h2> */}
          <p className="text-sm text-gray-500 mt-1">
            {filteredLogs.length} of {errorLogs.length} error
            {errorLogs.length !== 1 ? "s" : ""} shown
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={generatePDFReport}
            disabled={isGeneratingPDF || filteredLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <RiDownloadLine className="h-4 w-4" />
            )}
            {isGeneratingPDF ? "Generating..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by Customer Name */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Customer
            </label>
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Start Date
            </label>
            <div className="relative">
              <RiCalendarLine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              End Date
            </label>
            <div className="relative">
              <RiCalendarLine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        {(searchTerm || startDate || endDate) && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {filteredLogs.length} result{filteredLogs.length !== 1 ? "s" : ""}{" "}
              found
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {filteredLogs.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {errorLogs.length === 0 ? "No Error Logs" : "No Results Found"}
          </h3>

        </div>
      ) : (
        <>
          {/* Header Row */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700">
              <div className="col-span-1"></div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Person</div>
              <div className="col-span-2">Event</div>
              <div className="col-span-2">Error Code</div>
              <div className="col-span-1"></div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(log._id)}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Expand/Collapse Icon */}
                    <div className="col-span-1">
                      {expandedLog === log._id ? (
                        <RiArrowUpSLine className="h-5 w-5 text-gray-400" />
                      ) : (
                        <RiArrowDownSLine className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(log.attemptedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-600">
                        {new Date(log.attemptedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {/* Person */}
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {log.customerName}
                      </div>
                    </div>

                    {/* Event */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-600 truncate">
                        {log.eventTitle}
                      </div>
                    </div>

                    {/* Error Code # and Detail */}
                    <div className="col-span-2">
                      <div className="flex flex-col gap-1">
                        {log.paymentErrors.slice(0, 2).map((error, index) => (
                          <div key={index} className="text-xs">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {error.code}
                            </span>
                          </div>
                        ))}
                        {log.paymentErrors.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{log.paymentErrors.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteErrorLog(log._id);
                        }}
                        disabled={deletingLog === log._id}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete error log"
                      >
                        {deletingLog === log._id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                        ) : (
                          <RiDeleteBinLine className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedLog === log._id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                            Basic Information
                          </h4>
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">
                                  ID:
                                </span>{" "}
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  {log._id}
                                </code>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Event ID:
                                </span>{" "}
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  {log.eventId}
                                </code>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Event Title:
                                </span>{" "}
                                {log.eventTitle}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Payment Amount:
                                </span>{" "}
                                <span className="text-green-600 font-semibold">
                                  {formatCurrency(log.paymentAmount)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Source ID:
                                </span>{" "}
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                                  {log.sourceId}
                                </code>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                            Customer Information
                          </h4>
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">
                                  Name:
                                </span>{" "}
                                {log.customerName}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Email:
                                </span>{" "}
                                <a
                                  href={`mailto:${log.customerEmail}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {log.customerEmail}
                                </a>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Phone:
                                </span>{" "}
                                <a
                                  href={`tel:${log.customerPhone}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {log.customerPhone}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Errors */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                            Payment Errors
                          </h4>
                          <div className="space-y-3">
                            {log.paymentErrors.map((error, index) => (
                              <div
                                key={index}
                                className="bg-white border border-red-200 rounded-lg p-4"
                              >
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-700">
                                      Code:
                                    </span>{" "}
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      {error.code}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">
                                      Category:
                                    </span>{" "}
                                    <span className="text-red-600">
                                      {error.category}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">
                                      Detail:
                                    </span>{" "}
                                    {error.detail}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                            Request Information
                          </h4>
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">
                                  Status Code:
                                </span>{" "}
                                <span className="text-red-600 font-semibold">
                                  {log.rawErrorResponse.statusCode}
                                </span>
                              </div>
                              {log.rawErrorResponse.request?.method && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Method:
                                  </span>{" "}
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                    {log.rawErrorResponse.request.method}
                                  </span>
                                </div>
                              )}
                              {log.rawErrorResponse.request?.url && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    URL:
                                  </span>
                                  <div className="mt-1">
                                    <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all block">
                                      {log.rawErrorResponse.request.url}
                                    </code>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Raw Error & Timestamps */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                            Raw Error Response
                          </h4>
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">
                                  Message:
                                </span>
                                <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                                  {log.rawErrorResponse.message}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Stack Trace:
                                </span>
                                <details className="mt-1">
                                  <summary className="cursor-pointer text-blue-600 hover:underline text-xs">
                                    View Stack Trace
                                  </summary>
                                  <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap border">
                                    {log.rawErrorResponse.stack}
                                  </pre>
                                </details>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                            Timestamps
                          </h4>
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">
                                  Attempted At:
                                </span>{" "}
                                <span className="text-red-600">
                                  {formatDate(log.attemptedAt)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Created At:
                                </span>{" "}
                                {formatDate(log.createdAt)}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Updated At:
                                </span>{" "}
                                {formatDate(log.updatedAt)}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Version:
                                </span>{" "}
                                {log.__v}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
