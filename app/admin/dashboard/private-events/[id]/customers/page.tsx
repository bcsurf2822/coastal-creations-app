"use client";

import { ReactElement, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RiArrowLeftLine, RiUserLine, RiMailLine, RiPhoneLine } from "react-icons/ri";

interface Customer {
  _id: string;
  quantity: number;
  total: number;
  isSigningUpForSelf: boolean;
  participants: Array<{
    firstName: string;
    lastName: string;
    selectedOptions?: Array<{
      categoryName: string;
      choiceName: string;
    }>;
  }>;
  selectedOptions?: Array<{
    categoryName: string;
    choiceName: string;
  }>;
  billingInfo: {
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
  };
  createdAt: string;
}

interface PrivateEvent {
  _id: string;
  title: string;
  description?: string;
  price: number;
  depositAmount?: number;
  isDepositRequired?: boolean;
}

const PrivateEventCustomersPage = (): ReactElement => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [privateEvent, setPrivateEvent] = useState<PrivateEvent | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);

        // Fetch private event details
        const eventResponse = await fetch(`/api/private-events/${eventId}`);
        if (!eventResponse.ok) {
          throw new Error("Failed to fetch private event");
        }
        const eventData = await eventResponse.json();
        setPrivateEvent(eventData.privateEvent);

        // Fetch customers for this private event
        const customersResponse = await fetch(
          `/api/customer?eventId=${eventId}&eventType=PrivateEvent`
        );
        if (!customersResponse.ok) {
          throw new Error("Failed to fetch customers");
        }
        const customersData = await customersResponse.json();
        setCustomers(customersData.data || []);
      } catch (err) {
        console.error("[PRIVATE-EVENT-CUSTOMERS] Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !privateEvent) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-10">
            <p className="text-red-500 font-medium mb-4">
              {error || "Private event not found"}
            </p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <RiArrowLeftLine className="w-5 h-5 mr-1" />
            Back to Private Events
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {privateEvent.title}
              </h1>
              <p className="text-gray-600 mt-2">Customer Sign-ups</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Customers</div>
              <div className="text-2xl font-bold text-purple-600">
                {customers.length}
              </div>
            </div>
          </div>
        </div>

        {/* Event Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Event Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Full Price</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(privateEvent.price)}
              </div>
            </div>
            {privateEvent.isDepositRequired && privateEvent.depositAmount && (
              <div>
                <div className="text-sm text-gray-500">Deposit Amount</div>
                <div className="text-lg font-semibold text-blue-600">
                  {formatCurrency(privateEvent.depositAmount)}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(
                  customers.reduce((sum, customer) => sum + customer.total, 0)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Customer Sign-ups
            </h2>
          </div>

          <div className="p-6">
            {customers.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <RiUserLine className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No customers yet
                </h3>
                <p className="text-gray-500">
                  Customers who sign up for this private event will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {customers.map((customer, index) => (
                  <div
                    key={customer._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Booking #{index + 1}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(customer.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Amount Paid</div>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(customer.total)}
                        </div>
                      </div>
                    </div>

                    {/* Billing Information */}
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Billing Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center text-sm">
                            <RiUserLine className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">
                              {customer.billingInfo.firstName}{" "}
                              {customer.billingInfo.lastName}
                            </span>
                          </div>
                        </div>
                        {customer.billingInfo.emailAddress && (
                          <div>
                            <div className="flex items-center text-sm">
                              <RiMailLine className="w-4 h-4 mr-2 text-gray-400" />
                              <a
                                href={`mailto:${customer.billingInfo.emailAddress}`}
                                className="text-purple-600 hover:text-purple-700"
                              >
                                {customer.billingInfo.emailAddress}
                              </a>
                            </div>
                          </div>
                        )}
                        {customer.billingInfo.phoneNumber && (
                          <div>
                            <div className="flex items-center text-sm">
                              <RiPhoneLine className="w-4 h-4 mr-2 text-gray-400" />
                              <a
                                href={`tel:${customer.billingInfo.phoneNumber}`}
                                className="text-purple-600 hover:text-purple-700"
                              >
                                {customer.billingInfo.phoneNumber}
                              </a>
                            </div>
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
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

                    {/* Participants */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Participants ({customer.quantity})
                      </h4>
                      {customer.isSigningUpForSelf && (
                        <div className="mb-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                          {customer.billingInfo.firstName}{" "}
                          {customer.billingInfo.lastName} (Self)
                          {customer.selectedOptions &&
                            customer.selectedOptions.length > 0 && (
                              <div className="ml-4 mt-1 text-xs">
                                {customer.selectedOptions.map((option, i) => (
                                  <div key={i}>
                                    {option.categoryName}: {option.choiceName}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      )}
                      {customer.participants.map((participant, pIndex) => (
                        <div
                          key={pIndex}
                          className="mb-2 text-sm text-gray-600 bg-gray-50 p-2 rounded"
                        >
                          {participant.firstName} {participant.lastName}
                          {participant.selectedOptions &&
                            participant.selectedOptions.length > 0 && (
                              <div className="ml-4 mt-1 text-xs">
                                {participant.selectedOptions.map((option, i) => (
                                  <div key={i}>
                                    {option.categoryName}: {option.choiceName}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateEventCustomersPage;
