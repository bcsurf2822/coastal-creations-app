import Link from "next/link";
import { RiAddLine } from "react-icons/ri";
import { Button } from "@/components/ui";

interface AddButtonProps {
  href: string;
  label: string;
}

export default function AddButton({ href, label }: AddButtonProps) {
  return (
    <Link href={href}>
      <Button variant="primary" size="md" leftIcon={<RiAddLine className="w-5 h-5" />}>
        {label}
      </Button>
    </Link>
  );
}
