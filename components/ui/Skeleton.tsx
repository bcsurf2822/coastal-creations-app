import type { ReactElement } from "react";

export interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  className?: string;
}

const variantClasses: Record<string, string> = {
  text: "rounded-md",
  circular: "rounded-full",
  rectangular: "rounded-sm",
  rounded: "rounded-xl",
};

const Skeleton = ({
  variant = "rectangular",
  width,
  height,
  className = "",
}: SkeletonProps): ReactElement => {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`animate-pulse bg-gray-200 ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export { Skeleton };
