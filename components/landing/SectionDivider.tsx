import type { ReactElement } from "react";
import Image from "next/image";

const SectionDivider = (): ReactElement => {
  return (
    <div
      className="pointer-events-none relative mx-auto flex w-full max-w-[var(--container-max)] items-center justify-center px-4 py-0 sm:px-6 lg:px-8"
      aria-hidden="true"
    >
      <Image
        src="/assets/svg/page-break/waes.svg"
        alt=""
        width={500}
        height={500}
        className="mx-auto h-28 w-full object-contain opacity-50 sm:h-40"
      />
    </div>
  );
};

export default SectionDivider;
