import Link from "next/link";

export default function Sidebar() {
  return (
    // Applying Tailwind classes for styling
    <div className="w-64 h-screen bg-gray-900 text-white p-5 flex-shrink-0 sticky top-0">
      <nav>
        <ul className="list-none p-0 m-0">
          <li className="mb-3">
            <Link
              href="/admin/dashboard"
              className="block p-3 rounded hover:bg-gray-700 transition-colors duration-300 ease-in-out"
            >
              Home
            </Link>
          </li>

          <li className="mb-3">
            <Link
              href="/admin/dashboard/add-event"
              className="block p-3 rounded hover:bg-gray-700 transition-colors duration-300 ease-in-out"
            >
              Add Event
            </Link>
          </li>
          <li className="mb-3">
            <Link
              href="/admin/dashboard/add-event"
              className="block p-3 rounded hover:bg-gray-700 transition-colors duration-300 ease-in-out"
            >
              Class Details
            </Link>
          </li>
          <li className="mb-3">
            <Link
              href="/admin/dashboard"
              className="block p-3 rounded hover:bg-gray-700 transition-colors duration-300 ease-in-out"
            >
              Reports
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
