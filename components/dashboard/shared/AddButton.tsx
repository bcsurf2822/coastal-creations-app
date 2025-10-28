import Link from "next/link";
import { RiAddLine } from "react-icons/ri";

interface AddButtonProps {
  href: string;
  label: string;
}

export default function AddButton({ href, label }: AddButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
    >
      <RiAddLine className="w-5 h-5 mr-2" />
      {label}
    </Link>
  );
}
