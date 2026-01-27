"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import Image from "next/image";
import LoginButton from "@/components/authentication/LoginButton";

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (session) {
      router.push("/admin/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-slate-50 to-cyan-50">
        <div className="flex items-center gap-2 text-slate-600">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-slate-50 to-cyan-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/assets/logos/coastalLogoFull.png"
            alt="Coastal Creations Studio"
            width={220}
            height={80}
            className="h-auto w-auto max-h-20"
            priority
          />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 mb-6" />

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 text-center">
              {error === "AccessDenied"
                ? "Access denied. Your email is not authorized."
                : "An error occurred during sign in."}
            </p>
          </div>
        )}

        {/* Login button */}
        <LoginButton callbackUrl="/admin/dashboard" />
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-slate-50 to-cyan-50">
      <div className="flex items-center gap-2 text-slate-600">
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Loading...</span>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
