import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import Link from "next/link";
import Image from "next/image";
import { client } from "@/sanity/client";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;
const HOURS_QUERY = `*[_type == "hoursOfOperation"][0]`;
// const EVENT_PICTURE_QUERY = `*[_type == "eventPictureS"][0]`;
// // const GALLERY_QUERY = `*[_type == "gallery"][0]`;

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
  if (slugSegments.length > 1 && slugSegments[1] === "hours") {
    return HoursPage();
  }

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
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/blog" className="hover:underline">
        ← Back to posts
      </Link>
      {postImageUrl && (
        <Image
          src={postImageUrl}
          alt={post.title}
          className="aspect-video rounded-xl"
          width={550}
          height={310}
          priority
        />
      )}
      <h1 className="text-4xl font-bold mb-8">{post.title}</h1>
      <div className="prose">
        <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
        {Array.isArray(post.body) && <PortableText value={post.body} />}
      </div>
    </main>
  );
}

async function HoursPage() {
  const hoursData = await client.fetch<SanityDocument>(
    HOURS_QUERY,
    {},
    options
  );

  // Define type for day data to match new schema
  type DayHours = {
    isClosed?: boolean;
    hours?: {
      open?: string;
      close?: string;
    };
  };

  // Helper function to format day's hours
  const formatDayHours = (day: DayHours | undefined) => {
    if (!day || day.isClosed) {
      return "Closed";
    }
    if (day.hours?.open && day.hours.close) {
      return `${day.hours.open} - ${day.hours.close}`;
    }
    return "Not specified";
  };

  const days = [
    { name: "Monday", data: hoursData?.monday as DayHours },
    { name: "Tuesday", data: hoursData?.tuesday as DayHours },
    { name: "Wednesday", data: hoursData?.wednesday as DayHours },
    { name: "Thursday", data: hoursData?.thursday as DayHours },
    { name: "Friday", data: hoursData?.friday as DayHours },
    { name: "Saturday", data: hoursData?.saturday as DayHours },
    { name: "Sunday", data: hoursData?.sunday as DayHours },
  ];

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <h1 className="text-4xl font-bold mb-8">Hours of Operation</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="w-full">
          <div className="border-b-2 border-gray-200 flex">
            <div className="text-left py-2 font-bold w-1/2">Day</div>
            <div className="text-left py-2 font-bold w-1/2">Hours</div>
          </div>
          <div>
            {days.map((day) => (
              <div key={day.name} className="border-b border-gray-100 flex">
                <div className="py-3 font-medium w-1/2">{day.name}</div>
                <div className="py-3 w-1/2">{formatDayHours(day.data)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// export async function EventPicturePage() {
//   const eventPictureData = await client.fetch<SanityDocument>(
//     EVENT_PICTURE_QUERY,
//     {},
//     options
//   );

//   const imageUrl = eventPictureData?.image
//     ? urlFor(eventPictureData.image)?.width(800).height(500).url()
//     : null;

//   return (
//     <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
//       <h1 className="text-4xl font-bold mb-8">
//         {eventPictureData?.title || "Event Pictures"}
//       </h1>

//       {imageUrl && (
//         <Image
//           src={imageUrl}
//           alt={eventPictureData?.title || "Event Pictures"}
//           className="rounded-xl w-full h-auto"
//           width={800}
//           height={500}
//           priority
//         />
//       )}

//       {eventPictureData?.description && (
//         <div className="prose mt-4">
//           {Array.isArray(eventPictureData.description) && (
//             <PortableText value={eventPictureData.description} />
//           )}
//         </div>
//       )}
//     </main>
//   );
// }
