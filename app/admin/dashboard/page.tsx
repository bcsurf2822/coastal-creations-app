import EventContainer from "@/components/dashboard/EventContainer";
import Sidebar from "@/components/layout/nav/SideBar";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin");
  }
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

        {/* Render the EventContainer component */}
        <EventContainer />
      </div>
    </div>
  );
}
