import Link from "next/link";

export default function Sidebar() {
  return (
    // Applying Tailwind classes for styling
    <div className="w-64 bg-gray-900 text-white p-5 flex-shrink-0">
      <h2 className="text-center text-xl mb-8">Dashboard Nav</h2>
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
              href="/admin/dashboard/add-events"
              className="block p-3 rounded hover:bg-gray-700 transition-colors duration-300 ease-in-out"
            >
              Events
            </Link>
          </li>
          <li className="mb-3">
            <Link
              href="/admin/dashboard/reports"
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
