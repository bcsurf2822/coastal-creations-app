import * as React from "react";
import { Text } from "@react-email/components";
import {
  EmailShell,
  InfoCard,
  DetailRow,
  emailText,
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

    <Text style={emailText.subParagraph}>
      Questions about your order? Reply to this email or contact us at{" "}
      <a href="mailto:ashley@coastalcreationsstudio.com">
        ashley@coastalcreationsstudio.com
      </a>
      .
    </Text>
  </EmailShell>
);

export default OrderConfirmationEmail;
