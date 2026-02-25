import type { PortableTextContent } from "@/types/pageContent";

/**
 * Convert PortableText blocks to plain text
 * @param blocks - PortableText content from Sanity
 * @returns Plain text string
 */
export function portableTextToPlainText(
  blocks: PortableTextContent | string | undefined | null
): string {
  if (!blocks) return "";

  // Handle plain strings (e.g. saved before Portable Text conversion)
  if (typeof blocks === "string") return blocks;

  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) {
        return "";
      }
      return block.children.map((child) => child.text).join("");
    })
    .join("\n\n");
}
