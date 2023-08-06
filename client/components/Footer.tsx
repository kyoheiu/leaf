import { MINI_LOGO_SIZE } from "@/components/Header";
import Image from "next/image";
import Link from "next/link";

export const FooterImage = () => {
  return (
    <Link href="/" className="my-6">
      <Image
        src="/logo.png"
        alt="leaf"
        height={MINI_LOGO_SIZE}
        width={MINI_LOGO_SIZE}
        className="mb-6"
      />
    </Link>
  );
};
