import EventContainer from "@/components/dashboard/EventContainer";


export default async function DashboardPage() {


  return (

    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-grow p-5">
        <EventContainer />
      </div>
    </div>
  );
}
