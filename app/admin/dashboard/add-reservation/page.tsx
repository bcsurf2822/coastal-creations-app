import AddReservationForm from "@/components/dashboard/reservation-form/AddReservationForm";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default async function AddReservation() {
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
      <AddReservationForm />
    </div>
  );
}
