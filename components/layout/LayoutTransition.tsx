"use client";

import { useEffect, type ReactNode, type ReactElement } from "react";
import { useSelectedLayoutSegment } from "next/navigation";

interface LayoutTransitionProps {
  children: ReactNode;
  className?: string;
}

const LayoutTransition = ({
  children,
  className,
}: LayoutTransitionProps): ReactElement => {
  const segment = useSelectedLayoutSegment();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [segment]);

  return (
    <div className={`min-h-screen ${className || ""}`}>
      {children}
    </div>
  );
};

export default LayoutTransition;
