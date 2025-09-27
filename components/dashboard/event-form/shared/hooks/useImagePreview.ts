import { useState, useEffect } from "react";

/**
 * Hook for generating preview URLs from File objects for real-time image previews.
 *
 * Creates object URLs for images and handles cleanup to prevent memory leaks.
 */
export const useImagePreview = (file?: File) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Cleanup function to revoke object URL
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return previewUrl;
};