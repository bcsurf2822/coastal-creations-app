"use client";

import { ChangeEvent } from "react";

interface EventOption {
  categoryName: string;
  categoryDescription?: string;
  choices: Array<{
    name: string;
  }>;
}

interface Participant {
  firstName: string;
  lastName: string;
  selectedOptions?: Array<{
    categoryName: string;
    choiceName: string;
  }>;
}

interface BillingDetails {
  addressLine1: string;
  addressLine2: string;
  familyName: string;
  givenName: string;
  countryCode: string;
  city: string;
  state: string;
  postalCode: string;
  email: string;
  phoneNumber: string;
  numberOfPeople: number;
}

interface BillingFormProps {
  billingDetails: BillingDetails;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  isSigningUpForSelf: boolean;
  setIsSigningUpForSelf: (value: boolean) => void;
  eventOptions: EventOption[];
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  selectedOptions: Array<{ categoryName: string; choiceName: string }>;
  handleOptionChange: (categoryName: string, choiceName: string) => void;
  formattedPrice: string;
  totalPrice: string;
  originalPrice: string;
  discountInfo: {
    isDiscountAvailable: boolean;
    discount?: {
      type: "percentage" | "fixed";
      value: number;
      minParticipants: number;
      description?: string;
    };
  };
  currentParticipantCount: number;
}

const BillingForm: React.FC<BillingFormProps> = ({
  billingDetails,
  handleInputChange,
  isSigningUpForSelf,
  setIsSigningUpForSelf,
  eventOptions,
  participants,
  setParticipants,
  selectedOptions,
  handleOptionChange,
  formattedPrice,
  totalPrice,
  originalPrice,
  discountInfo,
  currentParticipantCount,
}) => {
  // Helper functions
  const isDiscountActive = (): boolean => {
    if (!discountInfo.isDiscountAvailable || !discountInfo.discount) return false;
    const totalParticipants = currentParticipantCount + billingDetails.numberOfPeople;
    return totalParticipants >= discountInfo.discount.minParticipants;
  };

  const getOriginalPrice = (): number => {
    const cleanPrice = originalPrice.replace(/[^\d.]/g, "");
    return parseFloat(cleanPrice) || 0;
  };

  const getOriginalTotal = (): string => {
    return (getOriginalPrice() * billingDetails.numberOfPeople).toFixed(2);
  };
  return (
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
                onChange={() => {
                  setIsSigningUpForSelf(true);
                  // Immediately update participants array for self-registration
                  const additionalPeople = Math.max(
                    0,
                    billingDetails.numberOfPeople - 1
                  );
                  const newParticipants = Array(additionalPeople)
                    .fill(null)
                    .map(() => ({
                      firstName: "",
                      lastName: "",
                      selectedOptions: [] as Array<{
                        categoryName: string;
                        choiceName: string;
                      }>,
                    }));
                  setParticipants(newParticipants);
                }}
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
                onChange={() => {
                  setIsSigningUpForSelf(false);
                  // Immediately update participants array for registering others
                  const newParticipants = Array(billingDetails.numberOfPeople)
                    .fill(null)
                    .map(() => ({
                      firstName: "",
                      lastName: "",
                      selectedOptions: [] as Array<{
                        categoryName: string;
                        choiceName: string;
                      }>,
                    }));
                  setParticipants(newParticipants);
                }}
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
                      handleOptionChange(option.categoryName, e.target.value)
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
                          newParticipants[index].firstName = e.target.value;
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
                          newParticipants[index].lastName = e.target.value;
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
                                      so.categoryName === option.categoryName
                                  )?.choiceName ||
                                  option.choices[0]?.name ||
                                  ""
                                }
                                onChange={(e) => {
                                  const newParticipants = [...participants];
                                  if (!newParticipants[index].selectedOptions) {
                                    newParticipants[index].selectedOptions = [];
                                  }

                                  const optionIndex = newParticipants[
                                    index
                                  ].selectedOptions?.findIndex(
                                    (so) =>
                                      so.categoryName === option.categoryName
                                  );

                                  if (
                                    optionIndex !== -1 &&
                                    optionIndex !== undefined
                                  ) {
                                    newParticipants[index].selectedOptions![
                                      optionIndex
                                    ] = {
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
              {Array.from({
                length: billingDetails.numberOfPeople,
              }).map((_, index) => {
                // Get the existing participant data if available, otherwise create default
                const participant = participants[index] || {
                  firstName: "",
                  lastName: "",
                  selectedOptions: [],
                };

                return (
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
                            // Create or update the participant
                            if (!newParticipants[index]) {
                              newParticipants[index] = {
                                firstName: e.target.value,
                                lastName: "",
                                selectedOptions: [],
                              };
                            } else {
                              newParticipants[index].firstName = e.target.value;
                            }
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
                            // Create or update the participant
                            if (!newParticipants[index]) {
                              newParticipants[index] = {
                                firstName: "",
                                lastName: e.target.value,
                                selectedOptions: [],
                              };
                            } else {
                              newParticipants[index].lastName = e.target.value;
                            }
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
                                        so.categoryName === option.categoryName
                                    )?.choiceName ||
                                    option.choices[0]?.name ||
                                    ""
                                  }
                                  onChange={(e) => {
                                    const newParticipants = [...participants];
                                    // Create or update the participant
                                    if (!newParticipants[index]) {
                                      newParticipants[index] = {
                                        firstName: "",
                                        lastName: "",
                                        selectedOptions: [
                                          {
                                            categoryName: option.categoryName,
                                            choiceName: e.target.value,
                                          },
                                        ],
                                      };
                                    } else {
                                      // Make sure selectedOptions array exists
                                      if (
                                        !newParticipants[index].selectedOptions
                                      ) {
                                        newParticipants[index].selectedOptions =
                                          [];
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
                                        newParticipants[index].selectedOptions![
                                          optionIndex
                                        ] = {
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
                                    }
                                    setParticipants(newParticipants);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                  {option.choices.map((choice, choiceIndex) => (
                                    <option
                                      key={choiceIndex}
                                      value={choice.name}
                                    >
                                      {choice.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
            * Either Email Address or Phone Number is required for contact
            purposes.
          </p>
        </div>

        {/* Display total price calculation */}
        {formattedPrice && (
          <div className="md:col-span-2 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {/* Discount Badge */}
            {isDiscountActive() && discountInfo.discount?.description && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <div className="flex items-center">
                  <span className="text-green-600 text-xl mr-2">🎉</span>
                  <span className="text-green-800 font-semibold">
                    {discountInfo.discount.description}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-800">
                Price per person:
              </span>
              <span className="text-lg font-semibold">
                {isDiscountActive() ? (
                  <>
                    <span className="text-gray-500 line-through mr-2">
                      ${getOriginalPrice().toFixed(2)}
                    </span>
                    <span className="text-green-600">${formattedPrice}</span>
                  </>
                ) : (
                  `$${formattedPrice}`
                )}
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
            
            {/* Show discount savings if active */}
            {isDiscountActive() && (
              <div className="flex justify-between items-center mt-2 text-green-600">
                <span className="text-lg font-medium">You save:</span>
                <span className="text-lg font-semibold">
                  ${(parseFloat(getOriginalTotal()) - parseFloat(totalPrice)).toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="h-px bg-gray-300 my-3"></div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-gray-900">
                ${totalPrice}
              </span>
            </div>

            {/* Discount eligibility info */}
            {discountInfo.isDiscountAvailable && discountInfo.discount && !isDiscountActive() && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  💡 Add {discountInfo.discount.minParticipants - currentParticipantCount - billingDetails.numberOfPeople} more participants to qualify for the discount!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingForm;
