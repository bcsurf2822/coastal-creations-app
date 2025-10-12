"use client";

import { ReactElement, useEffect, useRef } from "react";

interface InstagramPostPreviewProps {
  embedCode: string;
  className?: string;
}

/**
 * Extracts and cleans the blockquote HTML from Instagram embed code.
 * Based on Instagram's official embed implementation:
 * 1. Removes script tags (we load embed.js separately)
 * 2. Ensures https protocol is present in URLs
 */
const extractBlockquote = (embedCode: string): string => {
  // Remove script tags
  let cleaned = embedCode.replace(/<script[^>]*>.*?<\/script>/gi, "");

  // Fix missing https: protocol (common issue with Instagram embeds)
  cleaned = cleaned.replace(/src="\/\//g, 'src="https://');
  cleaned = cleaned.replace(/href="\/\//g, 'href="https://');

  return cleaned.trim();
};

const InstagramPostPreview = ({
  embedCode,
  className = "",
}: InstagramPostPreviewProps): ReactElement | null => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract and clean the blockquote (must be before hooks for early return)
  const cleanEmbedCode = embedCode ? extractBlockquote(embedCode) : "";

  // Debug: log the cleaned embed code
  useEffect(() => {
    if (cleanEmbedCode) {
      console.log("[InstagramPostPreview] Cleaned embed code:", cleanEmbedCode.substring(0, 200));
    }
  }, [cleanEmbedCode]);

  // Load script and process embeds when component mounts
  useEffect(() => {
    if (!embedCode || typeof window === "undefined") return;

    console.log("[InstagramPostPreview] Initializing Instagram embed");

    // Step 1: Load Instagram's embed.js if not already loaded
    const existingScript = document.querySelector(
      'script[src="https://www.instagram.com/embed.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = () => {
        console.log("[InstagramPostPreview] embed.js loaded");
      };
      document.body.appendChild(script);
    }
  }, [embedCode]);

  // Process embeds after the blockquote is definitely in the DOM
  useEffect(() => {
    if (!embedCode || typeof window === "undefined") return;

    // Wait for React to finish rendering the blockquote
    const timer = setTimeout(() => {
      const blockquote = containerRef.current?.querySelector('blockquote.instagram-media');

      if (!blockquote) {
        console.error("[InstagramPostPreview] Blockquote not found in DOM");
        return;
      }

      console.log("[InstagramPostPreview] Blockquote found in DOM, processing...");

      if (
        (
          window as unknown as {
            instgrm?: { Embeds?: { process?: () => void } };
          }
        ).instgrm?.Embeds?.process
      ) {
        console.log("[InstagramPostPreview] Calling instgrm.Embeds.process()");
        (
          window as unknown as {
            instgrm: { Embeds: { process: () => void } };
          }
        ).instgrm.Embeds.process();

        // Check if it worked after a delay
        setTimeout(() => {
          const iframe = containerRef.current?.querySelector('iframe');
          const stillBlockquote = containerRef.current?.querySelector('blockquote.instagram-media');

          if (iframe) {
            console.log("[InstagramPostPreview] ✓ Successfully transformed to iframe");
          } else if (stillBlockquote) {
            console.warn("[InstagramPostPreview] ✗ Blockquote not transformed. Instagram embed may not work in development or the post is private/deleted.");
          }
        }, 2000);
      } else {
        console.warn("[InstagramPostPreview] instgrm.Embeds.process not available yet, retrying...");
        // Retry after another delay if script is still loading
        setTimeout(() => {
          if (
            (
              window as unknown as {
                instgrm?: { Embeds?: { process?: () => void } };
              }
            ).instgrm?.Embeds?.process
          ) {
            console.log("[InstagramPostPreview] Retrying instgrm.Embeds.process()");
            (
              window as unknown as {
                instgrm: { Embeds: { process: () => void } };
              }
            ).instgrm.Embeds.process();
          }
        }, 1000);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [embedCode]);

  if (!embedCode) return null;

  return (
    <div
      ref={containerRef}
      className={`instagram-embed-container ${className}`}
      style={{
        maxWidth: "540px",
        margin: "0 auto",
      }}
    >
      <div
        dangerouslySetInnerHTML={{ __html: cleanEmbedCode }}
        className="instagram-post-embed"
      />

      <style jsx>{`
        .instagram-embed-container :global(blockquote.instagram-media) {
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          transition: all 0.3s ease !important;
          margin: 0 auto !important;
        }

        .instagram-embed-container:hover :global(blockquote.instagram-media) {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default InstagramPostPreview;
