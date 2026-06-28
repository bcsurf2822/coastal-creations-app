import type { ReactElement } from "react";
import { EB_Garamond } from "next/font/google";
import { getGoogleReviews, type GoogleReview } from "@/lib/google/reviews";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const GOOGLE_MAPS_URL =
  process.env.GOOGLE_MAPS_PLACE_URL ??
  "https://www.google.com/maps/search/Coastal+Creations+Studio+Ocean+City+NJ";

const StarRating = ({ rating }: { rating: number }): ReactElement => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-amber-400" : "text-slate-200"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const GoogleLogo = (): ReactElement => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const ReviewCard = ({ review }: { review: GoogleReview }): ReactElement => (
  <div className="flex flex-col rounded-xl border border-sky-100 bg-white p-5 shadow-[0_4px_16px_rgba(12,74,110,0.08)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(12,74,110,0.14)]">
    <div className="mb-3 flex items-center gap-3">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-700 text-sm font-bold text-white">
        {review.author_name.charAt(0)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">{review.author_name}</p>
        <p className="text-xs text-slate-400">{review.relative_time_description}</p>
      </div>
      <div className="ml-auto flex-shrink-0">
        <GoogleLogo />
      </div>
    </div>

    <StarRating rating={review.rating} />

    <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-slate-600">{review.text}</p>
  </div>
);

const GoogleReviews = async (): Promise<ReactElement> => {
  const reviews = await getGoogleReviews();
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <section id="google-reviews" className="bg-transparent py-10 md:py-16">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/65 bg-white/74 p-6 shadow-[0_14px_28px_rgba(12,74,110,0.1)] backdrop-blur-[2px] md:p-8">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <GoogleLogo />
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                  Google Reviews
                </p>
              </div>
              <h2
                className={`${ebGaramond.className} mb-3 text-4xl font-bold text-primary md:text-5xl`}
              >
                What Our Customers Say
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-amber-400">{avgRating}</span>
                <StarRating rating={5} />
                <span className="text-sm text-slate-500">({reviews.length} reviews)</span>
              </div>
            </div>

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-sky-200 bg-white px-5 py-2.5 text-sm font-semibold text-secondary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              Read all reviews
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Review grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
