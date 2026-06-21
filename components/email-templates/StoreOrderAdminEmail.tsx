import * as React from "react";
import { Text, Button } from "@react-email/components";
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
  /** Shippo label PDF — present when the label was auto-created at checkout. */
  labelUrl?: string;
  trackingNumber?: string;
  /** true when auto-label failed and the merchant must create it manually in admin. */
  labelFailed?: boolean;
}

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export function StoreOrderAdminEmail({
  orderNumber,
  customer,
  items,
  subtotalCents,
  shippingCents,
  taxCents,
  totalCents,
  shippingAddress,
  shippingMethod,
  labelUrl,
  trackingNumber,
  labelFailed,
}: StoreOrderAdminEmailProps): React.ReactElement {
  return (
    <EmailShell preview={`New store order: ${orderNumber}`} showDisclaimer={false}>
      <Text style={emailText.heroTitle}>New store order received</Text>
      <Text style={emailText.paragraph}>
        Order <strong>{orderNumber}</strong> has been placed and payment confirmed.
      </Text>

      {labelUrl ? (
        <InfoCard title="Shipping Label — Ready to Print">
          <DetailRow label="Carrier">{shippingMethod}</DetailRow>
          {trackingNumber && <DetailRow label="Tracking">{trackingNumber}</DetailRow>}
          <tr>
            <td colSpan={2} style={{ paddingTop: "8px" }}>
              <Button
                href={labelUrl}
                style={{
                  display: "inline-block",
                  backgroundColor: "#0c4a6e",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 700,
                  padding: "12px 28px",
                  borderRadius: "8px",
                  textDecoration: "none",
                }}
              >
                Print Shipping Label (PDF) →
              </Button>
            </td>
          </tr>
        </InfoCard>
      ) : (
        <InfoCard title="Shipping Label — Action Needed">
          <tr>
            <td colSpan={2} style={{ color: "#b45309", fontSize: "14px", lineHeight: "21px" }}>
              {labelFailed
                ? "The label could not be created automatically. Open this order in the admin dashboard and tap “Create Shipping Label” to generate it."
                : "Label pending — check the order in the admin dashboard."}
            </td>
          </tr>
        </InfoCard>
      )}

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
        {(taxCents ?? 0) > 0 && (
          <DetailRow label="Sales Tax">{fmt(taxCents ?? 0)}</DetailRow>
        )}
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
