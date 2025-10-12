"use client";

import { useState, useEffect, useMemo } from "react";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiSearchLine,
  RiCalendarLine,
  RiUserLine,
  RiRefundLine,
} from "react-icons/ri";

interface SelectedOption {
  categoryName: string;
  choiceName: string;
}

interface Participant {
  firstName: string;
  lastName: string;
  selectedOptions?: SelectedOption[];
}

interface BillingInfo {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  emailAddress?: string;
  phoneNumber?: string;
}

interface Event {
  _id: string;
  eventName: string;
  eventType: string;
  price: number;
}

interface Customer {
  _id: string;
  event: Event;
  eventType: "Event" | "PrivateEvent";
  quantity: number;
  total: number;
  isSigningUpForSelf: boolean;
  participants: Participant[];
  selectedOptions?: SelectedOption[];
  billingInfo: BillingInfo;
  squarePaymentId?: string;
  squareCustomerId?: string;
  refundStatus?: "none" | "partial" | "full";
  refundAmount?: number;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomersResponse {
  success: boolean;
  message: string;
  data: Customer[];
  count: number;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Refund states
  const [refundingCustomer, setRefundingCustomer] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedCustomerForRefund, setSelectedCustomerForRefund] = useState<Customer | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search term and date range
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Filter by customer name or email
    if (searchTerm.trim()) {
      filtered = filtered.filter((customer) => {
        const billingName = `${customer.billingInfo.firstName} ${customer.billingInfo.lastName}`.toLowerCase();
        const email = customer.billingInfo.emailAddress?.toLowerCase() || "";
        const phone = customer.billingInfo.phoneNumber || "";
        const eventName = customer.event?.eventName?.toLowerCase() || "";

        return (
          billingName.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase()) ||
          phone.includes(searchTerm.toLowerCase()) ||
          eventName.includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(
        (customer) => new Date(customer.createdAt) >= new Date(startDate)
      );
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(
        (customer) => new Date(customer.createdAt) <= endDateTime
      );
    }

    return filtered;
  }, [customers, searchTerm, startDate, endDate]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/customer");
      const data: CustomersResponse = await response.json();

      if (data.success) {
        setCustomers(data.data);
      } else {
        setError("Failed to fetch customers");
      }
    } catch (err) {
      setError("An error occurred while fetching customers");
      console.error("[CUSTOMERS-FETCH] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  const toggleExpand = (id: string) => {
    setExpandedCustomer(expandedCustomer === id ? null : id);
  };

  const openRefundModal = (customer: Customer) => {
    setSelectedCustomerForRefund(customer);
    const remainingAmount = customer.total - (customer.refundAmount || 0);
    setRefundAmount(remainingAmount.toFixed(2));
    setRefundReason("");
    setShowRefundModal(true);
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setSelectedCustomerForRefund(null);
    setRefundAmount("");
    setRefundReason("");
  };

  const processRefund = async () => {
    if (!selectedCustomerForRefund || !refundAmount) {
      alert("Please provide a refund amount");
      return;
    }

    const refundAmountNum = parseFloat(refundAmount);
    const remainingAmount = selectedCustomerForRefund.total - (selectedCustomerForRefund.refundAmount || 0);

    if (refundAmountNum <= 0 || refundAmountNum > remainingAmount) {
      alert(`Refund amount must be between $0.01 and $${remainingAmount.toFixed(2)}`);
      return;
    }

    try {
      setRefundingCustomer(selectedCustomerForRefund._id);

      const response = await fetch("/api/refunds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomerForRefund._id,
          refundAmount: refundAmountNum,
          reason: refundReason || "Customer requested refund",
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Refund processed successfully for ${formatCurrency(refundAmountNum)}`);
        closeRefundModal();
        fetchCustomers();
      } else {
        alert(`Refund failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("[CUSTOMERS-REFUND] Error processing refund:", error);
      alert("An error occurred while processing the refund");
    } finally {
      setRefundingCustomer(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          onClick={fetchCustomers}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-gray-500 mt-1">
            {filteredCustomers.length} of {customers.length} customer
            {customers.length !== 1 ? "s" : ""} shown
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search
            </label>
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="search"
                placeholder="Search by name, email, phone, or event..."
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
              {filteredCustomers.length} result
              {filteredCustomers.length !== 1 ? "s" : ""} found
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

      {filteredCustomers.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {customers.length === 0 ? "No Customers" : "No Results Found"}
          </h3>
          <p className="text-gray-600">
            {customers.length === 0
              ? "No customer bookings have been made yet."
              : "Try adjusting your filters to see more results."}
          </p>
        </div>
      ) : (
        <>
          {/* Header Row */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700">
              <div className="col-span-1"></div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-3">Event</div>
              <div className="col-span-1">Quantity</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-1">Date</div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(customer._id)}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Expand/Collapse Icon */}
                    <div className="col-span-1">
                      {expandedCustomer === customer._id ? (
                        <RiArrowUpSLine className="h-5 w-5 text-gray-400" />
                      ) : (
                        <RiArrowDownSLine className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    {/* Customer Name */}
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.billingInfo.firstName}{" "}
                        {customer.billingInfo.lastName}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-600 truncate">
                        {customer.billingInfo.emailAddress ||
                          customer.billingInfo.phoneNumber}
                      </div>
                    </div>

                    {/* Event */}
                    <div className="col-span-3">
                      <div className="text-sm text-gray-600 truncate">
                        {customer.event?.eventName || "Unknown Event"}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <RiUserLine className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {customer.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="col-span-2">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(customer.total)}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="col-span-1">
                      <div className="text-xs text-gray-500">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedCustomer === customer._id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Billing Information */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                          Billing Information
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                Name:
                              </span>{" "}
                              {customer.billingInfo.firstName}{" "}
                              {customer.billingInfo.lastName}
                            </div>
                            {customer.billingInfo.emailAddress && (
                              <div>
                                <span className="font-medium text-gray-700">
                                  Email:
                                </span>{" "}
                                <a
                                  href={`mailto:${customer.billingInfo.emailAddress}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {customer.billingInfo.emailAddress}
                                </a>
                              </div>
                            )}
                            {customer.billingInfo.phoneNumber && (
                              <div>
                                <span className="font-medium text-gray-700">
                                  Phone:
                                </span>{" "}
                                <a
                                  href={`tel:${customer.billingInfo.phoneNumber}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {customer.billingInfo.phoneNumber}
                                </a>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-gray-700">
                                Address:
                              </span>
                              <div className="mt-1 text-gray-600">
                                {customer.billingInfo.addressLine1}
                                {customer.billingInfo.addressLine2 && (
                                  <>, {customer.billingInfo.addressLine2}</>
                                )}
                                <br />
                                {customer.billingInfo.city},{" "}
                                {customer.billingInfo.stateProvince}{" "}
                                {customer.billingInfo.postalCode}
                                <br />
                                {customer.billingInfo.country}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Event Information */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                          Event Information
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                Event Name:
                              </span>{" "}
                              {customer.event?.eventName || "Unknown Event"}
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Event Type:
                              </span>{" "}
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {customer.eventType === "PrivateEvent"
                                  ? "Private Event"
                                  : customer.event?.eventType || "Event"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Event ID:
                              </span>{" "}
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {customer.event?._id}
                              </code>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Quantity:
                              </span>{" "}
                              {customer.quantity} participant
                              {customer.quantity !== 1 ? "s" : ""}
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Total Amount:
                              </span>{" "}
                              <span className="text-green-600 font-semibold">
                                {formatCurrency(customer.total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Participants */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                          Participants
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                Signing up for self:
                              </span>{" "}
                              {customer.isSigningUpForSelf ? "Yes" : "No"}
                            </div>
                            {customer.participants &&
                              customer.participants.length > 0 && (
                                <div>
                                  <span className="font-medium text-gray-700 block mb-2">
                                    Additional Participants:
                                  </span>
                                  <div className="space-y-2">
                                    {customer.participants.map(
                                      (participant, index) => (
                                        <div
                                          key={index}
                                          className="bg-gray-50 p-2 rounded"
                                        >
                                          <div className="font-medium">
                                            {participant.firstName}{" "}
                                            {participant.lastName}
                                          </div>
                                          {participant.selectedOptions &&
                                            participant.selectedOptions.length >
                                              0 && (
                                              <div className="text-xs text-gray-600 mt-1">
                                                Options:{" "}
                                                {participant.selectedOptions
                                                  .map(
                                                    (opt) =>
                                                      `${opt.categoryName}: ${opt.choiceName}`
                                                  )
                                                  .join(", ")}
                                              </div>
                                            )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            {customer.selectedOptions &&
                              customer.selectedOptions.length > 0 && (
                                <div>
                                  <span className="font-medium text-gray-700 block mb-2">
                                    Selected Options:
                                  </span>
                                  <div className="space-y-1">
                                    {customer.selectedOptions.map(
                                      (option, index) => (
                                        <div
                                          key={index}
                                          className="text-xs bg-gray-50 p-2 rounded"
                                        >
                                          <span className="font-medium">
                                            {option.categoryName}:
                                          </span>{" "}
                                          {option.choiceName}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Payment & Refund Information */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                          Payment & Refunds
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="space-y-3 text-sm">
                            {customer.squarePaymentId && (
                              <div>
                                <span className="font-medium text-gray-700">
                                  Square Payment ID:
                                </span>{" "}
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                                  {customer.squarePaymentId}
                                </code>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-gray-700">
                                Refund Status:
                              </span>{" "}
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  customer.refundStatus === "full"
                                    ? "bg-red-100 text-red-800"
                                    : customer.refundStatus === "partial"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {customer.refundStatus === "full"
                                  ? "Fully Refunded"
                                  : customer.refundStatus === "partial"
                                  ? "Partially Refunded"
                                  : "Not Refunded"}
                              </span>
                            </div>
                            {customer.refundAmount && customer.refundAmount > 0 && (
                              <>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Refund Amount:
                                  </span>{" "}
                                  <span className="text-red-600 font-semibold">
                                    {formatCurrency(customer.refundAmount)}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Remaining Balance:
                                  </span>{" "}
                                  <span className="text-green-600 font-semibold">
                                    {formatCurrency(
                                      customer.total - customer.refundAmount
                                    )}
                                  </span>
                                </div>
                              </>
                            )}
                            {customer.refundedAt && (
                              <div>
                                <span className="font-medium text-gray-700">
                                  Refunded At:
                                </span>{" "}
                                {formatDate(customer.refundedAt)}
                              </div>
                            )}
                            {customer.squarePaymentId &&
                              customer.refundStatus !== "full" && (
                                <div className="mt-4">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openRefundModal(customer);
                                    }}
                                    disabled={refundingCustomer === customer._id}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {refundingCustomer === customer._id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                      <>
                                        <RiRefundLine className="h-4 w-4" />
                                        <span>Process Refund</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            {!customer.squarePaymentId && (
                              <div className="mt-2 text-xs text-gray-500 italic">
                                No payment ID available. This booking may have been
                                created before payment tracking was implemented.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                          Timestamps
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                Customer ID:
                              </span>{" "}
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {customer._id}
                              </code>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Created At:
                              </span>{" "}
                              {formatDate(customer.createdAt)}
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Updated At:
                              </span>{" "}
                              {formatDate(customer.updatedAt)}
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

      {/* Refund Modal */}
      {showRefundModal && selectedCustomerForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Process Refund
            </h3>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Customer:</span>{" "}
                    {selectedCustomerForRefund.billingInfo.firstName}{" "}
                    {selectedCustomerForRefund.billingInfo.lastName}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Total Paid:
                    </span>{" "}
                    {formatCurrency(selectedCustomerForRefund.total)}
                  </div>
                  {selectedCustomerForRefund.refundAmount &&
                    selectedCustomerForRefund.refundAmount > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Previously Refunded:
                        </span>{" "}
                        {formatCurrency(selectedCustomerForRefund.refundAmount)}
                      </div>
                    )}
                  <div>
                    <span className="font-medium text-gray-700">
                      Remaining Balance:
                    </span>{" "}
                    <span className="font-semibold">
                      {formatCurrency(
                        selectedCustomerForRefund.total -
                          (selectedCustomerForRefund.refundAmount || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="refundAmount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Refund Amount
                </label>
                <input
                  type="number"
                  id="refundAmount"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  min="0.01"
                  max={(
                    selectedCustomerForRefund.total -
                    (selectedCustomerForRefund.refundAmount || 0)
                  ).toFixed(2)}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="refundReason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Reason (Optional)
                </label>
                <textarea
                  id="refundReason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for refund..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeRefundModal}
                  disabled={refundingCustomer === selectedCustomerForRefund._id}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={processRefund}
                  disabled={refundingCustomer === selectedCustomerForRefund._id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {refundingCustomer === selectedCustomerForRefund._id
                    ? "Processing..."
                    : "Confirm Refund"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
