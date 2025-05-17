import EventForm from "@/components/dashboard/EventForm";
import Link from "next/link";
// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";
// import { authOptions } from "@/auth";

export default async function AddEvent() {
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   redirect("/admin");
  // }

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
