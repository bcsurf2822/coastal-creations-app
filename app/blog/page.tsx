import Link from "next/link";
import { type SanityDocument } from "next-sanity";

import { client } from "@/sanity/client";

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt}`;

const options = { next: { revalidate: 30 } };

export default async function IndexPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-12">
              Blog
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  href={`/${post.slug.current}`}
                  key={post._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-3">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No blog posts available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
