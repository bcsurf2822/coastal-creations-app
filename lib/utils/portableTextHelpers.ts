import type { PortableTextContent } from "@/types/pageContent";

/**
 * Convert PortableText blocks to plain text
 * @param blocks - PortableText content from Sanity
 * @returns Plain text string
 */
export function portableTextToPlainText(
  blocks: PortableTextContent | undefined | null
): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) {
        return "";
      }
      return block.children.map((child) => child.text).join("");
    })
    .join("\n\n");
}
