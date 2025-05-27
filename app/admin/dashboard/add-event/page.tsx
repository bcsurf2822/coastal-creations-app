import EventForm from "@/components/dashboard/add-event/EventForm";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default async function AddEvent() {
  return (
    <div>
      <div className="mb-4">
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 rounded hover:text-gray-500 cursor-pointer flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Go Back
        </Link>
      </div>
      <EventForm />
    </div>
  );
}
