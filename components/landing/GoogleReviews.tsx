import type { ReactElement } from "react";
import { getGoogleReviews } from "@/lib/google/reviews";
import type { PlacesReview } from "@/lib/google/reviews";

const StarRating = ({ rating }: { rating: number }): ReactElement => (
  <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill={i < rating ? "#FBBC04" : "#e2e8f0"}
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const GoogleIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const ReviewCard = ({ review }: { review: PlacesReview }): ReactElement => (
  <article className="flex min-w-[82vw] flex-shrink-0 snap-start flex-col rounded-[1.5rem] border border-white/65 bg-white/80 p-5 shadow-[var(--shadow-review-card)] backdrop-blur-[2px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-review-card-hover)] sm:min-w-[72vw] md:min-w-0">
    <div className="mb-3 flex items-center gap-3">
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: review.avatarColor }}
        aria-hidden="true"
      >
        {review.initials}
      </div>
      <div>
        <p className="text-sm font-semibold text-primary">{review.name}</p>
        <p className="text-xs text-slate-400">{review.date}</p>
      </div>
    </div>
    <StarRating rating={review.rating} />
    <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
      &ldquo;{review.text}&rdquo;
    </p>
    <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3">
      <GoogleIcon />
      <span className="text-xs text-slate-400">Posted on Google</span>
    </div>
  </article>
);

const WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${
  process.env.GOOGLE_PLACE_ID ?? "ChIJreLuJwzrwIkRzL7k9yS2olw"
}`;

const GoogleReviews = async (): Promise<ReactElement> => {
  const reviews = await getGoogleReviews();

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
              <GoogleIcon />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                Google Reviews
              </p>
            </div>
            <h2 className="mb-3 text-4xl font-bold text-primary md:text-5xl">
              What Our Guests Are Saying
            </h2>
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <div className="flex gap-0.5" aria-label="5 out of 5 stars average">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="h-5 w-5" viewBox="0 0 24 24" fill="#FBBC04" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-600">5.0 on Google</span>
            </div>
          </div>

          <a
            href={WRITE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Leave a Review
          </a>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-visible md:pb-0 md:snap-none lg:grid-cols-3 xl:grid-cols-5">
          {reviews.map((review) => (
            <ReviewCard key={review.name} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
