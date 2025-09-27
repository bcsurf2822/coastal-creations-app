import AddReservationForm from "@/components/dashboard/reservation-form/AddReservationForm";
import Link from "next/link";

export default async function AddReservation() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div>
                  <Link
                    href="/admin/dashboard"
                    className="text-gray-400 hover:text-gray-500"
                  >
                    Dashboard
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-gray-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">
                    Add Reservation
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <AddReservationForm />
      </div>
    </div>
  );
}
