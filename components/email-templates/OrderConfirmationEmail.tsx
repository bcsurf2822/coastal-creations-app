import * as React from "react";
import { Text } from "@react-email/components";
import {
  EmailShell,
  InfoCard,
  DetailRow,
  ReceiptButton,
  emailText,
  getStudioEmail,
} from "./shared";
import { formatCents } from "@/lib/utils/moneyHelpers";

export interface OrderConfirmationItem {
  name: string;
  variationName?: string;
  quantity: number;
  unitPriceCents: number;
}

export interface OrderConfirmationData {
  orderNumber: string;
  customerFirstName: string;
  customerEmail: string;
  items: OrderConfirmationItem[];
  subtotalCents: number;
  shippingCents: number;
  taxCents?: number;
  totalCents: number;
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince: string;
    postalCode: string;
  };
  shippingMethod: string;
  /** Square-hosted receipt link for this payment, when available. */
  receiptUrl?: string;
}

interface OrderConfirmationEmailProps {
  order: OrderConfirmationData;
}

export const OrderConfirmationEmail = ({
  order,
}: OrderConfirmationEmailProps) => (
  <EmailShell preview={`Order ${order.orderNumber} confirmed — Coastal Creations Studio`}>
    <Text style={emailText.badge}>✓ ORDER CONFIRMED</Text>
    <Text style={emailText.heroTitle}>Thanks for your order!</Text>
    <Text style={emailText.paragraph}>
      Hi {order.customerFirstName}, your order{" "}
      <strong>{order.orderNumber}</strong> has been placed and payment was
      received. We&apos;ll get your items packed and on their way soon!
    </Text>

    <InfoCard title="Order Summary">
      {order.items.map((item, i) => (
        <DetailRow
          key={i}
          label={`${item.quantity}×`}
        >
          {item.name}
          {item.variationName ? ` — ${item.variationName}` : ""}
          {"  "}
          <span style={{ color: "#64748b", fontSize: "13px" }}>
            ({formatCents(item.unitPriceCents)} ea)
          </span>
        </DetailRow>
      ))}
      <DetailRow label="Subtotal">{formatCents(order.subtotalCents)}</DetailRow>
      <DetailRow label="Shipping">{formatCents(order.shippingCents)}</DetailRow>
      {(order.taxCents ?? 0) > 0 && (
        <DetailRow label="Sales Tax">{formatCents(order.taxCents ?? 0)}</DetailRow>
      )}
      <DetailRow label="Total">
        <strong>{formatCents(order.totalCents)}</strong>
      </DetailRow>
    </InfoCard>

    <InfoCard title="Shipping To">
      <DetailRow label="Name">{order.shippingAddress.name}</DetailRow>
      <DetailRow label="Address">
        {order.shippingAddress.addressLine1}
        {order.shippingAddress.addressLine2
          ? `, ${order.shippingAddress.addressLine2}`
          : ""}
        <br />
        {order.shippingAddress.city}, {order.shippingAddress.stateProvince}{" "}
        {order.shippingAddress.postalCode}
      </DetailRow>
      <DetailRow label="Method">{order.shippingMethod}</DetailRow>
    </InfoCard>

    <ReceiptButton href={order.receiptUrl} />

    <Text style={emailText.subParagraph}>
      <strong>What&apos;s next?</strong> We&apos;ll email you a tracking number
      as soon as your order ships, so you can follow it to your door — no account
      needed.
    </Text>

    <Text style={emailText.subParagraph}>
      Questions about your order? Reply to this email or contact us at{" "}
      <a href={`mailto:${getStudioEmail()}`}>{getStudioEmail()}</a>.
    </Text>
  </EmailShell>
);

export default OrderConfirmationEmail;
