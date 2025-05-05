import Link from "next/link";
import { client } from "@/sanity/client";

const HOURS_QUERY = `*[_type == "hoursOfOperation"][0]`;

// Define types for the hours data to match new schema
type DayHours = {
  isClosed?: boolean;
  hours?: {
    open?: string;
    close?: string;
  };
};

type HoursData = {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
};

export default async function HoursPage() {
  const hoursData = await client.fetch<HoursData>(
    HOURS_QUERY,
    {},
    { next: { revalidate: 60 } }
  );

  // Helper function to format day's hours
  const formatDayHours = (day: DayHours | undefined) => {
    if (!day || day.isClosed) {
      return "Closed";
    }
    if (day.hours?.open && day.hours.close) {
      return `${day.hours.open} - ${day.hours.close}`;
    }
    return "Not specified";
  };

  const days = [
    { name: "Monday", data: hoursData?.monday },
    { name: "Tuesday", data: hoursData?.tuesday },
    { name: "Wednesday", data: hoursData?.wednesday },
    { name: "Thursday", data: hoursData?.thursday },
    { name: "Friday", data: hoursData?.friday },
    { name: "Saturday", data: hoursData?.saturday },
    { name: "Sunday", data: hoursData?.sunday },
  ];

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/" className="hover:underline">
        ← Back to home
      </Link>
      <h1 className="text-4xl font-bold mb-8">Hours of Operation</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="w-full">
          <div className="border-b-2 border-gray-200 flex">
            <div className="text-left py-2 font-bold w-1/2">Day</div>
            <div className="text-left py-2 font-bold w-1/2">Hours</div>
          </div>
          <div>
            {days.map((day) => (
              <div key={day.name} className="border-b border-gray-100 flex">
                <div className="py-3 font-medium w-1/2">{day.name}</div>
                <div className="py-3 w-1/2">{formatDayHours(day.data)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
