"use client";

import type { ReactElement } from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePaymentConfig } from "@/hooks/queries/use-payment-config";
import { ensureFreeOptions } from "@/lib/utils/optionHelpers";
import { buildSuccessUrl } from "@/lib/checkout/bookingFlow";
import { Button } from "@/components/ui";
import EventPreview from "@/components/payment/EventPreview";
import CheckoutLayout from "./CheckoutLayout";
import ContactForm, { type ContactFormValues } from "./ContactForm";
import PaymentStep from "./PaymentStep";
import EventSummary, { type SummaryLine } from "./EventSummary";
import EventParticipantsFields from "./EventParticipantsFields";
import GiftCardRedemption from "./GiftCardRedemption";
import type {
  EventOption,
  SelectedOption,
  CheckoutParticipant,
  AppliedGiftCard,
} from "./eventCheckoutTypes";

interface EventDetails {
  eventName: string;
  description: string;
  eventType: string;
  image?: string;
  dates?: {
    startDate: string;
    endDate?: string;
    isRecurring?: boolean;
    recurringPattern?: string;
    recurringEndDate?: string;
  };
  time?: { startTime: string; endTime?: string };
}

interface DiscountInfo {
  isDiscountAvailable: boolean;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    minParticipants: number;
    description?: string;
  };
}

const EMPTY_CONTACT: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

function blankParticipant(options: EventOption[]): CheckoutParticipant {
  return {
    firstName: "",
    lastName: "",
    selectedOptions: options.map((o) => ({
      categoryName: o.categoryName,
      choiceName: "",
    })),
  };
}

export default function EventCheckout(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: paymentConfig } = usePaymentConfig();

  const eventId = searchParams.get("eventId") || "";
  const eventTitle = searchParams.get("eventTitle") || "";
  const eventPrice = searchParams.get("price") || "";
  const isPrivateEvent = searchParams.get("isPrivateEvent") === "true";
  const isFreeEvent = searchParams.get("isFree") === "true" || eventPrice === "0";

  const [contact, setContact] = useState<ContactFormValues>(EMPTY_CONTACT);
  const [quantity, setQuantity] = useState(1);
  const [isSigningUpForSelf, setIsSigningUpForSelf] = useState(true);
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [selfSelectedOptions, setSelfSelectedOptions] = useState<SelectedOption[]>([]);
  const [participants, setParticipants] = useState<CheckoutParticipant[]>([]);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo>({ isDiscountAvailable: false });

  const [appliedGiftCard, setAppliedGiftCard] = useState<AppliedGiftCard | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // One stable idempotency key per mount — reused across retries of THIS attempt.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const basePriceCents = useMemo(() => {
    const n = parseFloat(eventPrice.replace(/[^\d.]/g, ""));
    return Number.isNaN(n) ? null : Math.round(n * 100);
  }, [eventPrice]);
  const isPriceAvailable = isFreeEvent || basePriceCents !== null;

  // --- Load event details, options, discount ---
  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      try {
        const url = isPrivateEvent
          ? `/api/private-events/${eventId}`
          : `/api/event/${eventId}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const eventData = isPrivateEvent ? data.privateEvent : data.event;
        if (!eventData || cancelled) return;

        if (eventData.options?.length > 0) {
          setEventOptions(ensureFreeOptions(eventData.options) as EventOption[]);
        }
        if (!isPrivateEvent && eventData.isDiscountAvailable && eventData.discount) {
          setDiscountInfo({
            isDiscountAvailable: true,
            discount: eventData.discount,
          });
        }
        setEventDetails({
          eventName: eventData.eventName || eventTitle,
          description: eventData.description || "",
          eventType: eventData.eventType || "",
          image: eventData.image,
          dates: eventData.dates,
          time: eventData.time,
        });
      } catch (err) {
        console.error("[EVENT-CHECKOUT] Failed to load event:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId, isPrivateEvent, eventTitle]);

  // --- Initialize the registrant's option selections when options load ---
  useEffect(() => {
    setSelfSelectedOptions(
      eventOptions.map((o) => ({ categoryName: o.categoryName, choiceName: "" }))
    );
  }, [eventOptions]);

  // --- Keep the participants array in sync with quantity / who-it's-for ---
  useEffect(() => {
    const count = isSigningUpForSelf ? Math.max(0, quantity - 1) : quantity;
    setParticipants(Array.from({ length: count }, () => blankParticipant(eventOptions)));
  }, [quantity, isSigningUpForSelf, eventOptions]);

  // --- Pricing ---
  const choicePriceCents = useCallback(
    (categoryName: string, choiceName: string): number => {
      const opt = eventOptions.find((o) => o.categoryName === categoryName);
      const choice = opt?.choices.find((c) => c.name === choiceName);
      return choice?.price ? Math.round(choice.price * 100) : 0;
    },
    [eventOptions]
  );

  const discountActive =
    discountInfo.isDiscountAvailable &&
    !!discountInfo.discount &&
    quantity >= discountInfo.discount.minParticipants;

  const perPersonCents = useMemo(() => {
    const base = basePriceCents ?? 0;
    if (!discountActive || !discountInfo.discount) return base;
    return discountInfo.discount.type === "percentage"
      ? Math.round(base * (1 - discountInfo.discount.value / 100))
      : Math.max(0, base - Math.round(discountInfo.discount.value * 100));
  }, [basePriceCents, discountActive, discountInfo]);

  const optionLines: SummaryLine[] = useMemo(() => {
    const lines: SummaryLine[] = [];
    const collect = (opts: SelectedOption[]): void => {
      for (const s of opts) {
        const c = choicePriceCents(s.categoryName, s.choiceName);
        if (c > 0) lines.push({ label: `${s.categoryName}: ${s.choiceName}`, amountCents: c });
      }
    };
    if (isSigningUpForSelf) collect(selfSelectedOptions);
    participants.forEach((p) => collect(p.selectedOptions));
    return lines;
  }, [isSigningUpForSelf, selfSelectedOptions, participants, choicePriceCents]);

  const registrationCents = perPersonCents * quantity;
  const optionsCents = optionLines.reduce((sum, l) => sum + l.amountCents, 0);
  const totalCents = registrationCents + optionsCents;

  // Gift card: clamp to the current total (the server re-validates + clamps too).
  const giftCardCents = appliedGiftCard
    ? Math.min(appliedGiftCard.amountApplied, totalCents)
    : 0;
  const amountDueCents = Math.max(0, totalCents - giftCardCents);

  // --- Validation ---
  const allOptionsChosen = useCallback(
    (opts: SelectedOption[]): boolean =>
      eventOptions.every((cat) =>
        opts.some((s) => s.categoryName === cat.categoryName && s.choiceName.trim() !== "")
      ),
    [eventOptions]
  );

  const formValid =
    contact.firstName.trim() !== "" &&
    contact.lastName.trim() !== "" &&
    contact.email.trim() !== "" &&
    contact.phone.trim() !== "" &&
    participants.every((p) => p.firstName.trim() !== "" && p.lastName.trim() !== "") &&
    (!isSigningUpForSelf || allOptionsChosen(selfSelectedOptions)) &&
    participants.every((p) => allOptionsChosen(p.selectedOptions));

  // --- Handlers ---
  const updateContact = (field: keyof ContactFormValues, value: string): void =>
    setContact((prev) => ({ ...prev, [field]: value }));

  const updateSelfOption = (categoryName: string, choiceName: string): void =>
    setSelfSelectedOptions((prev) => {
      const next = prev.filter((s) => s.categoryName !== categoryName);
      next.push({ categoryName, choiceName });
      return next;
    });

  const updateParticipantName = (
    index: number,
    field: "firstName" | "lastName",
    value: string
  ): void =>
    setParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );

  const updateParticipantOption = (
    index: number,
    categoryName: string,
    choiceName: string
  ): void =>
    setParticipants((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p;
        const opts = p.selectedOptions.filter((s) => s.categoryName !== categoryName);
        opts.push({ categoryName, choiceName });
        return { ...p, selectedOptions: opts };
      })
    );

  // --- Submit ---
  const submitBooking = useCallback(
    async (paymentToken?: string): Promise<void> => {
      setIsProcessing(true);
      setError(null);
      try {
        const res = await fetch("/api/checkout/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentToken,
            idempotencyKey,
            contact,
            booking: {
              eventId,
              eventType: isPrivateEvent ? "PrivateEvent" : "Event",
              quantity,
              isSigningUpForSelf,
              selectedOptions: isSigningUpForSelf ? selfSelectedOptions : [],
              participants: participants.map((p) => ({
                firstName: p.firstName,
                lastName: p.lastName,
                selectedOptions: p.selectedOptions,
              })),
              giftCard: appliedGiftCard
                ? { giftCardId: appliedGiftCard.giftCardId, amountCents: giftCardCents }
                : undefined,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error ?? "Payment failed. Please try again.");
          setIsProcessing(false);
          return;
        }
        router.push(
          buildSuccessUrl({
            paymentId: data.squarePaymentId,
            firstName: contact.firstName,
            lastName: contact.lastName,
            eventTitle: eventDetails?.eventName || eventTitle,
            eventId,
            amount: (totalCents / 100).toFixed(2),
            paymentMethod: paymentToken ? "card" : "free",
            email: contact.email,
            phone: contact.phone,
            numberOfPeople: quantity,
            totalPrice: (totalCents / 100).toFixed(2),
          })
        );
      } catch (err) {
        console.error("[EVENT-CHECKOUT] Submit error:", err);
        setError("Network error. Please try again.");
        setIsProcessing(false);
      }
    },
    [
      idempotencyKey, contact, eventId, isPrivateEvent, quantity, isSigningUpForSelf,
      selfSelectedOptions, participants, router, eventDetails, eventTitle, totalCents,
      appliedGiftCard, giftCardCents,
    ]
  );

  if (!isPriceAvailable) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <p className="text-lg mb-4">
          To register for this event, please contact us directly.
        </p>
        <a
          href={`mailto:${process.env.NEXT_PUBLIC_STUDIO_EMAIL || "info@coastalcreationsstudio.com"}`}
          className="text-[var(--color-secondary)] underline"
        >
          Email us
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <CheckoutLayout
        summary={
          <EventSummary
            eventName={eventDetails?.eventName || eventTitle}
            registrationLabel={`Registration × ${quantity}`}
            registrationCents={registrationCents}
            optionLines={optionLines}
            giftCardCents={giftCardCents}
            discountApplied={discountActive}
            totalCents={amountDueCents}
          />
        }
      >
        {eventDetails && (
          <EventPreview
            eventTitle={eventDetails.eventName || eventTitle}
            description={eventDetails.description}
            image={eventDetails.image}
            dates={eventDetails.dates}
            time={eventDetails.time}
            formattedPrice={(perPersonCents / 100).toFixed(2)}
            isPriceAvailable={isPriceAvailable}
            originalPrice={eventPrice}
            discountInfo={discountInfo}
            numberOfPeople={quantity}
          />
        )}

        <section className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-[var(--color-primary)]">
            Registration details
          </h2>
          <EventParticipantsFields
            quantity={quantity}
            onQuantityChange={setQuantity}
            isSigningUpForSelf={isSigningUpForSelf}
            onSelfChange={setIsSigningUpForSelf}
            eventOptions={eventOptions}
            selfSelectedOptions={selfSelectedOptions}
            onSelfOptionChange={updateSelfOption}
            participants={participants}
            onParticipantNameChange={updateParticipantName}
            onParticipantOptionChange={updateParticipantOption}
          />
        </section>

        <hr className="border-0 border-t border-[var(--color-border-lighter)]" />

        <section className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-[var(--color-primary)]">
            Your contact information
          </h2>
          <ContactForm values={contact} onChange={updateContact} disabled={isProcessing} />
        </section>

        <hr className="border-0 border-t border-[var(--color-border-lighter)]" />

        <section className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-[var(--color-primary)]">Payment</h2>
          {isFreeEvent ? (
            <>
              {error && (
                <p className="text-[var(--color-error)] text-sm bg-red-50 border border-red-200 rounded-[var(--radius-md)] px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                variant="primary"
                disabled={!formValid || isProcessing}
                onClick={() => void submitBooking()}
              >
                {isProcessing ? "Registering…" : "Register for event"}
              </Button>
            </>
          ) : (
            <>
              {/* Gift card — apply before paying; reduces the card amount due. */}
              <GiftCardRedemption
                totalAmount={totalCents}
                appliedCard={appliedGiftCard}
                onApply={setAppliedGiftCard}
                onRemove={() => setAppliedGiftCard(null)}
              />

              {amountDueCents <= 0 && appliedGiftCard ? (
                <>
                  {error && (
                    <p className="text-[var(--color-error)] text-sm bg-red-50 border border-red-200 rounded-[var(--radius-md)] px-3 py-2">
                      {error}
                    </p>
                  )}
                  <Button
                    variant="primary"
                    disabled={!formValid || isProcessing}
                    onClick={() => void submitBooking()}
                  >
                    {isProcessing ? "Completing…" : "Complete booking with gift card"}
                  </Button>
                </>
              ) : paymentConfig ? (
                <PaymentStep
                  applicationId={paymentConfig.applicationId}
                  locationId={paymentConfig.locationId}
                  amountDollars={(amountDueCents / 100).toFixed(2)}
                  ready={formValid}
                  onToken={submitBooking}
                  isProcessing={isProcessing}
                  error={error}
                />
              ) : (
                <div className="rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border-lighter)] px-4 py-6 text-center text-sm text-[var(--color-text-subtle)]">
                  Loading secure payment…
                </div>
              )}
            </>
          )}
        </section>
      </CheckoutLayout>
    </div>
  );
}
