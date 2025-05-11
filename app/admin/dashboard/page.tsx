import EventContainer from "@/components/dashboard/EventContainer";

export default function DashboardPage() {
  return (
    // Applying Tailwind classes for the main flex layout
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-grow p-5">
        <EventContainer />
      </div>
    </div>
  );
}
