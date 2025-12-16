"use client";

import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";
import { PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { useEventPictures } from "@/hooks/queries";

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default function EventPictures() {
  const {
    data: eventPictures = [],
    isLoading,
    error,
  } = useEventPictures();

  if (isLoading) {
    return <div className="text-center py-8">Loading event pictures...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error.message}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {eventPictures && eventPictures.length > 0 ? (
        eventPictures.map((picture, index) => {
          const imageUrl = picture.image
            ? urlFor(picture.image)?.width(800).height(600).url()
            : null;

          return (
            <div key={index} className="flex flex-col">
              {imageUrl && (
                <div className="flex justify-center">
                  <Image
                    src={imageUrl}
                    alt={picture.title || "Gallery image"}
                    className="rounded-xl shadow-lg object-cover h-64 w-full"
                    width={800}
                    height={600}
                  />
                </div>
              )}

              <h3 className="font-serif text-xl font-semibold text-primary mt-4">
                {picture.title}
              </h3>

              {picture.description && (
                <div className="prose mt-2">
                  {Array.isArray(picture.description) && (
                    <PortableText value={picture.description} />
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p>No gallery images available.</p>
      )}
    </div>
  );
}
