import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import LogoutButton from "@/components/authentication/LogoutButton";
import Sidebar from "@/components/dashboard/SideBar";

// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Dashboard | Coastal Creation Studios",
  description: "Admin Dashboard for Coastal Creation Studios",
};

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const session = getServerSession(authOptions);
  // if (!session) {
  //   redirect("/admin");
  // }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      <div className="min-h-screen bg-gray-50">
        {/* Admin header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <div>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main content with sidebar */}
        <div className="flex">
          <Sidebar />
          <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
