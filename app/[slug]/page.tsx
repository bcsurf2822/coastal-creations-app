import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import Link from "next/link";
import Image from "next/image";
import { client } from "@/sanity/client";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const resolvedParams = await params;
  const slugSegments = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug
    : [resolvedParams.slug];

  // Use the second segment to determine if we should show the hours page
  // if (slugSegments.length > 1 && slugSegments[1] === "hours") {
  //   return HoursPage();
  // }

  // Continue with regular post page
  const post = await client.fetch<SanityDocument>(
    POST_QUERY,
    { slug: slugSegments[0] },
    options
  );

  // Check if post exists
  if (!post) {
    return (
      <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
        <Link href="/blog" className="hover:underline">
          ← Back to posts
        </Link>
        <h1 className="text-4xl font-bold mb-8">Post not found</h1>
        <p>
          The post you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
      </main>
    );
  }

  const postImageUrl = post.image
    ? urlFor(post.image)?.width(550).height(310).url()
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <main className="container mx-auto max-w-4xl px-6 py-12">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 text-black hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 font-semibold rounded-full shadow-lg hover:shadow-xl group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blog
          </Link>
        </div>

        {/* Main Content Card */}
        <article className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Hero Image */}
          {postImageUrl && (
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/10 to-teal-500/10">
              <Image
                src={postImageUrl}
                alt={post.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                priority
              />
            </div>
          )}

          {/* Content Section */}
          <div className="p-8 md:p-12">
            {/* Title */}
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-800 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <time className="font-medium">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            </div>

            {/* Article Body */}
            <div className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:text-slate-800 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-800 prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg">
              {Array.isArray(post.body) && <PortableText value={post.body} />}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
