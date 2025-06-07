import Link from "next/link";
import Image from "next/image";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { client } from "@/sanity/client";

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt, image}`;

const options = { next: { revalidate: 30 } };

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default async function Blog() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);


  return (
    <div className="min-h-screen ">
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-16">
              <h1
                className="font-bold text-5xl md:text-7xl text-primary mb-6"
                style={{ fontFamily: "Comic Neue", fontWeight: 700 }}
              >
                Blog
              </h1>

              <div className="w-24 h-1 bg-gradient-to-r from-primary to-teal-500 mx-auto mt-8 rounded-full"></div>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                const postImageUrl = post.image
                  ? urlFor(post.image)?.width(400).height(250).url()
                  : null;

                return (
                  <Link
                    href={`/${post.slug.current}`}
                    key={post._id}
                    className="group block"
                  >
                    <article className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] overflow-hidden border border-gray-100 h-full">
                      {/* Image Section */}
                      <div className="relative overflow-hidden h-48 bg-gradient-to-br from-primary/10 to-teal-500/10 rounded-t-2xl">
                        {postImageUrl ? (
                          <Image
                            src={postImageUrl}
                            alt={post.title}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6 flex flex-col justify-between min-h-[200px]">
                        <div>
                          <h2
                            className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 text-justify"
                            style={{
                              fontFamily: "Comic Neue",
                              fontWeight: 700,
                            }}
                          >
                            {post.title}
                          </h2>
                        </div>

                        {/* Date and Read More - always at bottom */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 bg-white">
                          <time className="text-sm font-bold text-black z-10">
                            {new Date(post.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </time>
                          <span className="text-sm font-bold text-black group-hover:text-primary transition-colors duration-300 flex items-center gap-1 z-10">
                            Read More
                            <svg
                              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>

            {/* Empty State */}
            {posts.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-teal-500/10 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-bold text-gray-800 mb-2"
                  style={{ fontFamily: "Comic Neue", fontWeight: 700 }}
                >
                  No Posts Yet
                </h3>
                <p
                  className="text-gray-600 text-lg max-w-md mx-auto text-justify"
                  style={{ fontFamily: "Comic Neue", fontWeight: 700 }}
                >
                  We&apos;re working on some amazing content. Check back soon !
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
