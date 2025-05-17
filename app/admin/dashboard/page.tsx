import EventContainer from "@/components/dashboard/EventContainer";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin");
  }

  return (
    // Applying Tailwind classes for the main flex layout
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-grow p-5">
        <EventContainer />
      </div>
    </div>
  );
}
