import * as React from "react";
import { Text } from "@react-email/components";
import { EmailShell, InfoCard, DetailRow, emailText } from "./shared";

interface OrderItem {
  name: string;
  variationName?: string;
  quantity: number;
  unitPriceCents: number;
}

interface StoreOrderAdminEmailProps {
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
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

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export function StoreOrderAdminEmail({
  orderNumber,
  customer,
  items,
  subtotalCents,
  shippingCents,
  totalCents,
  shippingAddress,
  shippingMethod,
}: StoreOrderAdminEmailProps): React.ReactElement {
  return (
    <EmailShell preview={`New store order: ${orderNumber}`} showDisclaimer={false}>
      <Text style={emailText.heroTitle}>New store order received</Text>
      <Text style={emailText.paragraph}>
        Order <strong>{orderNumber}</strong> has been placed and payment confirmed.
      </Text>

      <InfoCard title="Customer">
        <DetailRow label="Name">{customer.firstName} {customer.lastName}</DetailRow>
        <DetailRow label="Email">{customer.email}</DetailRow>
        {customer.phone && <DetailRow label="Phone">{customer.phone}</DetailRow>}
      </InfoCard>

      <InfoCard title="Items Ordered">
        {items.map((item, i) => (
          <DetailRow key={i} label={item.variationName ? `${item.name} — ${item.variationName}` : item.name}>
            {item.quantity} × {fmt(item.unitPriceCents)} = {fmt(item.quantity * item.unitPriceCents)}
          </DetailRow>
        ))}
        <DetailRow label="Subtotal">{fmt(subtotalCents)}</DetailRow>
        <DetailRow label={`Shipping (${shippingMethod})`}>{fmt(shippingCents)}</DetailRow>
        <DetailRow label="Total"><strong>{fmt(totalCents)}</strong></DetailRow>
      </InfoCard>

      <InfoCard title="Ship To">
        <DetailRow label="Name">{shippingAddress.name}</DetailRow>
        <DetailRow label="Address">
          {shippingAddress.addressLine1}
          {shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""}
          {"\n"}{shippingAddress.city}, {shippingAddress.stateProvince} {shippingAddress.postalCode}
        </DetailRow>
      </InfoCard>
    </EmailShell>
  );
}

export default StoreOrderAdminEmail;
