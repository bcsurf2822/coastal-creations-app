// components/AnalyticsEvents.jsx
'use client'; // This directive marks it as a Client Component

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageview } from '../lib/gtag'; // Adjust path if lib is elsewhere

export default function AnalyticsEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Combine pathname and searchParams to get the full URL path
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    pageview(url);
  }, [pathname, searchParams]); // Re-run pageview when path or query params change

  // This component doesn't render any visible UI
  return null;
}