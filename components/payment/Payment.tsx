"use client";

import { submitPayment } from "@/app/actions/actions";
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";
import { useState, ChangeEvent, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PiSquareLogoFill } from "react-icons/pi";

interface PaymentConfig {
  applicationId: string;
  locationId: string;
  redirectUrl: string;
}

interface EventOption {
  categoryName: string;
  categoryDescription?: string;
  choices: Array<{
    name: string;
  }>;
}

export default function Payment() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const [formValid, setFormValid] = useState(false);
  const [config, setConfig] = useState<PaymentConfig>({
    applicationId: "",
    locationId: "main",
    redirectUrl: "",
  });

  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") || "";
  const eventTitle = searchParams.get("eventTitle") || "";
  const eventPrice = searchParams.get("price") || "";

  const [formattedPrice, setFormattedPrice] = useState<string>("");
  const [isPriceAvailable, setIsPriceAvailable] = useState<boolean>(true);
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<
    Array<{ categoryName: string; choiceName: string }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // New state for handling participants
  const [isSigningUpForSelf, setIsSigningUpForSelf] = useState(true);
  const [participants, setParticipants] = useState<
    Array<{
      firstName: string;
      lastName: string;
      selectedOptions?: Array<{
        categoryName: string;
        choiceName: string;
      }>;
    }>
  >([]);

  const [billingDetails, setBillingDetails] = useState({
    addressLine1: "",
    addressLine2: "",
    familyName: "",
    givenName: "",
    countryCode: "US",
    city: "",
    state: "",
    postalCode: "",
    email: "",
    phoneNumber: "",
    numberOfPeople: 1,
  });

  // Calculate total price based on number of people
  const [totalPrice, setTotalPrice] = useState<string>("");

  // Fetch event details including options
  useEffect(() => {
    if (eventId) {
      const fetchEventDetails = async () => {
        try {
          const response = await fetch(`/api/event/${eventId}`);
          if (response.ok) {
            const data = await response.json();
            if (
              data.event &&
              data.event.options &&
              data.event.options.length > 0
            ) {
              // Update event options only if they've changed
              const newOptions = data.event.options;
              if (JSON.stringify(newOptions) !== JSON.stringify(eventOptions)) {
                setEventOptions(newOptions);

                // Initialize selectedOptions with the first choice of each category
                const initialSelectedOptions = newOptions.map(
                  (option: EventOption) => ({
                    categoryName: option.categoryName,
                    choiceName: option.choices[0]?.name || "",
                  })
                );
                setSelectedOptions(initialSelectedOptions);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching event details:", error);
        }
      };

      fetchEventDetails();
    }
  }, [eventId]);

  // Format price for display and ensure it's a valid number
  useEffect(() => {
    try {
      if (!eventPrice) {
        setIsPriceAvailable(false);
        return;
      }

      // Remove any non-numeric characters except decimal point
      const cleanPrice = eventPrice.replace(/[^\d.]/g, "");
      const price = parseFloat(cleanPrice);

      if (!isNaN(price)) {
        // Format to 2 decimal places
        setFormattedPrice(price.toFixed(2));
        // Calculate total price
        setTotalPrice((price * billingDetails.numberOfPeople).toFixed(2));
        setIsPriceAvailable(true);
      } else {
        setIsPriceAvailable(false);
      }
    } catch (e) {
      console.error("Error formatting price:", e);
      setIsPriceAvailable(false);
    }
  }, [eventPrice, billingDetails.numberOfPeople]);

  // Validate form fields
  useEffect(() => {
    const isContactProvided =
      billingDetails.email.trim() !== "" ||
      billingDetails.phoneNumber.trim() !== "";

    const areRequiredFieldsFilled =
      billingDetails.givenName.trim() !== "" &&
      billingDetails.familyName.trim() !== "" &&
      billingDetails.addressLine1.trim() !== "" &&
      billingDetails.city.trim() !== "" &&
      billingDetails.state.trim() !== "" &&
      billingDetails.postalCode.trim() !== "" &&
      isContactProvided;

    setFormValid(areRequiredFieldsFilled);
  }, [billingDetails]);

  // Update participants when numberOfPeople changes or isSigningUpForSelf changes
  useEffect(() => {
    // If signing up for self with multiple people, we need (numberOfPeople - 1) additional participants
    if (isSigningUpForSelf) {
      const additionalPeople = Math.max(0, billingDetails.numberOfPeople - 1);
      const newParticipants = Array(additionalPeople)
        .fill(null)
        .map((_, index) => ({
          firstName: `Additional Person ${index + 1}`,
          lastName: "Pending",
          selectedOptions: [] as Array<{
            categoryName: string;
            choiceName: string;
          }>,
        }));
      setParticipants(newParticipants);
    } else {
      // If signing up for others, we need numberOfPeople participants
      const newParticipants = Array(billingDetails.numberOfPeople)
        .fill(null)
        .map((_, index) => ({
          firstName: `Participant ${index + 1}`,
          lastName: "Pending",
          selectedOptions: [] as Array<{
            categoryName: string;
            choiceName: string;
          }>,
        }));
      setParticipants(newParticipants);
    }
  }, [billingDetails.numberOfPeople, isSigningUpForSelf]);

  // Fetch payment configuration from API
  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/payment-config");
        if (!response.ok) {
          throw new Error("Failed to fetch payment configuration");
        }
        const data = await response.json();
        setConfig(data);

        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching payment configuration:", error);
        setError(
          "Failed to load payment configuration. Please try again later."
        );
      }
    }

    fetchConfig();
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (categoryName: string, choiceName: string) => {
    setSelectedOptions((prevOptions) => {
      const newOptions = [...prevOptions];
      const existingOptionIndex = newOptions.findIndex(
        (option) => option.categoryName === categoryName
      );

      if (existingOptionIndex !== -1) {
        newOptions[existingOptionIndex] = { categoryName, choiceName };
      } else {
        newOptions.push({ categoryName, choiceName });
      }

      return newOptions;
    });
  };

  const handleTestSubmit = async () => {
    if (!formValid) {
      setError("Please complete all required fields before testing");
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(null);

    try {
      const roundedTotal = Math.round(parseFloat(totalPrice) * 100) / 100;

      const response = await fetch("/api/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: eventId,
          quantity: billingDetails.numberOfPeople,
          total: roundedTotal,
          isSigningUpForSelf: isSigningUpForSelf,
          participants,
          selectedOptions,
          billingInfo: {
            firstName: billingDetails.givenName,
            lastName: billingDetails.familyName,
            addressLine1: billingDetails.addressLine1,
            addressLine2: billingDetails.addressLine2,
            city: billingDetails.city,
            stateProvince: billingDetails.state,
            postalCode: billingDetails.postalCode,
            country: billingDetails.countryCode,
            emailAddress: billingDetails.email,
            phoneNumber: billingDetails.phoneNumber,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitSuccess(
          `Test submission successful! Customer ID: ${result.data._id}`
        );
      } else {
        setError(`Test submission failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error during test submission:", error);
      setError("Error during test submission. See console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Event Header */}
        {eventTitle && (
          <div className="bg-primary text-black p-6 sm:p-10 mb-6 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2 text-black">
                Registration
              </h1>
              <p className="text-xl mb-2 font-medium text-black">
                You&apos;re registering for:{" "}
                <span className="font-bold text-black">{eventTitle}</span>
              </p>

              {isPriceAvailable ? (
                <div className="mt-4 bg-white/70 py-3 px-8 rounded-full inline-block shadow-md">
                  <p className="text-xl">
                    <span className="font-medium text-black">Price:</span>{" "}
                    <span className="font-bold text-black">
                      ${formattedPrice}
                    </span>
                    <span className="text-black font-medium">
                      {" "}
                      / Per Person
                    </span>
                  </p>
                </div>
              ) : (
                <div className="mt-4 bg-white/70 py-3 px-8 rounded-lg inline-block shadow-md">
                  <p className="text-xl font-medium text-red-500">
                    Sorry, payments are currently not available for this event.
                  </p>
                </div>
              )}
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 rounded-full -mr-32 -mt-32 z-0"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/40 rounded-full -ml-24 -mb-24 z-0"></div>
          </div>
        )}

        {isPriceAvailable ? (
          // Only show billing and payment form if price is available
          <div className="p-6 sm:p-10">
            {/* Billing Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
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
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="givenName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="givenName"
                    name="givenName"
                    value={billingDetails.givenName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="familyName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="familyName"
                    name="familyName"
                    value={billingDetails.familyName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="numberOfPeople"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Number of People
                  </label>
                  <select
                    id="numberOfPeople"
                    name="numberOfPeople"
                    value={billingDetails.numberOfPeople}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Person" : "People"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Registration Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Type
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-primary"
                        checked={isSigningUpForSelf}
                        onChange={() => setIsSigningUpForSelf(true)}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I&apos;m registering for myself
                      </span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-primary"
                        checked={!isSigningUpForSelf}
                        onChange={() => setIsSigningUpForSelf(false)}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I&apos;m registering for others
                      </span>
                    </label>
                  </div>
                </div>

                {/* Event Options Section for primary customer */}
                {eventOptions.length > 0 && isSigningUpForSelf && (
                  <div className="md:col-span-2 mb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                      {billingDetails.numberOfPeople > 1
                        ? "Your Event Options"
                        : "Event Options"}
                    </h3>
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      {eventOptions.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="border-b border-gray-200 pb-3 last:border-0 last:pb-0"
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {option.categoryName}
                            {option.categoryDescription && (
                              <span className="text-gray-500 text-xs ml-1">
                                - {option.categoryDescription}
                              </span>
                            )}
                          </label>
                          <select
                            value={
                              selectedOptions.find(
                                (so) => so.categoryName === option.categoryName
                              )?.choiceName || ""
                            }
                            onChange={(e) =>
                              handleOptionChange(
                                option.categoryName,
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                          >
                            {option.choices.map((choice, choiceIndex) => (
                              <option key={choiceIndex} value={choice.name}>
                                {choice.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Participants Section when signing up for self with multiple people */}
                {isSigningUpForSelf && billingDetails.numberOfPeople > 1 && (
                  <div className="md:col-span-2 mb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                      Additional Participants
                    </h3>
                    <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
                      {participants.map((participant, index) => (
                        <div
                          key={index}
                          className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                        >
                          <h4 className="font-medium text-gray-700 mb-3">
                            Person {index + 2}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                              </label>
                              <input
                                type="text"
                                value={participant.firstName}
                                onChange={(e) => {
                                  const newParticipants = [...participants];
                                  newParticipants[index].firstName =
                                    e.target.value;
                                  setParticipants(newParticipants);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                              </label>
                              <input
                                type="text"
                                value={participant.lastName}
                                onChange={(e) => {
                                  const newParticipants = [...participants];
                                  newParticipants[index].lastName =
                                    e.target.value;
                                  setParticipants(newParticipants);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              />
                            </div>

                            {/* Event options for each additional participant */}
                            {eventOptions.length > 0 && (
                              <div className="col-span-1 md:col-span-2">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                  Event Options
                                </h5>
                                <div className="space-y-3">
                                  {eventOptions.map((option, optionIndex) => (
                                    <div key={optionIndex}>
                                      <label className="block text-sm text-gray-700 mb-1">
                                        {option.categoryName}
                                      </label>
                                      <select
                                        value={
                                          participant.selectedOptions?.find(
                                            (so) =>
                                              so.categoryName ===
                                              option.categoryName
                                          )?.choiceName ||
                                          option.choices[0]?.name ||
                                          ""
                                        }
                                        onChange={(e) => {
                                          const newParticipants = [
                                            ...participants,
                                          ];
                                          if (
                                            !newParticipants[index]
                                              .selectedOptions
                                          ) {
                                            newParticipants[
                                              index
                                            ].selectedOptions = [];
                                          }

                                          const optionIndex = newParticipants[
                                            index
                                          ].selectedOptions?.findIndex(
                                            (so) =>
                                              so.categoryName ===
                                              option.categoryName
                                          );

                                          if (
                                            optionIndex !== -1 &&
                                            optionIndex !== undefined
                                          ) {
                                            newParticipants[
                                              index
                                            ].selectedOptions![optionIndex] = {
                                              categoryName: option.categoryName,
                                              choiceName: e.target.value,
                                            };
                                          } else {
                                            newParticipants[
                                              index
                                            ].selectedOptions?.push({
                                              categoryName: option.categoryName,
                                              choiceName: e.target.value,
                                            });
                                          }

                                          setParticipants(newParticipants);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                      >
                                        {option.choices.map(
                                          (choice, choiceIndex) => (
                                            <option
                                              key={choiceIndex}
                                              value={choice.name}
                                            >
                                              {choice.name}
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Participant Details Section */}
                {!isSigningUpForSelf && billingDetails.numberOfPeople > 0 && (
                  <div className="md:col-span-2 mb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                      Participant Information
                    </h3>
                    <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
                      {participants.map((participant, index) => (
                        <div
                          key={index}
                          className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                        >
                          <h4 className="font-medium text-gray-700 mb-3">
                            Participant {index + 1}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                              </label>
                              <input
                                type="text"
                                value={participant.firstName}
                                onChange={(e) => {
                                  const newParticipants = [...participants];
                                  newParticipants[index].firstName =
                                    e.target.value;
                                  setParticipants(newParticipants);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                              </label>
                              <input
                                type="text"
                                value={participant.lastName}
                                onChange={(e) => {
                                  const newParticipants = [...participants];
                                  newParticipants[index].lastName =
                                    e.target.value;
                                  setParticipants(newParticipants);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              />
                            </div>

                            {/* Event options for each participant */}
                            {eventOptions.length > 0 && (
                              <div className="col-span-1 md:col-span-2">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                  Event Options
                                </h5>
                                <div className="space-y-3">
                                  {eventOptions.map((option, optionIndex) => (
                                    <div key={optionIndex}>
                                      <label className="block text-sm text-gray-700 mb-1">
                                        {option.categoryName}
                                      </label>
                                      <select
                                        value={
                                          participant.selectedOptions?.find(
                                            (so) =>
                                              so.categoryName ===
                                              option.categoryName
                                          )?.choiceName ||
                                          option.choices[0]?.name ||
                                          ""
                                        }
                                        onChange={(e) => {
                                          const newParticipants = [
                                            ...participants,
                                          ];
                                          if (
                                            !newParticipants[index]
                                              .selectedOptions
                                          ) {
                                            newParticipants[
                                              index
                                            ].selectedOptions = [];
                                          }

                                          const optionIndex = newParticipants[
                                            index
                                          ].selectedOptions?.findIndex(
                                            (so) =>
                                              so.categoryName ===
                                              option.categoryName
                                          );

                                          if (
                                            optionIndex !== -1 &&
                                            optionIndex !== undefined
                                          ) {
                                            newParticipants[
                                              index
                                            ].selectedOptions![optionIndex] = {
                                              categoryName: option.categoryName,
                                              choiceName: e.target.value,
                                            };
                                          } else {
                                            newParticipants[
                                              index
                                            ].selectedOptions?.push({
                                              categoryName: option.categoryName,
                                              choiceName: e.target.value,
                                            });
                                          }

                                          setParticipants(newParticipants);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                      >
                                        {option.choices.map(
                                          (choice, choiceIndex) => (
                                            <option
                                              key={choiceIndex}
                                              value={choice.name}
                                            >
                                              {choice.name}
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label
                    htmlFor="addressLine1"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={billingDetails.addressLine1}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
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
                    value={billingDetails.addressLine2}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={billingDetails.city}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={billingDetails.state}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={billingDetails.postalCode}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="countryCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country
                  </label>
                  <select
                    id="countryCode"
                    name="countryCode"
                    value={billingDetails.countryCode}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  >
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={billingDetails.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={billingDetails.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 italic">
                    * Either Email Address or Phone Number is required for
                    contact purposes.
                  </p>
                </div>

                {/* Display total price calculation */}
                {isPriceAvailable && (
                  <div className="md:col-span-2 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-800">
                        Price per person:
                      </span>
                      <span className="text-lg font-semibold">
                        ${formattedPrice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-medium text-gray-800">
                        Number of people:
                      </span>
                      <span className="text-lg font-semibold">
                        {billingDetails.numberOfPeople}
                      </span>
                    </div>
                    <div className="h-px bg-gray-300 my-3"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">
                        Total:
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        ${totalPrice}
                      </span>
                    </div>
                  </div>
                )}

                {/* Test Submit Button */}
                <div className="md:col-span-2 mt-4">
                  <div className="border-t border-gray-300 pt-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                      Testing Only
                    </h3>
                    {submitSuccess && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-800 rounded-lg">
                        {submitSuccess}
                      </div>
                    )}
                    <button
                      onClick={handleTestSubmit}
                      disabled={isSubmitting || !formValid}
                      className="w-full mb-4 py-3 px-6 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 transition duration-200"
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : "Test Database Submission Only"}
                    </button>
                    <p className="text-sm text-gray-500 italic">
                      This button is for testing database submission only. No
                      payment will be processed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
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
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
                Payment Details
              </h2>

              {/* Error Alert */}
              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
                  role="alert"
                >
                  <strong className="font-bold">Payment Error: </strong>
                  <span className="block sm:inline">{error}</span>
                  <button
                    className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    onClick={() => setError("")}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="fill-current h-6 w-6 text-red-500"
                      role="button"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                    </svg>
                  </button>
                </div>
              )}

              {isLoaded ? (
                <div className="p-6 bg-gray-50 rounded-lg">
                  {!formValid && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg">
                      <p className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Please complete all required fields above before
                        proceeding with payment. You must provide either an
                        email address or phone number.
                      </p>
                    </div>
                  )}
                  <PaymentForm
                    applicationId={config.applicationId}
                    locationId={config.locationId}
                    createPaymentRequest={() => {
                      return {
                        countryCode: "US",
                        currencyCode: "USD",
                        total: {
                          amount: totalPrice,
                          label: "Total",
                        },
                      };
                    }}
                    cardTokenizeResponseReceived={async (token) => {
                      // Validate form before proceeding
                      const isContactProvided =
                        billingDetails.email.trim() !== "" ||
                        billingDetails.phoneNumber.trim() !== "";

                      const areRequiredFieldsFilled =
                        billingDetails.givenName.trim() !== "" &&
                        billingDetails.familyName.trim() !== "" &&
                        billingDetails.addressLine1.trim() !== "" &&
                        billingDetails.city.trim() !== "" &&
                        billingDetails.state.trim() !== "" &&
                        billingDetails.postalCode.trim() !== "" &&
                        isContactProvided;

                      if (!areRequiredFieldsFilled) {
                        setError(
                          "Please fill in all required fields. Either email or phone number must be provided."
                        );
                        return;
                      }

                      if (token.token) {
                        try {
                          const roundedTotal =
                            Math.round(parseFloat(totalPrice) * 100) / 100;

                          const result = await submitPayment(token.token, {
                            ...billingDetails,
                            eventId,
                            eventTitle,
                            eventPrice: formattedPrice,
                          });

                          if (result?.result?.payment?.status === "COMPLETED") {
                            const paymentId = result.result.payment.id;
                            const receiptUrl =
                              result.result.payment.receiptUrl || "";
                            const note = result.result.payment.note || "";

                            // Safely extract amount and currency with fallbacks
                            const amount =
                              result.result.payment.amountMoney?.amount?.toString() ||
                              "0";
                            const currency =
                              result.result.payment.amountMoney?.currency ||
                              "USD";

                            // Get card details if available
                            const last4 =
                              result.result.payment.cardDetails?.card?.last4 ||
                              "";
                            const cardBrand =
                              result.result.payment.cardDetails?.card
                                ?.cardBrand || "";

                            // Build query parameters with all relevant information
                            const queryParams = new URLSearchParams();
                            queryParams.set("paymentId", paymentId || "");
                            queryParams.set("status", "COMPLETED");
                            queryParams.set("receiptUrl", receiptUrl);
                            queryParams.set(
                              "firstName",
                              billingDetails.givenName
                            );
                            queryParams.set(
                              "lastName",
                              billingDetails.familyName
                            );
                            queryParams.set("eventTitle", eventTitle || "");
                            queryParams.set("note", note);
                            queryParams.set("amount", amount);
                            queryParams.set("currency", currency);
                            queryParams.set("last4", last4);
                            queryParams.set("cardBrand", cardBrand);

                            // Add contact information to success page
                            if (billingDetails.email) {
                              queryParams.set("email", billingDetails.email);
                            }
                            if (billingDetails.phoneNumber) {
                              queryParams.set(
                                "phone",
                                billingDetails.phoneNumber
                              );
                            }

                            // Add number of people to success page
                            queryParams.set(
                              "numberOfPeople",
                              billingDetails.numberOfPeople.toString()
                            );

                            // Add total price to success page
                            queryParams.set("totalPrice", totalPrice);

                            // Use config for redirect URL
                            router.push(
                              `${config.redirectUrl}?${queryParams.toString()}`
                            );

                            try {
                              await fetch("/api/customer", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  event: eventId,
                                  quantity: billingDetails.numberOfPeople,
                                  total: roundedTotal,
                                  isSigningUpForSelf,
                                  participants,
                                  selectedOptions,
                                  billingInfo: {
                                    firstName: billingDetails.givenName,
                                    lastName: billingDetails.familyName,
                                    addressLine1: billingDetails.addressLine1,
                                    addressLine2: billingDetails.addressLine2,
                                    city: billingDetails.city,
                                    stateProvince: billingDetails.state,
                                    postalCode: billingDetails.postalCode,
                                    country: billingDetails.countryCode,
                                    emailAddress: billingDetails.email,
                                    phoneNumber: billingDetails.phoneNumber,
                                  },
                                }),
                              });
                            } catch (error) {
                              console.error(
                                "Error saving customer data:",
                                error
                              );
                              // Continue with payment success flow even if customer data save fails
                            }
                          } else {
                            // Handle payment not completed
                            console.error("Payment not completed");
                            setError(
                              "Payment could not be completed. Please try again."
                            );
                          }
                        } catch (error) {
                          console.error("Error:", error);
                          setError(
                            "Payment failed: Error: request failed with status 404. Please check your payment details and try again."
                          );
                        }
                      } else {
                        console.error("Payment token is undefined");
                        setError(
                          "Payment token is undefined. Please try again."
                        );
                      }
                    }}
                  >
                    <div className="max-w-md mx-auto">
                      <CreditCard />
                      {!formValid && (
                        <div className="mt-4 text-red-600 text-center text-sm font-medium">
                          Please complete all required fields above before
                          submitting payment
                        </div>
                      )}
                    </div>
                  </PaymentForm>
                </div>
              ) : (
                <div className="text-center p-10 bg-gray-50 rounded-lg">
                  <div className="animate-pulse inline-block h-8 w-8 rounded-full bg-primary"></div>
                  <p className="mt-4 text-gray-600">Loading payment form...</p>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 text-center mt-4">
              <p className="flex items-center justify-center gap-1">
                Secure payment processing by{" "}
                <PiSquareLogoFill className="text-xl" /> Square
              </p>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-lg mb-6">
              To register for this event, please contact us directly by email.
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() =>
                  (window.location.href =
                    "mailto:info@coastalcreationsstudio.com")
                }
                className="px-6 py-3 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-colors border-2 border-black flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email
              </button>
            </div>
            <p className="text-gray-600">
              We&apos;ll be happy to assist you with your registration and
              answer any questions you may have.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
