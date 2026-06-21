import type { ReactElement } from "react";
import Link from "next/link";
import { requireUserPage } from "@/lib/auth/guards";
import { getMyBookings } from "@/lib/account/queries";
import type { ICustomer } from "@/lib/models/Customer";
import { Badge } from "@/components/ui/shadcn/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";

function bookingId(booking: ICustomer): string {
  return String((booking as unknown as { _id: unknown })._id);
}

function formatDates(booking: ICustomer): string {
  if (!booking.selectedDates || booking.selectedDates.length === 0) {
    return "—";
  }
  return booking.selectedDates
    .map((entry) => new Date(entry.date).toLocaleDateString())
    .join(", ");
}

export default async function MyBookingsPage(): Promise<ReactElement> {
  const user = await requireUserPage();
  const bookings = await getMyBookings(user.email);

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No bookings yet.{" "}
          <Link
            href="/events/classes-workshops"
            className="text-primary hover:underline"
          >
            Explore classes &amp; workshops
          </Link>
          .
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">My Bookings</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {bookings.map((booking) => {
          const showRefund =
            booking.refundStatus && booking.refundStatus !== "none";
          return (
            <Card key={bookingId(booking)}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    {booking.eventType}
                  </CardTitle>
                  {showRefund ? (
                    <Badge
                      variant="outline"
                      className="border-red-200 bg-red-100 capitalize text-red-800"
                    >
                      {booking.refundStatus} refund
                    </Badge>
                  ) : null}
                </div>
                <CardDescription>
                  Booked {new Date(booking.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date(s)</span>
                  <span className="text-right">{formatDates(booking)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participants</span>
                  <span>{booking.participants.length}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-foreground">
                    {`$${booking.total.toFixed(2)}`}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
