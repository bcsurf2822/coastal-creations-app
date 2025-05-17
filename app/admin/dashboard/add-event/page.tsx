import EventForm from "@/components/dashboard/EventForm";
import Link from "next/link";

export default async function AddEvent() {
  return (
    <div>
      <div className="mb-4">
        <Link
          href="/admin/dashboard"
          className="px-4 py-2  rounded hover:bg-gray-300"
        >
          Go Back
        </Link>
      </div>
      <EventForm />
    </div>
  );
}
