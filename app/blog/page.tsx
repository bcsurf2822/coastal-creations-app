import type { Metadata } from "next";
import Blog from "@/components/blog/Blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read the latest news, tips, and stories from Coastal Creations Studio in Ocean City, NJ.",
};

export default function BlogPage() {
  return <Blog />;
}
