import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
  let session = null;
  if (process.env.NODE_ENV !== "development") {
    session = await getServerSession(authOptions);
    if (!session) {
      redirect("/admin");
    }
  }

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}
    >
      {/* Admin header */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight cursor-pointer">
                Coastal Creations Studio
                <span className="block text-lg font-medium text-gray-600 dark:text-gray-300">Admin Dashboard</span>
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Home Page
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content with sidebar */}
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-200">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
