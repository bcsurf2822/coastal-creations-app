import EventContainer from "@/components/dashboard/EventContainer";
import Sidebar from "@/components/layout/nav/SideBar";

interface Event {
  id: string;
  name: string;
}

// Hardcoded list of events
const hardcodedEvents: Event[] = [
  { id: "1", name: "Team Meeting - 10:00 AM" },
  { id: "2", name: "Project Deadline - 2:00 PM" },
  { id: "3", name: "Client Call - 3:30 PM" },
  { id: "4", name: "Training Session - 4:00 PM" },
];

export default function DashboardPage() {
  return (
    // Applying Tailwind classes for the main flex layout
    <div className="flex min-h-screen bg-gray-100">
      {" "}
      {/* Added a base background color */}
      <Sidebar /> {/* Render the Sidebar component */}
      {/* Main content area: takes remaining space, adds padding */}
      <div className="flex-grow p-5">
        {/* Header with Welcome message */}
        <header className="bg-white p-5 mb-5 rounded-lg shadow-md">
          <h1 className="text-2xl text-gray-800 m-0">Welcome!</h1>
        </header>

        {/* Render the EventContainer and pass the initial events */}
        <EventContainer initialEvents={hardcodedEvents} />
      </div>
    </div>
  );
}
