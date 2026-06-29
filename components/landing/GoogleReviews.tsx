import type { ReactElement } from "react";
import { getGoogleReviews } from "@/lib/google/reviews";
import type { PlacesReview } from "@/lib/google/reviews";

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

const GoogleReviews = async (): Promise<ReactElement> => {
  const reviews = await getGoogleReviews();

  return (
    <section id="google-reviews" className="bg-transparent py-10 md:py-16">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <GoogleIcon />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              Google Reviews
            </p>
          </div>
          <h2 className="mb-3 text-4xl font-bold text-primary md:text-5xl">
            What Our Guests Are Saying
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-0.5" aria-label="5 out of 5 stars average">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="h-5 w-5" viewBox="0 0 24 24" fill="#FBBC04" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
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
